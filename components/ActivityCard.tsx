import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { getLightColor, getActivityIcon, formatTimeSince, formatDuration } from '@/utils/activityUtils';
import { useActivities } from '@/context/ActivityContext';
import type { Activity } from '@/context/ActivityContext';
import { Trash2, Bell, BellOff } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import ReminderSettingsModal from './ReminderSettingsModal';

type ActivityCardProps = {
  activity: Activity;
  onPress: () => void;
  onLongPress: () => void;
};

const ActivityCard = ({ activity, onPress, onLongPress }: ActivityCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [timeElapsed, setTimeElapsed] = useState('');
  const [reminderSettingsVisible, setReminderSettingsVisible] = useState(false);
  const { getLatestRecord, deleteActivity, trackActivity, stopTracking, updateNotificationConfig } = useActivities();
  
  const ActivityIcon = getActivityIcon(activity.icon);
  
  useEffect(() => {
    const updateTime = () => {
      if (activity.isTracking && activity.trackingStartTime) {
        // For active duration activities, show elapsed time since start
        const duration = Date.now() - new Date(activity.trackingStartTime).getTime();
        setTimeElapsed(formatDuration(duration));
      } else {
        const latestRecord = getLatestRecord(activity.id);
        if (latestRecord) {
          if (latestRecord.endTimestamp) {
            // For completed duration activities, show time since end
            setTimeElapsed(formatTimeSince(new Date(latestRecord.endTimestamp)));
          } else {
            // For instant activities or incomplete records
            setTimeElapsed(formatTimeSince(new Date(latestRecord.timestamp)));
          }
        } else {
          setTimeElapsed('Never tracked');
        }
      }
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [activity.id, activity.isTracking, activity.trackingStartTime, getLatestRecord]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (activity.type === 'duration') {
      if (activity.isTracking) {
        stopTracking(activity.id);
      } else {
        trackActivity(activity.id);
      }
    } else {
      trackActivity(activity.id);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${activity.name}"? This will also delete all records for this activity.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteActivity(activity.id),
        },
      ]
    );
  };

  const formatReminderTime = (config: { hours: number; minutes: number; seconds: number }) => {
    const parts = [];
    if (config.hours > 0) parts.push(`${config.hours}h`);
    if (config.minutes > 0) parts.push(`${config.minutes}m`);
    if (config.seconds > 0 || parts.length === 0) parts.push(`${config.seconds}s`);
    return parts.join(' ');
  };

  const handleNotificationToggle = async () => {
    if (Platform.OS === 'web') return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to use this feature.'
        );
        return;
      }
    }

    // Toggle notification state
    updateNotificationConfig(activity.id, {
      enabled: !activity.notificationConfig?.enabled,
      hours: activity.notificationConfig?.hours || 0,
      minutes: activity.notificationConfig?.minutes || 10,
      seconds: activity.notificationConfig?.seconds || 0,
      customMessage: activity.notificationConfig?.customMessage,
    });
  };

  const handleBellLongPress = () => {
    if (Platform.OS === 'web') return;
    setReminderSettingsVisible(true);
  };

  const handleReminderSettingsSave = (config: { 
    enabled: boolean; 
    hours: number; 
    minutes: number; 
    seconds: number; 
    customMessage?: string 
  }) => {
    updateNotificationConfig(activity.id, config);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isDark && styles.containerDark,
        { transform: [{ scale: scaleAnim }] }
      ]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark 
              ? activity.color 
              : getLightColor(activity.color)
          }
        ]}
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ActivityIcon size={28} color={activity.color} />
          </View>
          <View style={styles.headerButtons}>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationToggle}
                onLongPress={handleBellLongPress}
                delayLongPress={500}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                {activity.notificationConfig?.enabled ? (
                  <Bell size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                ) : (
                  <BellOff size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Trash2 size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {activity.name}
        </Text>
        <Text style={styles.lastTracked} numberOfLines={2}>
          {activity.isTracking ? 'Duration: ' : ''}{timeElapsed}
          {activity.notificationConfig?.enabled && (
            `\nReminder in: ${formatReminderTime(activity.notificationConfig)}`
          )}
        </Text>
        {activity.type === 'duration' && (
          <View style={[
            styles.statusIndicator,
            activity.isTracking && styles.statusIndicatorActive
          ]}>
            <Text style={styles.statusText}>
              {activity.isTracking ? 'Active' : 'Tap to Start'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <ReminderSettingsModal
        visible={reminderSettingsVisible}
        onClose={() => setReminderSettingsVisible(false)}
        activityName={activity.name}
        notificationConfig={activity.notificationConfig || null}
        onSave={handleReminderSettingsSave}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  containerDark: {
    shadowOpacity: 0.2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  lastTracked: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 4,
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusIndicatorActive: {
    backgroundColor: '#4CD964',
  },
  statusText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
});

export default ActivityCard;