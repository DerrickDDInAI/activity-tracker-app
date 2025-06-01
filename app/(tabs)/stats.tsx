import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useActivities } from '../../context/ActivityContext';
import {
  getActivityStatistics,
  getActivityTrends,
  getMostProductiveTime,
  ActivityStats,
  ActivityTrend
} from '../../utils/activityAnalytics';
import { formatDuration } from '../../utils/dateUtils';
import EmptyState from '../../components/EmptyState';
import { BarChart2, Clock, Award, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 200;

export default function StatsScreen() {
  const { activities, activityRecords } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState(activities[0]?.id);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const selectedActivityData = useMemo(() => {
    if (!selectedActivity) return null;
    
    const activity = activities.find(a => a.id === selectedActivity);
    if (!activity) return null;

    const stats = getActivityStatistics(activity, activityRecords);
    const trends = getActivityTrends(activity, activityRecords, 14);
    const productiveHours = getMostProductiveTime(activity, activityRecords);

    return { activity, stats, trends, productiveHours };
  }, [selectedActivity, activities, activityRecords]);

  const renderTrendsChart = (trends: ActivityTrend[]) => {
    const maxCount = Math.max(...trends.map(t => t.count));
    const barWidth = (SCREEN_WIDTH - 48) / trends.length;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {trends.map((trend, index) => {
            const height = (trend.count / maxCount) * CHART_HEIGHT;
            return (
              <View key={trend.day} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: selectedActivityData?.activity.color,
                      width: barWidth - 4,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, isDark && styles.textDark]}>
                  {new Date(trend.day).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.chartTitle, isDark && styles.textDark]}>
          Activity Frequency (Last 14 Days)
        </Text>
      </View>
    );
  };

  const renderProductiveHours = (hours: { hour: number; count: number }[]) => {
    const maxCount = Math.max(...hours.map(h => h.count));
    const barWidth = (SCREEN_WIDTH - 48) / 12; // Show 12 hours at a time

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.productiveHoursContainer}
      >
        <View style={styles.productiveHoursChart}>
          {hours.map(({ hour, count }) => {
            const height = (count / maxCount) * CHART_HEIGHT;
            return (
              <View key={hour} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: selectedActivityData?.activity.color,
                      width: barWidth - 4,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, isDark && styles.textDark]}>
                  {hour}:00
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  if (activities.length === 0) {
    return (
      <EmptyState
        message="Add some activities to see your statistics"
        icon="bar-chart-2"
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.activitySelector}>
        {activities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityButton,
              isDark && styles.activityButtonDark,
              selectedActivity === activity.id && styles.selectedActivityButton,
            ]}
            onPress={() => setSelectedActivity(activity.id)}
          >
            <Text
              style={[
                styles.activityButtonText,
                isDark && styles.textDark,
                selectedActivity === activity.id && styles.selectedActivityButtonText,
              ]}
            >
              {activity.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedActivityData && (
        <>
          <View style={styles.statsGrid}>
            <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
              <View style={styles.statsIconContainer}>
                <Clock size={24} color={selectedActivityData.activity.color} />
              </View>
              <Text style={[styles.statsValue, isDark && styles.textDark]}>
                {formatDuration(selectedActivityData.stats.totalDuration)}
              </Text>
              <Text style={[styles.statsLabel, isDark && styles.textDark]}>
                Total Time
              </Text>
            </View>

            <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
              <View style={styles.statsIconContainer}>
                <BarChart2 size={24} color={selectedActivityData.activity.color} />
              </View>
              <Text style={[styles.statsValue, isDark && styles.textDark]}>
                {selectedActivityData.stats.recordCount}
              </Text>
              <Text style={[styles.statsLabel, isDark && styles.textDark]}>
                Total Records
              </Text>
            </View>

            <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
              <View style={styles.statsIconContainer}>
                <Award size={24} color={selectedActivityData.activity.color} />
              </View>
              <Text style={[styles.statsValue, isDark && styles.textDark]}>
                {selectedActivityData.stats.streak}
              </Text>
              <Text style={[styles.statsLabel, isDark && styles.textDark]}>
                Current Streak
              </Text>
            </View>

            <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
              <View style={styles.statsIconContainer}>
                <Zap size={24} color={selectedActivityData.activity.color} />
              </View>
              <Text style={[styles.statsValue, isDark && styles.textDark]}>
                {Math.round(selectedActivityData.stats.completionRate * 100)}%
              </Text>
              <Text style={[styles.statsLabel, isDark && styles.textDark]}>
                Completion Rate
              </Text>
            </View>
          </View>

          {renderTrendsChart(selectedActivityData.trends)}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              Most Productive Hours
            </Text>
            {renderProductiveHours(selectedActivityData.productiveHours)}
          </View>

          {selectedActivityData.activity.type === 'duration' && (
            <View style={[styles.durationStats, isDark && styles.durationStatsDark]}>
              <Text style={[styles.durationStatsTitle, isDark && styles.textDark]}>
                Duration Statistics
              </Text>
              <View style={styles.durationStatsGrid}>
                <View style={styles.durationStatItem}>
                  <Text style={[styles.durationStatLabel, isDark && styles.textDark]}>
                    Average Duration
                  </Text>
                  <Text style={[styles.durationStatValue, isDark && styles.textDark]}>
                    {formatDuration(selectedActivityData.stats.averageDuration)}
                  </Text>
                </View>
                <View style={styles.durationStatItem}>
                  <Text style={[styles.durationStatLabel, isDark && styles.textDark]}>
                    Longest Session
                  </Text>
                  <Text style={[styles.durationStatValue, isDark && styles.textDark]}>
                    {formatDuration(selectedActivityData.stats.longestSession)}
                  </Text>
                </View>
                <View style={styles.durationStatItem}>
                  <Text style={[styles.durationStatLabel, isDark && styles.textDark]}>
                    Shortest Session
                  </Text>
                  <Text style={[styles.durationStatValue, isDark && styles.textDark]}>
                    {formatDuration(selectedActivityData.stats.shortestSession)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
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
  content: {
    padding: 16,
  },
  activitySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  activityButton: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
  },
  activityButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  activityButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  selectedActivityButton: {
    backgroundColor: '#007AFF',
  },
  selectedActivityButtonText: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  statsCardDark: {
    backgroundColor: '#1C1C1E',
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  productiveHoursContainer: {
    maxHeight: CHART_HEIGHT + 40,
  },
  productiveHoursChart: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  durationStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  durationStatsDark: {
    backgroundColor: '#1C1C1E',
  },
  durationStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  durationStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  durationStatItem: {
    flex: 1,
    minWidth: '45%',
    margin: 8,
  },
  durationStatLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  durationStatValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  textDark: {
    color: '#FFFFFF',
  },
});