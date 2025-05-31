import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { getActivityIcon, formatDuration } from '../utils/activityUtils';
import { Check } from 'lucide-react-native';

const HistoryItem = ({ record, activity, selected, onPress, onLongPress, selectionMode }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ActivityIcon = getActivityIcon(activity.icon);
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        isDark && styles.containerDark,
        selected && styles.selectedContainer,
        selected && isDark && styles.selectedContainerDark,
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: activity.color }]}>
        <ActivityIcon size={20} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.textDark]} numberOfLines={1}>
          {activity.name}
        </Text>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, isDark && styles.timeDark]}>
            {formatTime(record.timestamp)}
          </Text>
          {record.duration && (
            <>
              <Text style={[styles.duration, isDark && styles.durationDark]}> • </Text>
              <Text style={[styles.duration, isDark && styles.durationDark]}>
                {formatDuration(record.duration)}
              </Text>
            </>
          )}
        </View>
      </View>
      {selectionMode && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Check size={16} color="#FFFFFF" />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  selectedContainer: {
    backgroundColor: '#E8E8ED',
  },
  selectedContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  textDark: {
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#8E8E93',
  },
  timeDark: {
    color: '#8E8E93',
  },
  duration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  durationDark: {
    color: '#8E8E93',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});

export default HistoryItem;