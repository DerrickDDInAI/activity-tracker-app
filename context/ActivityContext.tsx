import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Activity, ActivityRecord, ActivityContextType, NotificationConfig } from '@/types/activity';
import { setupNotifications } from '@/utils/notifications';
import { generateUUID } from '@/utils/uuid';
import { validateActivity, validateActivityRecord, validateNotificationConfig } from '@/utils/activityUtils';

const ACTIVITIES_STORAGE_KEY = '@activities';
const RECORDS_STORAGE_KEY = '@activity_records';

export const ActivityContext = createContext<ActivityContextType | null>(null);

export function useActivities(): ActivityContextType {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}

interface ErrorState {
  message: string;
  timestamp: number;
}

export const ActivityProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<ErrorState | null>(null);

  // Memoized sorted records for better performance
  const sortedRecords = useMemo(() => 
    [...activityRecords].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ), [activityRecords]
  );

  // Error handling utility
  const handleError = useCallback((error: unknown, context: string): string => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${context}:`, message);
    setLastError({ message, timestamp: Date.now() });
    return message;
  }, []);

  // Validate data before saving
  const validateData = useCallback((): boolean => {
    try {
      activities.forEach(validateActivity);
      activityRecords.forEach(validateActivityRecord);
      return true;
    } catch (err) {
      handleError(err, 'Data validation failed');
      return false;
    }
  }, [activities, activityRecords, handleError]);

  // Enhanced persistence with validation
  const persistData = useCallback(async (): Promise<void> => {
    if (isLoading || !validateData()) return;

    try {
      await Promise.all([
        AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities)),
        AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(activityRecords))
      ]);
    } catch (err) {
      handleError(err, 'Failed to persist data');
    }
  }, [activities, activityRecords, isLoading, validateData, handleError]);

  // Initialize context
  useEffect(() => {
    let mounted = true;

    const initialize = async (): Promise<void> => {
      try {
        const [activitiesData, recordsData] = await Promise.all([
          AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY),
          AsyncStorage.getItem(RECORDS_STORAGE_KEY)
        ]);

        if (!mounted) return;

        if (activitiesData) {
          try {
            const parsedActivities = JSON.parse(activitiesData);
            if (Array.isArray(parsedActivities)) {
              setActivities(parsedActivities);
            }
          } catch (err) {
            handleError(err, 'Failed to parse activities');
            setActivities([]);
          }
        }

        if (recordsData) {
          try {
            const parsedRecords = JSON.parse(recordsData);
            if (Array.isArray(parsedRecords)) {
              setActivityRecords(parsedRecords);
            }
          } catch (err) {
            handleError(err, 'Failed to parse records');
            setActivityRecords([]);
          }
        }

        await setupNotifications();
        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          const errorMessage = handleError(err, 'Initialization failed');
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    initialize();
    return () => { mounted = false; };
  }, [handleError]);

  // Debounced persistence
  useEffect(() => {
    const timeoutId = setTimeout(persistData, 1000);
    return () => clearTimeout(timeoutId);
  }, [persistData]);

  // Schedule notification for an activity
  const scheduleNotification = useCallback(async (activity: Activity): Promise<void> => {
    if (Platform.OS === 'web' || !activity.notificationConfig?.enabled) return;

    try {
      if (activity.lastNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
      }

      const { hours = 0, minutes = 0, seconds = 0 } = activity.notificationConfig;
      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

      if (!activity.lastTracked) return;

      const lastTrackedDate = new Date(activity.lastTracked);
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - lastTrackedDate.getTime()) / 1000);
      
      if (elapsedSeconds < totalSeconds) {
        const remainingSeconds = totalSeconds - elapsedSeconds;
        const message = activity.notificationConfig.customMessage ?? 
                       `Time to check your activity "${activity.name}"`;

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Activity Reminder',
            body: `${message} (${formatElapsedTime(totalSeconds * 1000)})`,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: 'timeInterval',
            seconds: remainingSeconds,
            repeats: false
          } as Notifications.NotificationTriggerInput,
        });

        setActivities(prev =>
          prev.map(a =>
            a.id === activity.id
              ? { ...a, lastNotificationId: notificationId }
              : a
          )
        );
      }
    } catch (err) {
      handleError(err, 'Failed to schedule notification');
    }
  }, [handleError]);

  // Helper function to format elapsed time
  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Enhanced addActivity with validation
  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    try {
      const newActivity: Activity = {
        ...activity,
        id: generateUUID(),
      };
      
      validateActivity(newActivity);
      
      setActivities(prev => [...prev, newActivity]);

      if (newActivity.notificationConfig?.enabled) {
        scheduleNotification(newActivity).catch(err => 
          handleError(err, `Failed to schedule notification for ${newActivity.name}`)
        );
      }
    } catch (err) {
      handleError(err, 'Failed to add activity');
    }
  }, [handleError]);

  // Enhanced updateActivity with validation
  const updateActivity = useCallback((updatedActivity: Activity) => {
    try {
      validateActivity(updatedActivity);
      
      setActivities(prev =>
        prev.map(activity =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );

      if (updatedActivity.notificationConfig?.enabled) {
        scheduleNotification(updatedActivity).catch(err =>
          handleError(err, `Failed to update notification for ${updatedActivity.name}`)
        );
      }
    } catch (err) {
      handleError(err, 'Failed to update activity');
    }
  }, [handleError]);

  // Update notification configuration
  const updateNotificationConfig = useCallback(async (activityId: string, config: NotificationConfig) => {
    try {
      validateNotificationConfig(config);
      
      const activity = activities.find(a => a.id === activityId);
      if (!activity) {
        throw new Error('Activity not found');
      }

      const updatedActivity = { ...activity, notificationConfig: config };
      setActivities(prev =>
        prev.map(a => (a.id === activityId ? updatedActivity : a))
      );

      if (config.enabled) {
        await scheduleNotification(updatedActivity);
      } else if (activity.lastNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
      }
    } catch (err) {
      handleError(err, 'Failed to update notification config');
    }
  }, [activities, handleError]);

  // Persist data with debouncing
  useEffect(() => {
    if (isLoading) return;

    const saveData = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities)),
          AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(activityRecords))
        ]);
      } catch (err) {
        console.error('Error saving data:', err);
      }
    };

    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [activities, activityRecords, isLoading]);

  // Get the latest record for an activity
  const getLatestRecord = (activityId: string) => {
    return activityRecords
      .filter(record => record.activityId === activityId)
      .sort((a, b) => {
        const aTime = a.endTimestamp || a.timestamp;
        const bTime = b.endTimestamp || b.timestamp;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })[0];
  };

  // Delete an activity
  const deleteActivity = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (activity?.lastNotificationId && Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
    }
    
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
    setActivityRecords((prev) => prev.filter((record) => record.activityId !== id));
  };

  // Delete a single record
  const deleteRecord = (id: string) => {
    setActivityRecords((prev) => prev.filter((record) => record.id !== id));
  };

  // Delete multiple records
  const deleteSelectedRecords = (ids: string[]) => {
    setActivityRecords((prev) => prev.filter((record) => !ids.includes(record.id)));
  };

  // Track an activity (create a new record)
  const trackActivity = async (id: string, customTimestamp?: Date) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const timestamp = customTimestamp ? customTimestamp.toISOString() : new Date().toISOString();
    
    if (activity.lastTracked && new Date(activity.lastTracked).getTime() > new Date(timestamp).getTime()) {
      handleError(new Error('Cannot track activity to an earlier time'), 'Track Activity');
      return;
    }

    const newRecord: ActivityRecord = {
      id: generateUUID(),
      activityId: id,
      timestamp,
      type: 'manual',
    };

    setActivityRecords(prev => [...prev, newRecord]);
    setActivities(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, lastTracked: timestamp }
          : a
      )
    );

    // Reschedule notification if needed
    if (activity.notificationConfig?.enabled) {
      await scheduleNotification(activity);
    }
  };

  // Stop tracking an activity (update the end time of the latest record)
  const stopTracking = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const latestRecord = getLatestRecord(id);
    if (!latestRecord) return;

    const updatedRecord: ActivityRecord = {
      ...latestRecord,
      endTimestamp: new Date().toISOString(),
    };

    setActivityRecords(prev =>
      prev.map(record =>
        record.id === latestRecord.id ? updatedRecord : record
      )
    );

    // Update activity's lastTracked time
    setActivities(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, lastTracked: updatedRecord.endTimestamp }
          : a
      )
    );

    // Reschedule notification if needed
    if (activity.notificationConfig?.enabled) {
      await scheduleNotification(activity);
    }
  };

  // Clear all activities and records
  const clearAllActivities = async () => {
    try {
      await AsyncStorage.multiRemove([ACTIVITIES_STORAGE_KEY, RECORDS_STORAGE_KEY]);
      setActivities([]);
      setActivityRecords([]);
    } catch (err) {
      handleError(err, 'Failed to clear activities');
    }
  };

  // Add a manual duration record for an activity
  const addManualDurationRecord = useCallback(async (
    activityId: string,
    startTime: Date,
    endTime: Date,
    note?: string
  ) => {
    try {
      if (endTime.getTime() <= startTime.getTime()) {
        throw new Error('End time must be after start time');
      }

      const activity = activities.find(a => a.id === activityId);
      if (!activity) {
        throw new Error('Activity not found');
      }

      const newRecord: ActivityRecord = {
        id: generateUUID(),
        activityId,
        timestamp: startTime.toISOString(),
        endTimestamp: endTime.toISOString(),
        type: 'manual',
        note
      };

      validateActivityRecord(newRecord);

      setActivityRecords(prev => [...prev, newRecord]);
      setActivities(prev =>
        prev.map(a =>
          a.id === activityId
            ? { ...a, lastTracked: endTime.toISOString() }
            : a
        )
      );

      // Reschedule notification if needed
      if (activity.notificationConfig?.enabled) {
        await scheduleNotification(activity);
      }
    } catch (err) {
      handleError(err, 'Failed to add manual duration record');
    }
  }, [activities, handleError, scheduleNotification]);

  const contextValue = useMemo((): ActivityContextType => ({
    activities,
    activityRecords: sortedRecords,
    isLoading,
    lastError,
    addActivity,
    updateActivity,
    deleteActivity,
    trackActivity,
    stopTracking,
    clearAllActivities,
    deleteRecord,
    deleteSelectedRecords,
    getLatestRecord,
    addManualDurationRecord,
    updateNotificationConfig,
  }), [
    activities,
    sortedRecords,
    isLoading,
    lastError,
    addActivity,
    updateActivity,
    deleteActivity,
    trackActivity,
    stopTracking,
    clearAllActivities,
    deleteRecord,
    deleteSelectedRecords,
    getLatestRecord,
    addManualDurationRecord,
    updateNotificationConfig,
  ]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
          Error: {error}
        </Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>
          Please try restarting the app. If the problem persists, contact support.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};