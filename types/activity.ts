export interface NotificationConfig {
  enabled: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  customMessage?: string;
}

export type ActivityType = 'instant' | 'duration';
export type ActivityIconId = string;
export type ActivityColor = string;

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  color: ActivityColor;
  icon: ActivityIconId;
  isTracking?: boolean;
  trackingStartTime?: string;
  lastTracked?: string;
  lastNotificationId?: string;
  notificationConfig?: NotificationConfig;
}

export interface ActivityRecord {
  id: string;
  activityId: string;
  timestamp: string;
  endTimestamp?: string;
  duration?: number;
  type?: 'manual' | 'automatic';
  note?: string;
}

export interface ErrorState {
  message: string;
  timestamp: number;
}

export interface ActivityContextType {
  activities: Activity[];
  activityRecords: ActivityRecord[];
  isLoading: boolean;
  lastError: ErrorState | null;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => Promise<void>;
  trackActivity: (id: string, customTimestamp?: Date) => Promise<void>;
  stopTracking: (id: string, customEndTimestamp?: Date) => Promise<void>;
  clearAllActivities: () => Promise<void>;
  deleteRecord: (id: string) => void;
  deleteSelectedRecords: (ids: string[]) => void;
  getLatestRecord: (activityId: string) => ActivityRecord | undefined;
  addManualDurationRecord: (activityId: string, startTime: Date, endTime: Date, note?: string) => Promise<void>;
  updateNotificationConfig: (activityId: string, config: NotificationConfig) => Promise<void>;
}