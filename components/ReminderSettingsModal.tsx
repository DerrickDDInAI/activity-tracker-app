import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

type ReminderSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  activityName: string;
  notificationConfig: {
    enabled: boolean;
    hours?: number;
    minutes?: number;
    seconds?: number;
    customMessage?: string;
  } | null;
  onSave: (config: { 
    enabled: boolean; 
    hours: number; 
    minutes: number; 
    seconds: number; 
    customMessage?: string 
  }) => void;
};

export default function ReminderSettingsModal({
  visible,
  onClose,
  activityName,
  notificationConfig,
  onSave,
}: ReminderSettingsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isEnabled, setIsEnabled] = useState(notificationConfig?.enabled ?? false);
  const [hours, setHours] = useState(String(notificationConfig?.hours ?? 0));
  const [minutes, setMinutes] = useState(String(notificationConfig?.minutes ?? 10));
  const [seconds, setSeconds] = useState(String(notificationConfig?.seconds ?? 0));
  const [customMessage, setCustomMessage] = useState(
    notificationConfig?.customMessage ?? ''
  );

  const handleSave = () => {
    onSave({
      enabled: isEnabled,
      hours: Math.max(0, Math.min(Number(hours) || 0, 24)),
      minutes: Math.max(0, Math.min(Number(minutes) || 0, 59)),
      seconds: Math.max(0, Math.min(Number(seconds) || 0, 59)),
      customMessage: customMessage.trim() || undefined,
    });
    onClose();
  };

  const handleTimeChange = (text: string, setter: (value: string) => void, max: number) => {
    const num = text.replace(/[^0-9]/g, '');
    if (num === '' || Number(num) <= max) {
      setter(num);
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
              Reminder Settings for {activityName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                Enable Reminders
              </Text>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            {isEnabled && (
              <>
                <View style={styles.timeInputContainer}>
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                    Remind after:
                  </Text>
                  <View style={styles.timeInputs}>
                    <View style={styles.timeInput}>
                      <TextInput
                        style={[styles.input, isDark && styles.inputDark]}
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
                        style={[styles.input, isDark && styles.inputDark]}
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
                        style={[styles.input, isDark && styles.inputDark]}
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
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
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
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#007AFF' }]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
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
    maxHeight: 400,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  timeInputContainer: {
    marginBottom: 20,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeInput: {
    alignItems: 'center',
    flex: 1,
  },
  input: {
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
  inputDark: {
    borderColor: '#3A3A3C',
    color: '#FFFFFF',
    backgroundColor: '#2C2C2E',
  },
  messageSection: {
    marginBottom: 20,
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