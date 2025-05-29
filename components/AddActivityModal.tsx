import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Switch,
} from 'react-native';
import { useActivities } from '@/context/ActivityContext';
import { X, Bell } from 'lucide-react-native';
import { ACTIVITY_COLORS, ACTIVITY_ICONS } from '@/constants/activities';
import { getActivityIcon } from '@/utils/activityUtils';
import * as Notifications from 'expo-notifications';

const AddActivityModal = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ACTIVITY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ACTIVITY_ICONS[0].id);
  const [isDurationActivity, setIsDurationActivity] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [notificationHours, setNotificationHours] = useState('0');
  const [notificationMinutes, setNotificationMinutes] = useState('0');
  const [notificationSeconds, setNotificationSeconds] = useState('0');
  const { addActivity } = useActivities();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAddActivity = async () => {
    if (name.trim()) {
      let notificationConfig = null;
      
      if (enableNotifications && Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            return;
          }
        }
        
        const totalSeconds = 
          parseInt(notificationHours || '0', 10) * 3600 +
          parseInt(notificationMinutes || '0', 10) * 60 +
          parseInt(notificationSeconds || '0', 10);
        
        notificationConfig = {
          enabled: true,
          seconds: totalSeconds,
        };
      }

      addActivity({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
        type: isDurationActivity ? 'duration' : 'instant',
        notificationConfig,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedColor(ACTIVITY_COLORS[0]);
    setSelectedIcon(ACTIVITY_ICONS[0].id);
    setIsDurationActivity(false);
    setEnableNotifications(false);
    setNotificationHours('0');
    setNotificationMinutes('0');
    setNotificationSeconds('0');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}>
        <View style={[styles.modalView, isDark && styles.modalViewDark]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Add New Activity
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={[styles.inputLabel, isDark && styles.textDark]}>
              Activity Name
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="e.g., Eating, Running, Reading"
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <View style={styles.switchContainer}>
              <Text style={[styles.inputLabel, isDark && styles.textDark]}>
                Track Duration
              </Text>
              <Switch
                value={isDurationActivity}
                onValueChange={setIsDurationActivity}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isDurationActivity ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            {Platform.OS !== 'web' && (
              <>
                <View style={styles.switchContainer}>
                  <Text style={[styles.inputLabel, isDark && styles.textDark]}>
                    Enable Reminders
                  </Text>
                  <Switch
                    value={enableNotifications}
                    onValueChange={setEnableNotifications}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={enableNotifications ? '#007AFF' : '#f4f3f4'}
                  />
                </View>

                {enableNotifications && (
                  <View style={styles.reminderContainer}>
                    <Text style={[styles.inputLabel, isDark && styles.textDark]}>
                      Remind me after:
                    </Text>
                    <View style={styles.timeInputContainer}>
                      <View style={styles.timeInputGroup}>
                        <TextInput
                          style={[styles.timeInput, isDark && styles.inputDark]}
                          keyboardType="numeric"
                          value={notificationHours}
                          onChangeText={(text) => {
                            const number = parseInt(text, 10);
                            if (!isNaN(number) && number >= 0) {
                              setNotificationHours(text);
                            }
                          }}
                          maxLength={2}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>hours</Text>
                      </View>
                      <View style={styles.timeInputGroup}>
                        <TextInput
                          style={[styles.timeInput, isDark && styles.inputDark]}
                          keyboardType="numeric"
                          value={notificationMinutes}
                          onChangeText={(text) => {
                            const number = parseInt(text, 10);
                            if (!isNaN(number) && number >= 0 && number < 60) {
                              setNotificationMinutes(text);
                            }
                          }}
                          maxLength={2}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>min</Text>
                      </View>
                      <View style={styles.timeInputGroup}>
                        <TextInput
                          style={[styles.timeInput, isDark && styles.inputDark]}
                          keyboardType="numeric"
                          value={notificationSeconds}
                          onChangeText={(text) => {
                            const number = parseInt(text, 10);
                            if (!isNaN(number) && number >= 0 && number < 60) {
                              setNotificationSeconds(text);
                            }
                          }}
                          maxLength={2}
                        />
                        <Text style={[styles.timeLabel, isDark && styles.textDark]}>sec</Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
            
            <Text style={[styles.inputLabel, isDark && styles.textDark, { marginTop: 16 }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {ACTIVITY_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            
            <Text style={[styles.inputLabel, isDark && styles.textDark, { marginTop: 16 }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {ACTIVITY_ICONS.map((icon) => {
                const IconComponent = getActivityIcon(icon.id);
                return (
                  <TouchableOpacity
                    key={icon.id}
                    style={[
                      styles.iconOption,
                      isDark && styles.iconOptionDark,
                      selectedIcon === icon.id && styles.selectedIconOption,
                      selectedIcon === icon.id && { borderColor: selectedColor },
                    ]}
                    onPress={() => setSelectedIcon(icon.id)}>
                    <IconComponent
                      size={24}
                      color={selectedIcon === icon.id ? selectedColor : (isDark ? '#FFFFFF' : '#000000')}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: name.trim() ? '#007AFF' : '#C7C7CC' },
              ]}
              onPress={handleAddActivity}
              disabled={!name.trim()}>
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  reminderContainer: {
    marginTop: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  iconOptionDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  selectedIconOption: {
    borderWidth: 2,
  },
  buttonContainer: {
    marginTop: 8,
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddActivityModal;