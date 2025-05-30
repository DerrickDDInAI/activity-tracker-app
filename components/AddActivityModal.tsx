import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  useColorScheme,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useActivities } from '@/context/ActivityContext';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '@/constants/activities';
import { getActivityIcon } from '@/utils/activityUtils';
import type { Activity, ActivityType } from '@/context/ActivityContext';

type ActivityIcon = {
  id: string;
  name: string;
};

type AddActivityModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddActivityModal({ visible, onClose }: AddActivityModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addActivity } = useActivities();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ACTIVITY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<ActivityIcon>(ACTIVITY_ICONS[0]);
  const [activityType, setActivityType] = useState<ActivityType>('instant');
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('0');
  const [customMessage, setCustomMessage] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;

    addActivity({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon.id,
      type: activityType,
      notificationConfig: enableNotifications ? {
        enabled: true,
        hours: Math.max(0, Math.min(Number(hours) || 0, 24)),
        minutes: Math.max(0, Math.min(Number(minutes) || 0, 59)),
        seconds: Math.max(0, Math.min(Number(seconds) || 0, 59)),
        customMessage: customMessage.trim() || undefined,
      } : undefined,
    });

    // Reset form
    setName('');
    setSelectedColor(ACTIVITY_COLORS[0]);
    setSelectedIcon(ACTIVITY_ICONS[0]);
    setActivityType('instant');
    setEnableNotifications(false);
    setHours('0');
    setMinutes('10');
    setSeconds('0');
    setCustomMessage('');

    onClose();
  };

  const handleTimeChange = (text: string, setter: (value: string) => void, max: number) => {
    const num = text.replace(/[^0-9]/g, '');
    if (num === '' || Number(num) <= max) {
      setter(num);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isDark && styles.modalViewDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>Add Activity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.label, isDark && styles.textDark]}>Activity Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={name}
              onChangeText={setName}
              placeholder="Enter activity name"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />

            <Text style={[styles.label, isDark && styles.textDark]}>Select Color</Text>
            <View style={styles.colorGrid}>
              {ACTIVITY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedItem,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <Text style={[styles.label, isDark && styles.textDark]}>Select Icon</Text>
            <View style={styles.iconGrid}>
              {ACTIVITY_ICONS.map((icon) => {
                const Icon = getActivityIcon(icon.id);
                return (
                  <TouchableOpacity
                    key={icon.id}
                    style={[
                      styles.iconItem,
                      isDark && styles.iconItemDark,
                      selectedIcon.id === icon.id && styles.selectedItem,
                    ]}
                    onPress={() => setSelectedIcon(icon)}>
                    <Icon size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, isDark && styles.textDark]}>Activity Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  isDark && styles.typeButtonDark,
                  activityType === 'instant' && styles.selectedTypeButton,
                ]}
                onPress={() => setActivityType('instant')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    isDark && styles.textDark,
                    activityType === 'instant' && styles.selectedTypeButtonText,
                  ]}>
                  Instant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  isDark && styles.typeButtonDark,
                  activityType === 'duration' && styles.selectedTypeButton,
                ]}
                onPress={() => setActivityType('duration')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    isDark && styles.textDark,
                    activityType === 'duration' && styles.selectedTypeButtonText,
                  ]}>
                  Duration
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notificationSection}>
              <View style={styles.switchRow}>
                <Text style={[styles.label, isDark && styles.textDark]}>Enable Reminders</Text>
                <Switch
                  value={enableNotifications}
                  onValueChange={setEnableNotifications}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={enableNotifications ? '#007AFF' : '#f4f3f4'}
                />
              </View>

              {enableNotifications && (
                <>
                  <View style={styles.timeInputContainer}>
                    <Text style={[styles.label, isDark && styles.textDark]}>
                      Remind after:
                    </Text>
                    <View style={styles.timeInputs}>
                      <View style={styles.timeInput}>
                        <TextInput
                          style={[styles.timeInputField, isDark && styles.inputDark]}
                          value={hours}
                          onChangeText={(text) => handleTimeChange(text, setHours, 24)}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={isDark ? '#666' : '#999'}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>hours</Text>
                      </View>
                      <View style={styles.timeInput}>
                        <TextInput
                          style={[styles.timeInputField, isDark && styles.inputDark]}
                          value={minutes}
                          onChangeText={(text) => handleTimeChange(text, setMinutes, 59)}
                          keyboardType="number-pad"
                          placeholder="10"
                          placeholderTextColor={isDark ? '#666' : '#999'}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>min</Text>
                      </View>
                      <View style={styles.timeInput}>
                        <TextInput
                          style={[styles.timeInputField, isDark && styles.inputDark]}
                          value={seconds}
                          onChangeText={(text) => handleTimeChange(text, setSeconds, 59)}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={isDark ? '#666' : '#999'}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>sec</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.messageSection}>
                    <Text style={[styles.label, isDark && styles.textDark]}>
                      Custom Message (optional)
                    </Text>
                    <TextInput
                      style={[styles.messageInput, isDark && styles.inputDark]}
                      value={customMessage}
                      onChangeText={setCustomMessage}
                      placeholder="Time to check your activity!"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                      multiline
                      numberOfLines={3}
                    />
                    <Text style={[styles.hint, isDark && styles.textDark]}>
                      Note: Time elapsed will be automatically added to your message
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#007AFF' }]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
    maxHeight: '90%',
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
  content: {
    flexGrow: 0,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputDark: {
    borderColor: '#3A3A3C',
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  iconItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconItemDark: {
    backgroundColor: '#2C2C2E',
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  typeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonDark: {
    backgroundColor: '#2C2C2E',
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  notificationSection: {
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInputContainer: {
    marginTop: 16,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInput: {
    alignItems: 'center',
    flex: 1,
  },
  timeInputField: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },
  messageSection: {
    marginTop: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});