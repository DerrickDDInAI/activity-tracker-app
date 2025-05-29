import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Dimensions,
} from 'react-native';
import { useActivities } from '@/context/ActivityContext';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval,
} from 'date-fns';

export default function StatsScreen() {
  const { activities, activityRecords } = useActivities();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyActivityCounts = daysInWeek.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      return {
        date: format(day, 'EEE'),
        count: activityRecords.filter((record) => {
          const recordDate = new Date(record.timestamp);
          return isWithinInterval(recordDate, { start: dayStart, end: dayEnd });
        }).length,
      };
    });

    const activityCounts = activities.map((activity) => ({
      name: activity.name,
      count: activityRecords.filter(
        (record) => record.activityId === activity.id
      ).length,
      color: activity.color,
    }));

    return (
      <>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Weekly Activity Overview
          </Text>
          <View style={[styles.chartContainer, isDark && styles.chartContainerDark]}>
            {weeklyActivityCounts.map((day) => (
              <View key={day.date} style={styles.dayBar}>
                <View style={styles.barLabelContainer}>
                  <Text style={[styles.barLabel, isDark && styles.textDark]}>
                    {day.date}
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${(day.count / Math.max(...weeklyActivityCounts.map(d => d.count)) || 1) * 100}%` },
                    ]}
                  />
                  <Text style={[styles.barValue, isDark && styles.textDark]}>
                    {day.count}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Activity Distribution
          </Text>
          <View style={[styles.chartContainer, isDark && styles.chartContainerDark]}>
            {activityCounts.map((activity) => (
              <View key={activity.name} style={styles.activityBar}>
                <View
                  style={[
                    styles.activityColor,
                    { backgroundColor: activity.color },
                  ]}
                />
                <Text style={[styles.activityName, isDark && styles.textDark]}>
                  {activity.name}
                </Text>
                <Text style={[styles.activityCount, isDark && styles.textDark]}>
                  {activity.count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Quick Stats
          </Text>
          <View style={[styles.statsGrid, isDark && styles.statsGridDark]}>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {activityRecords.length}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textDark]}>
                Total Records
              </Text>
            </View>
            <View style={[styles.statCard, isDark && styles.statCardDark]}>
              <Text style={[styles.statNumber, isDark && styles.textDark]}>
                {activities.length}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textDark]}>
                Activities
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {renderStats()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartContainerDark: {
    backgroundColor: '#1C1C1E',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statCardDark: {
    backgroundColor: '#1C1C1E',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabelContainer: {
    width: 40,
  },
  barLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginRight: 8,
  },
  barValue: {
    fontSize: 14,
    color: '#8E8E93',
    width: 30,
  },
  activityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  activityName: {
    flex: 1,
    fontSize: 16,
  },
  activityCount: {
    fontSize: 16,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
});