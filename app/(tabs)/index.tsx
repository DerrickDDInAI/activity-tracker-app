import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import ActivityCard from '@/components/ActivityCard';
import AddActivityModal from '@/components/AddActivityModal';
import ManualEntryModal from '@/components/ManualEntryModal';
import { useActivities } from '@/context/ActivityContext';
import EmptyState from '@/components/EmptyState';

export default function ActivitiesScreen() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manualEntryModalVisible, setManualEntryModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, trackActivity } = useActivities();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAddActivity = () => {
    setAddModalVisible(true);
  };

  const handleActivityTap = (activityId) => {
    trackActivity(activityId);
  };

  const handleActivityLongPress = (activity) => {
    setSelectedActivity(activity);
    setManualEntryModalVisible(true);
  };

  const handleManualEntry = (datetime) => {
    if (selectedActivity) {
      trackActivity(selectedActivity.id, datetime);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {activities.length === 0 ? (
          <EmptyState
            message="Tap the + button to add your first activity"
            icon="clock"
          />
        ) : (
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
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#007AFF' }]}
        onPress={handleAddActivity}>
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>

      <AddActivityModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />

      <ManualEntryModal
        visible={manualEntryModalVisible}
        onClose={() => {
          setManualEntryModalVisible(false);
          setSelectedActivity(null);
        }}
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