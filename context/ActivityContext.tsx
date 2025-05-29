import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '@/utils/uuid';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Define types
type ActivityType = 'instant' | 'duration';

type NotificationConfig = {
  enabled: boolean;
  seconds: number;
};

type Activity = {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: ActivityType;
  lastTracked?: string;
  isTracking?: boolean;
  trackingStartTime?: string;
  notificationConfig?: NotificationConfig;
  lastNotificationId?: string;
};

type ActivityRecord = {
  id: string;
  activityId: string;
  timestamp: string;
  endTimestamp?: string;
  duration?: number; // Duration in milliseconds
};

type ActivityContextType = {
  activities: Activity[];
  activityRecords: ActivityRecord[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  trackActivity: (id: string, customTimestamp?: Date) => void;
  stopTracking: (id: string, customEndTimestamp?: Date) => void;
  clearAllActivities: () => void;
  deleteRecord: (id: string) => void;
  deleteSelectedRecords: (ids: string[]) => void;
  getLatestRecord: (activityId: string) => ActivityRecord | undefined;
  addManualDurationRecord: (activityId: string, startTime: Date, endTime: Date) => void;
  updateNotificationConfig: (activityId: string, config: NotificationConfig) => void;
};

// Create context
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Storage keys
const ACTIVITIES_STORAGE_KEY = '@activity_tracker_activities';
const RECORDS_STORAGE_KEY = '@activity_tracker_records';

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Schedule notification for an activity
  const scheduleNotification = async (activity: Activity) => {
    if (Platform.OS === 'web' || !activity.notificationConfig?.enabled) return;

    // Cancel existing notification if any
    if (activity.lastNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
    }

    const trigger = new Date();
    trigger.setSeconds(trigger.getSeconds() + activity.notificationConfig.seconds);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Activity Reminder',
        body: `It's been ${Math.floor(activity.notificationConfig.seconds / 3600)}h ${Math.floor((activity.notificationConfig.seconds % 3600) / 60)}m ${activity.notificationConfig.seconds % 60}s since you last tracked "${activity.name}"`,
      },
      trigger,
    });

    // Update activity with new notification ID
    setActivities(prev =>
      prev.map(a =>
        a.id === activity.id
          ? { ...a, lastNotificationId: notificationId }
          : a
      )
    );
  };

  // Update notification configuration
  const updateNotificationConfig = async (activityId: string, config: NotificationConfig) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const updatedActivity = { ...activity, notificationConfig: config };
    setActivities(prev =>
      prev.map(a => (a.id === activityId ? updatedActivity : a))
    );

    if (config.enabled) {
      await scheduleNotification(updatedActivity);
    } else if (activity.lastNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
    }
  };

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const activitiesJson = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
        const recordsJson = await AsyncStorage.getItem(RECORDS_STORAGE_KEY);
        
        if (activitiesJson) {
          setActivities(JSON.parse(activitiesJson));
        }
        
        if (recordsJson) {
          setActivityRecords(JSON.parse(recordsJson));
        }
      } catch (error) {
        console.error('Error loading data from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Save activities to storage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveActivities = async () => {
      try {
        await AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving activities to storage:', error);
      }
    };
    
    saveActivities();
  }, [activities, isLoaded]);

  // Save records to storage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveRecords = async () => {
      try {
        await AsyncStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(activityRecords));
      } catch (error) {
        console.error('Error saving records to storage:', error);
      }
    };
    
    saveRecords();
  }, [activityRecords, isLoaded]);

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

  // Add a new activity
  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateUUID(),
    };
    
    setActivities((prev) => [...prev, newActivity]);

    if (newActivity.notificationConfig?.enabled) {
      scheduleNotification(newActivity);
    }
  };

  // Update an existing activity
  const updateActivity = (updatedActivity: Activity) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );

    if (updatedActivity.notificationConfig?.enabled) {
      scheduleNotification(updatedActivity);
    }
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
    
    if (activity.type === 'duration') {
      // For duration activities, start tracking
      setActivities(prev => 
        prev.map(a => 
          a.id === id 
            ? { ...a, isTracking: true, trackingStartTime: timestamp }
            : a
        )
      );
    } else {
      // For instant activities, create record immediately
      const newRecord: ActivityRecord = {
        id: generateUUID(),
        activityId: id,
        timestamp,
      };
      
      setActivityRecords(prev => [...prev, newRecord]);
      setActivities(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, lastTracked: timestamp }
            : a
        )
      );

      // Schedule notification if enabled
      if (activity.notificationConfig?.enabled) {
        await scheduleNotification(activity);
      }
    }
  };

  // Stop tracking an activity
  const stopTracking = async (id: string, customEndTimestamp?: Date) => {
    const activity = activities.find(a => a.id === id);
    if (!activity || !activity.isTracking || !activity.trackingStartTime) return;

    const endTimestamp = customEndTimestamp ? customEndTimestamp.toISOString() : new Date().toISOString();
    const startTime = new Date(activity.trackingStartTime).getTime();
    const endTime = new Date(endTimestamp).getTime();
    const duration = endTime - startTime;

    const newRecord: ActivityRecord = {
      id: generateUUID(),
      activityId: id,
      timestamp: activity.trackingStartTime,
      endTimestamp,
      duration,
    };

    setActivityRecords(prev => [...prev, newRecord]);
    setActivities(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, isTracking: false, trackingStartTime: undefined, lastTracked: endTimestamp }
          : a
      )
    );

    // Schedule notification if enabled
    if (activity.notificationConfig?.enabled) {
      await scheduleNotification(activity);
    }
  };

  // Add a manual duration record
  const addManualDurationRecord = async (activityId: string, startTime: Date, endTime: Date) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    const duration = endTime.getTime() - startTime.getTime();
    
    const newRecord: ActivityRecord = {
      id: generateUUID(),
      activityId,
      timestamp: startTime.toISOString(),
      endTimestamp: endTime.toISOString(),
      duration,
    };

    setActivityRecords(prev => [...prev, newRecord]);
    setActivities(prev =>
      prev.map(a =>
        a.id === activityId
          ? { ...a, lastTracked: endTime.toISOString() }
          : a
      )
    );

    // Schedule notification if enabled
    if (activity.notificationConfig?.enabled) {
      await scheduleNotification(activity);
    }
  };

  // Clear all activities and records
  const clearAllActivities = async () => {
    // Cancel all notifications
    if (Platform.OS !== 'web') {
      for (const activity of activities) {
        if (activity.lastNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(activity.lastNotificationId);
        }
      }
    }
    
    setActivityRecords([]);
    setActivities([]);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        activityRecords,
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
      }}>
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook to use the activity context
export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};