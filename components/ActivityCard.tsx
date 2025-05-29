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
import { Trash2, Bell, BellOff } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

const ActivityCard = ({ activity, onPress, onLongPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [timeElapsed, setTimeElapsed] = useState('');
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

  const handleNotificationToggle = async () => {
    if (Platform.OS === 'web') return;

    if (!activity.notificationConfig?.enabled) {
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

      // Show time picker alert
      Alert.prompt(
        'Set Reminder Time',
        'Enter time in seconds',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: (seconds) => {
              const secondsNum = parseInt(seconds, 10);
              if (!isNaN(secondsNum) && secondsNum > 0) {
                updateNotificationConfig(activity.id, {
                  enabled: true,
                  seconds: secondsNum,
                });
              }
            },
          },
        ],
        'plain-text',
        activity.notificationConfig?.seconds?.toString() || '3600'
      );
    } else {
      // Disable notifications
      updateNotificationConfig(activity.id, {
        enabled: false,
        seconds: activity.notificationConfig.seconds,
      });
    }
  };

  const formatReminderTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
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
            `\nReminder: ${formatReminderTime(activity.notificationConfig.seconds)}`
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