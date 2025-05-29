import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useActivities } from '@/context/ActivityContext';
import HistoryItem from '@/components/HistoryItem';
import EmptyState from '@/components/EmptyState';
import { Calendar, ListFilter, Trash2 } from 'lucide-react-native';
import FilterModal from '@/components/FilterModal';

export default function HistoryScreen() {
  const { activityRecords, activities, deleteRecord, deleteSelectedRecords, clearAllActivities } = useActivities();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get all records sorted by timestamp (newest first)
  const sortedRecords = [...activityRecords].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Filter records if a filter is active
  const filteredRecords =
    selectedFilter === 'all'
      ? sortedRecords
      : sortedRecords.filter((record) => record.activityId === selectedFilter);

  // Group records by date for better display
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const date = new Date(record.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  // Convert grouped records to format suitable for FlatList
  const sections = Object.keys(groupedRecords).map((date) => ({
    date,
    data: groupedRecords[date],
  }));

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Selected Records',
      'Are you sure you want to delete the selected records?',
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
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Records',
      'Are you sure you want to delete all records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllActivities,
        },
      ]
    );
  };

  const handleLongPressRecord = (recordId: string) => {
    setSelectionMode(true);
    setSelectedRecords([recordId]);
  };

  const handlePressRecord = (recordId: string) => {
    if (selectionMode) {
      setSelectedRecords((prev) => {
        if (prev.includes(recordId)) {
          const newSelected = prev.filter((id) => id !== recordId);
          if (newSelected.length === 0) {
            setSelectionMode(false);
          }
          return newSelected;
        }
        return [...prev, recordId];
      });
    }
  };

  const renderSectionHeader = ({ date }) => (
    <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
      <Text style={[styles.sectionHeaderText, isDark && styles.textDark]}>
        {date}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const activity = activities.find((a) => a.id === item.activityId);
    return activity ? (
      <HistoryItem
        record={item}
        activity={activity}
        selected={selectedRecords.includes(item.id)}
        onPress={() => handlePressRecord(item.id)}
        onLongPress={() => handleLongPressRecord(item.id)}
        selectionMode={selectionMode}
      />
    ) : null;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.filterButton, isDark && styles.filterButtonDark]}
          onPress={() => setFilterModalVisible(true)}>
          <ListFilter
            size={18}
            color={isDark ? '#FFFFFF' : '#000000'}
            style={styles.filterIcon}
          />
          <Text style={[styles.filterText, isDark && styles.textDark]}>
            {selectedFilter === 'all'
              ? 'All Activities'
              : activities.find((a) => a.id === selectedFilter)?.name || 'All'}
          </Text>
        </TouchableOpacity>

        {selectionMode ? (
          <TouchableOpacity
            style={[styles.deleteButton]}
            onPress={handleDeleteSelected}>
            <Trash2 size={18} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>
              Delete ({selectedRecords.length})
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.deleteButton]}
            onPress={handleClearAll}>
            <Trash2 size={18} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredRecords.length === 0 ? (
        <EmptyState
          message="No activity records yet. Start tracking to see your history."
          icon="bar-chart-2"
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader(item)}
              <FlatList
                data={item.data}
                keyExtractor={(record) => record.id}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          )}
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activities={activities}
        selectedFilter={selectedFilter}
        onSelectFilter={(filter) => {
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E9EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 4,
  },
  textDark: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    backgroundColor: '#EFEFF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderDark: {
    backgroundColor: '#1C1C1E',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C3C43',
  },
});