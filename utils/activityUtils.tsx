import React from 'react';
import { Utensils, Bed, FileWarning as Running, Book, Tv, Laptop, Coffee, Pill, ShowerHead as Shower, Heart, Music, Gamepad, Clock } from 'lucide-react-native';
import { Activity, ActivityRecord, ActivityType, NotificationConfig } from '@/types/activity';
import { isValidDate } from './dateUtils';
import { ACTIVITY_COLORS, ACTIVITY_ICONS } from '@/constants/activities';

// Get a light version of a color for use in light mode
export const getLightColor = (color: string): string => {
  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);
  
  // Lighten the color by mixing with white
  r = Math.floor(r + (255 - r) * 0.7);
  g = Math.floor(g + (255 - g) * 0.7);
  b = Math.floor(b + (255 - b) * 0.7);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get the corresponding icon component for an activity
export const getActivityIcon = (iconName: string) => {
  switch (iconName) {
    case 'utensils':
      return Utensils;
    case 'bed':
      return Bed;
    case 'running':
      return Running;
    case 'book':
      return Book;
    case 'tv':
      return Tv;
    case 'laptop':
      return Laptop;
    case 'coffee':
      return Coffee;
    case 'pill':
      return Pill;
    case 'shower':
      return Shower;
    case 'heart':
      return Heart;
    case 'music':
      return Music;
    case 'gamepad':
      return Gamepad;
    default:
      return Clock;
  }
};

// Format a duration in milliseconds to a human-readable string
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// Format time since a given date to a human-readable string
export const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'Just now';
};

export class ActivityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityValidationError';
  }
}

export function validateActivity(activity: Partial<Activity>): void {
  if (!activity.name?.trim()) {
    throw new ActivityValidationError('Activity name is required');
  }

  if (!activity.type || !['instant', 'duration'].includes(activity.type)) {
    throw new ActivityValidationError('Invalid activity type');
  }

  if (!activity.color || !ACTIVITY_COLORS.includes(activity.color)) {
    throw new ActivityValidationError('Invalid activity color');
  }

  if (!activity.icon || !ACTIVITY_ICONS.some(icon => icon.id === activity.icon)) {
    throw new ActivityValidationError('Invalid activity icon');
  }

  if (activity.trackingStartTime && !isValidDate(activity.trackingStartTime)) {
    throw new ActivityValidationError('Invalid tracking start time');
  }

  if (activity.lastTracked && !isValidDate(activity.lastTracked)) {
    throw new ActivityValidationError('Invalid last tracked time');
  }
}

export function validateActivityRecord(record: Partial<ActivityRecord>): void {
  if (!record.activityId) {
    throw new ActivityValidationError('Activity ID is required for record');
  }

  if (!record.timestamp || !isValidDate(record.timestamp)) {
    throw new ActivityValidationError('Valid timestamp is required for record');
  }

  if (record.endTimestamp && !isValidDate(record.endTimestamp)) {
    throw new ActivityValidationError('Invalid end timestamp');
  }

  if (record.endTimestamp && record.timestamp) {
    const start = new Date(record.timestamp).getTime();
    const end = new Date(record.endTimestamp).getTime();
    if (end <= start) {
      throw new ActivityValidationError('End time must be after start time');
    }
  }

  if (record.duration && record.duration < 0) {
    throw new ActivityValidationError('Duration cannot be negative');
  }
}

export function validateNotificationConfig(config: Partial<NotificationConfig>): void {
  if (typeof config.enabled !== 'boolean') {
    throw new ActivityValidationError('Notification enabled status must be boolean');
  }

  const hours = config.hours ?? 0;
  const minutes = config.minutes ?? 0;
  const seconds = config.seconds ?? 0;

  if (hours < 0 || hours > 24) {
    throw new ActivityValidationError('Hours must be between 0 and 24');
  }

  if (minutes < 0 || minutes > 59) {
    throw new ActivityValidationError('Minutes must be between 0 and 59');
  }

  if (seconds < 0 || seconds > 59) {
    throw new ActivityValidationError('Seconds must be between 0 and 59');
  }

  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  if (totalSeconds === 0) {
    throw new ActivityValidationError('Reminder time cannot be zero');
  }
}

export function getActivityDurationStats(records: ActivityRecord[]): {
  total: number;
  average: number;
  shortest: number;
  longest: number;
} {
  const durations = records
    .filter(r => typeof r.duration === 'number' && r.duration > 0)
    .map(r => r.duration as number);

  if (durations.length === 0) {
    return { total: 0, average: 0, shortest: 0, longest: 0 };
  }

  const total = durations.reduce((sum, d) => sum + d, 0);
  
  return {
    total,
    average: total / durations.length,
    shortest: Math.min(...durations),
    longest: Math.max(...durations)
  };
}

export function getActivityStreak(records: ActivityRecord[]): number {
  if (records.length === 0) return 0;

  const sortedDates = records
    .map(r => new Date(r.timestamp).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  let streak = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const expectedPrevDay = currentDate - (24 * 60 * 60 * 1000);
    if (sortedDates[i] === expectedPrevDay) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break;
    }
  }

  return streak;
}

export function suggestNextActivity(
  activities: Activity[],
  records: ActivityRecord[]
): Activity | null {
  if (activities.length === 0) return null;

  // Get activities not tracked today
  const today = new Date().setHours(0, 0, 0, 0);
  const notTrackedToday = activities.filter(activity => {
    const lastRecord = records
      .filter(r => r.activityId === activity.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastRecord) return true;
    
    const lastTrackedDate = new Date(lastRecord.timestamp).setHours(0, 0, 0, 0);
    return lastTrackedDate < today;
  });

  if (notTrackedToday.length === 0) return null;

  // Sort by last tracked time (oldest first)
  return notTrackedToday.sort((a, b) => {
    const aTime = a.lastTracked ? new Date(a.lastTracked).getTime() : 0;
    const bTime = b.lastTracked ? new Date(b.lastTracked).getTime() : 0;
    return aTime - bTime;
  })[0];
}