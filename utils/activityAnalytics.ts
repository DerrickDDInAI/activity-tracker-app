import { Activity, ActivityRecord, ActivityFilter } from '@/types/activity';
import { isValidDate, validateDateRange } from './dateUtils';

export interface ActivityStats {
  totalDuration: number;
  recordCount: number;
  averageDuration: number;
  longestSession: number;
  shortestSession: number;
  lastTracked: string | null;
  streak: number;
  completionRate: number;
}

export interface ActivityTrend {
  day: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
}

export function filterActivities(
  activities: Activity[],
  records: ActivityRecord[],
  filter: ActivityFilter
): ActivityRecord[] {
  return records.filter(record => {
    // Filter by activity
    if (filter.activityId && record.activityId !== filter.activityId) {
      return false;
    }

    // Filter by type
    if (filter.type) {
      const activity = activities.find(a => a.id === record.activityId);
      if (!activity || activity.type !== filter.type) {
        return false;
      }
    }

    // Filter by date range
    const recordDate = new Date(record.timestamp);
    if (filter.startDate && recordDate < filter.startDate) {
      return false;
    }
    if (filter.endDate && recordDate > filter.endDate) {
      return false;
    }

    return true;
  });
}

export function getActivityStatistics(
  activity: Activity,
  records: ActivityRecord[]
): ActivityStats {
  const activityRecords = records.filter(r => r.activityId === activity.id);
  const now = new Date();
  let streak = 0;
  let lastTracked: string | null = null;
  let completionRate = 0;

  if (activityRecords.length > 0) {
    // Sort records by date
    const sortedRecords = activityRecords.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    lastTracked = sortedRecords[0].timestamp;

    // Calculate streak
    let currentDate = new Date(sortedRecords[0].timestamp);
    currentDate.setHours(0, 0, 0, 0);
    let expectedDate = currentDate.getTime();

    for (const record of sortedRecords) {
      const recordDate = new Date(record.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      const recordTime = recordDate.getTime();

      if (recordTime === expectedDate) {
        streak++;
        expectedDate -= 24 * 60 * 60 * 1000; // Subtract one day
      } else {
        break;
      }
    }

    // Calculate durations for duration-type activities
    const durations = activityRecords
      .filter(r => r.duration !== undefined)
      .map(r => r.duration as number);

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;
    const longestSession = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestSession = durations.length > 0 ? Math.min(...durations) : 0;

    // Calculate completion rate (records in last 7 days / 7)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recordsLastWeek = activityRecords.filter(
      r => new Date(r.timestamp) > oneWeekAgo
    );
    completionRate = recordsLastWeek.length / 7;

    return {
      totalDuration,
      recordCount: activityRecords.length,
      averageDuration,
      longestSession,
      shortestSession,
      lastTracked,
      streak,
      completionRate
    };
  }

  return {
    totalDuration: 0,
    recordCount: 0,
    averageDuration: 0,
    longestSession: 0,
    shortestSession: 0,
    lastTracked,
    streak,
    completionRate
  };
}

export function getActivityTrends(
  activity: Activity,
  records: ActivityRecord[],
  days: number = 30
): ActivityTrend[] {
  const trends: ActivityTrend[] = [];
  const now = new Date();
  const activityRecords = records.filter(r => r.activityId === activity.id);

  // Create a map for quick lookup
  const recordsByDay = new Map<string, ActivityRecord[]>();

  // Group records by day
  activityRecords.forEach(record => {
    const date = new Date(record.timestamp);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!recordsByDay.has(dayKey)) {
      recordsByDay.set(dayKey, []);
    }
    recordsByDay.get(dayKey)?.push(record);
  });

  // Generate trends for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    
    const dayRecords = recordsByDay.get(dayKey) || [];
    const durations = dayRecords
      .filter(r => r.duration !== undefined)
      .map(r => r.duration as number);
    
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;

    trends.push({
      day: dayKey,
      count: dayRecords.length,
      totalDuration,
      averageDuration
    });
  }

  return trends.reverse(); // Return in chronological order
}

export function getMostProductiveTime(
  activity: Activity,
  records: ActivityRecord[]
): { hour: number; count: number }[] {
  const hourCounts = new Array(24).fill(0);
  const activityRecords = records.filter(r => r.activityId === activity.id);

  activityRecords.forEach(record => {
    const date = new Date(record.timestamp);
    const hour = date.getHours();
    hourCounts[hour]++;
  });

  return hourCounts.map((count, hour) => ({ hour, count }));
}

export function getActivitySuggestions(
  activities: Activity[],
  records: ActivityRecord[]
): Activity[] {
  const now = new Date();
  const suggestions: Activity[] = [];

  activities.forEach(activity => {
    const stats = getActivityStatistics(activity, records);
    
    // Suggest activities not done today
    const lastTrackedDate = stats.lastTracked 
      ? new Date(stats.lastTracked).setHours(0, 0, 0, 0)
      : null;
    const today = now.setHours(0, 0, 0, 0);

    if (!lastTrackedDate || lastTrackedDate < today) {
      suggestions.push(activity);
    }
  });

  // Sort by last tracked (oldest first)
  return suggestions.sort((a, b) => {
    const aStats = getActivityStatistics(a, records);
    const bStats = getActivityStatistics(b, records);
    
    const aTime = aStats.lastTracked ? new Date(aStats.lastTracked).getTime() : 0;
    const bTime = bStats.lastTracked ? new Date(bStats.lastTracked).getTime() : 0;
    
    return aTime - bTime;
  });
}
