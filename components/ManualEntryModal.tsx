import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useActivities } from '@/context/ActivityContext';

const ManualEntryModal = ({ visible, onClose, activity }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(Platform.OS === 'ios');
  const [showStartTimePicker, setShowStartTimePicker] = useState(Platform.OS === 'ios');
  const [showEndDatePicker, setShowEndDatePicker] = useState(Platform.OS === 'ios');
  const [showEndTimePicker, setShowEndTimePicker] = useState(Platform.OS === 'ios');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { trackActivity, addManualDurationRecord } = useActivities();

  const handleSave = () => {
    if (activity.type === 'duration') {
      addManualDurationRecord(activity.id, startDate, endDate);
    } else {
      trackActivity(activity.id, startDate);
    }
    onClose();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      if (date) {
        const newDate = new Date(startDate);
        newDate.setFullYear(date.getFullYear());
        newDate.setMonth(date.getMonth());
        newDate.setDate(date.getDate());
        setStartDate(newDate);
        setShowStartTimePicker(true);
      }
    } else {
      setStartDate(date || startDate);
    }
  };

  const handleStartTimeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
      if (date) {
        const newDate = new Date(startDate);
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        setStartDate(newDate);
      }
    } else {
      setStartDate(date || startDate);
    }
  };

  const handleEndDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
      if (date) {
        const newDate = new Date(endDate);
        newDate.setFullYear(date.getFullYear());
        newDate.setMonth(date.getMonth());
        newDate.setDate(date.getDate());
        setEndDate(newDate);
        setShowEndTimePicker(true);
      }
    } else {
      setEndDate(date || endDate);
    }
  };

  const handleEndTimeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
      if (date) {
        const newDate = new Date(endDate);
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        setEndDate(newDate);
      }
    } else {
      setEndDate(date || endDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isDark && styles.modalViewDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Manual Entry for {activity?.name}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeContainer}>
            {activity?.type === 'duration' ? (
              <>
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Start Time</Text>
                {Platform.OS === 'android' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                      onPress={() => setShowStartDatePicker(true)}>
                      <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                        {formatDate(startDate)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                      onPress={() => setShowStartTimePicker(true)}>
                      <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                        {formatTime(startDate)}
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginTop: 16 }]}>End Time</Text>
                    <TouchableOpacity
                      style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                      onPress={() => setShowEndDatePicker(true)}>
                      <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                        {formatDate(endDate)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                      onPress={() => setShowEndTimePicker(true)}>
                      <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                        {formatTime(endDate)}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.pickerContainer}>
                      <Text style={[styles.pickerLabel, isDark && styles.textDark]}>Start</Text>
                      <DateTimePicker
                        value={startDate}
                        mode="datetime"
                        display="spinner"
                        onChange={(event, date) => date && setStartDate(date)}
                        style={styles.picker}
                        textColor={isDark ? '#FFFFFF' : '#000000'}
                      />
                    </View>
                    <View style={styles.pickerContainer}>
                      <Text style={[styles.pickerLabel, isDark && styles.textDark]}>End</Text>
                      <DateTimePicker
                        value={endDate}
                        mode="datetime"
                        display="spinner"
                        onChange={(event, date) => date && setEndDate(date)}
                        style={styles.picker}
                        textColor={isDark ? '#FFFFFF' : '#000000'}
                      />
                    </View>
                  </>
                )}
              </>
            ) : (
              // For instant activities
              Platform.OS === 'android' ? (
                <>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                    onPress={() => setShowStartDatePicker(true)}>
                    <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                      {formatDate(startDate)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateTimeButton, isDark && styles.dateTimeButtonDark]}
                    onPress={() => setShowStartTimePicker(true)}>
                    <Text style={[styles.dateTimeButtonText, isDark && styles.textDark]}>
                      {formatTime(startDate)}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={startDate}
                    mode="datetime"
                    display="spinner"
                    onChange={(event, date) => date && setStartDate(date)}
                    style={styles.picker}
                    textColor={isDark ? '#FFFFFF' : '#000000'}
                  />
                </View>
              )
            )}

            {showStartDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
              />
            )}

            {showStartTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={startDate}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}

            {showEndDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}

            {showEndTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={endDate}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: activity?.color }]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  textDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateTimeButton: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateTimeButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  dateTimeButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  picker: {
    height: 200,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualEntryModal;