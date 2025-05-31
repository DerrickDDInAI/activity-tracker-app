import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import ActivityCard from '../../components/ActivityCard';
import AddActivityModal from '../../components/AddActivityModal';
import ManualEntryModal from '../../components/ManualEntryModal';
import { useActivities } from '../../context/ActivityContext';
import EmptyState from '../../components/EmptyState';
import type { Activity } from '../../types/activity';

export default function ActivitiesScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manualEntryModalVisible, setManualEntryModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { activities, trackActivity } = useActivities();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAddActivity = useCallback(() => {
    setAddModalVisible(true);
  }, []);

  const handleActivityTap = useCallback((activityId: string) => {
    trackActivity(activityId);
  }, [trackActivity]);

  const handleActivityLongPress = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setManualEntryModalVisible(true);
  }, []);

  const handleManualEntry = useCallback((datetime: Date) => {
    if (selectedActivity) {
      trackActivity(selectedActivity.id, datetime);
    }
    setManualEntryModalVisible(false);
  }, [selectedActivity, trackActivity]);

  const handleCloseManualEntry = useCallback(() => {
    setManualEntryModalVisible(false);
    setSelectedActivity(null);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setAddModalVisible(false);
  }, []);

  const renderedActivities = useMemo(() => {
    if (activities.length === 0) {
      return (
        <EmptyState
          message="Tap the + button to add your first activity"
          icon="clock"
        />
      );
    }

    return (
      <View style={styles.activitiesGrid}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => handleActivityTap(activity.id)}
            onLongPress={() => handleActivityLongPress(activity)}
          />
        ))}
      </View>
    );
  }, [activities, handleActivityTap, handleActivityLongPress]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {renderedActivities}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#007AFF' }]}
        onPress={handleAddActivity}>
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>

      <AddActivityModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
      />

      <ManualEntryModal
        visible={manualEntryModalVisible}
        onClose={handleCloseManualEntry}
        onSave={handleManualEntry}
        activity={selectedActivity}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});