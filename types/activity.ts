export interface NotificationConfig {
  enabled: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  customMessage?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: 'instant' | 'duration';
  icon: string;
  color: string;
  notificationConfig?: NotificationConfig;
  isTracking?: boolean;
  trackingStartTime?: string;
  lastTracked?: string;
  lastNotificationId?: string;
}

export interface ActivityRecord {
  id: string;
  activityId: string;
  timestamp: string;
  endTimestamp?: string;
  duration?: number;
}

export interface ActivityContextType {
  activities: Activity[];
  activityRecords: ActivityRecord[];
  isLoading: boolean;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => Promise<void>;
  trackActivity: (id: string, customTimestamp?: Date) => Promise<void>;
  stopTracking: (id: string, customEndTimestamp?: Date) => Promise<void>;
  clearAllActivities: () => Promise<void>;
  deleteRecord: (id: string) => void;
  deleteSelectedRecords: (ids: string[]) => void;
  getLatestRecord: (activityId: string) => ActivityRecord | undefined;
  addManualDurationRecord: (activityId: string, startTime: Date, endTime: Date) => Promise<void>;
  updateNotificationConfig: (activityId: string, config: NotificationConfig) => Promise<void>;
}