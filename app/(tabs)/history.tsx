import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useActivities } from '../../context/ActivityContext';
import HistoryItem from '../../components/HistoryItem';
import EmptyState from '../../components/EmptyState';
import { Calendar, ListFilter, Trash2 } from 'lucide-react-native';
import FilterModal from '../../components/FilterModal';
import { ActivityFilter } from '@/types/activity';
import { filterActivities } from '@/utils/activityAnalytics';
import { formatDateTime } from '@/utils/dateUtils';

export default function HistoryScreen() {
  const {
    activityRecords,
    activities,
    deleteRecord,
    deleteSelectedRecords,
    clearAllActivities
  } = useActivities();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>({});
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Memoized filtered and grouped records
  const groupedRecords = useMemo(() => {
    // Apply filters
    const filtered = filterActivities(activities, activityRecords, selectedFilter);

    // Group by date
    const groups: { [key: string]: typeof filtered } = {};
    filtered.forEach(record => {
      const date = new Date(record.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });

    // Convert to array format for SectionList
    return Object.entries(groups)
      .map(([date, records]) => ({
        date,
        data: records.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      }))
      .sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [activities, activityRecords, selectedFilter]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all activities and records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllActivities,
        },
      ]
    );
  }, [clearAllActivities]);

  const handleLongPressRecord = useCallback((recordId: string) => {
    setSelectionMode(true);
    setSelectedRecords([recordId]);
  }, []);

  const handlePressRecord = useCallback((recordId: string) => {
    if (selectionMode) {
      setSelectedRecords(prev => {
        if (prev.includes(recordId)) {
          const newSelected = prev.filter(id => id !== recordId);
          if (newSelected.length === 0) {
            setSelectionMode(false);
          }
          return newSelected;
        }
        return [...prev, recordId];
      });
    }
  }, [selectionMode]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRecords.length === 0) return;

    Alert.alert(
      'Delete Selected Records',
      `Are you sure you want to delete ${selectedRecords.length} selected records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSelectedRecords(selectedRecords);
            setSelectedRecords([]);
            setSelectionMode(false);
          },
        },
      ]
    );
  }, [selectedRecords, deleteSelectedRecords]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Add any refresh logic here if needed
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const renderSectionHeader = useCallback(({ section }: { section: { date: string } }) => (
    <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
      <Text style={[styles.sectionHeaderText, isDark && styles.textDark]}>
        {new Date(section.date).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
    </View>
  ), [isDark]);

  const renderItem = useCallback(({ item }: { item: typeof activityRecords[0] }) => (
    <HistoryItem
      record={item}
      activity={activities.find(a => a.id === item.activityId)}
      onLongPress={() => handleLongPressRecord(item.id)}
      onPress={() => handlePressRecord(item.id)}
      selected={selectedRecords.includes(item.id)}
      selectionMode={selectionMode}
    />
  ), [activities, handleLongPressRecord, handlePressRecord, selectedRecords, selectionMode]);

  const renderEmptyComponent = useCallback(() => (
    <EmptyState
      message="No records found. Start tracking your activities!"
      icon="bar-chart-2"
    />
  ), []);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}>
          <ListFilter size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.filterButtonText, isDark && styles.textDark]}>
            Filter
          </Text>
        </TouchableOpacity>

        {selectionMode ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteSelected}>
            <Trash2 size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>
              Delete ({selectedRecords.length})
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <SectionList
        sections={groupedRecords}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        stickySectionHeadersEnabled
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activities={activities}
        selectedFilter={selectedFilter}
        onSelectFilter={(filter: ActivityFilter) => {
          setSelectedFilter(filter);
          setFilterModalVisible(false);
        }}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerDark: {
    borderBottomColor: '#2C2C2E',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
  },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderDark: {
    backgroundColor: '#1C1C1E',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  listContent: {
    flexGrow: 1,
  },
  textDark: {
    color: '#FFFFFF',
  },
});