import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Activity, ActivityFilter, ActivityType } from '@/types/activity';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  activities: Activity[];
  selectedFilter: ActivityFilter;
  onSelectFilter: (filter: ActivityFilter) => void;
}

const FilterModal = ({
  visible,
  onClose,
  activities,
  selectedFilter,
  onSelectFilter,
}: FilterModalProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [filter, setFilter] = useState<ActivityFilter>(selectedFilter);
  const [showStartDatePicker, setShowStartDatePicker] = useState(Platform.OS === 'ios');
  const [showEndDatePicker, setShowEndDatePicker] = useState(Platform.OS === 'ios');

  useEffect(() => {
    setFilter(selectedFilter);
  }, [selectedFilter]);

  const handleApply = () => {
    onSelectFilter(filter);
  };

  const handleReset = () => {
    setFilter({});
    onSelectFilter({});
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (date) {
      setFilter(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (date) {
      setFilter(prev => ({ ...prev, endDate: date }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isDark && styles.modalViewDark]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.textDark]}>
              Filter Records
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Activity
              </Text>
              <View style={styles.activityList}>
                <TouchableOpacity
                  style={[
                    styles.activityButton,
                    isDark && styles.activityButtonDark,
                    !filter.activityId && styles.selectedActivityButton,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, activityId: undefined }))}
                >
                  <Text
                    style={[
                      styles.activityButtonText,
                      isDark && styles.textDark,
                      !filter.activityId && styles.selectedActivityButtonText,
                    ]}
                  >
                    All Activities
                  </Text>
                </TouchableOpacity>
                
                {activities.map(activity => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.activityButton,
                      isDark && styles.activityButtonDark,
                      filter.activityId === activity.id && styles.selectedActivityButton,
                    ]}
                    onPress={() => setFilter(prev => ({ ...prev, activityId: activity.id }))}
                  >
                    <Text
                      style={[
                        styles.activityButtonText,
                        isDark && styles.textDark,
                        filter.activityId === activity.id && styles.selectedActivityButtonText,
                      ]}
                    >
                      {activity.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Date Range
              </Text>
              
              <View style={styles.dateSection}>
                <Text style={[styles.dateLabel, isDark && styles.textDark]}>
                  Start Date
                </Text>
                {Platform.OS === 'android' ? (
                  <TouchableOpacity
                    style={[styles.dateButton, isDark && styles.dateButtonDark]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={[styles.dateButtonText, isDark && styles.textDark]}>
                      {filter.startDate ? formatDate(filter.startDate) : 'Select Start Date'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <DateTimePicker
                    value={filter.startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    style={styles.datePicker}
                  />
                )}
              </View>

              <View style={styles.dateSection}>
                <Text style={[styles.dateLabel, isDark && styles.textDark]}>
                  End Date
                </Text>
                {Platform.OS === 'android' ? (
                  <TouchableOpacity
                    style={[styles.dateButton, isDark && styles.dateButtonDark]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.dateButtonText, isDark && styles.textDark]}>
                      {filter.endDate ? formatDate(filter.endDate) : 'Select End Date'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <DateTimePicker
                    value={filter.endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                    style={styles.datePicker}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Activity Type
              </Text>
              <View style={styles.typeList}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    isDark && styles.typeButtonDark,
                    !filter.type && styles.selectedTypeButton,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, type: undefined }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      isDark && styles.textDark,
                      !filter.type && styles.selectedTypeButtonText,
                    ]}
                  >
                    All Types
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    isDark && styles.typeButtonDark,
                    filter.type === 'instant' && styles.selectedTypeButton,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, type: 'instant' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      isDark && styles.textDark,
                      filter.type === 'instant' && styles.selectedTypeButtonText,
                    ]}
                  >
                    Instant
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    isDark && styles.typeButtonDark,
                    filter.type === 'duration' && styles.selectedTypeButton,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, type: 'duration' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      isDark && styles.textDark,
                      filter.type === 'duration' && styles.selectedTypeButtonText,
                    ]}
                  >
                    Duration
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={filter.startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {Platform.OS === 'android' && showEndDatePicker && (
        <DateTimePicker
          value={filter.endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalViewDark: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  activityButton: {
    backgroundColor: '#F2F2F7',
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
  },
  selectedActivityButton: {
    backgroundColor: '#007AFF',
  },
  selectedActivityButtonText: {
    color: '#FFFFFF',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  dateButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  dateButtonText: {
    fontSize: 16,
  },
  datePicker: {
    height: 120,
    marginTop: -10,
  },
  typeList: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
  },
  typeButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  typeButtonText: {
    fontSize: 16,
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textDark: {
    color: '#FFFFFF',
  },
});

export default FilterModal;