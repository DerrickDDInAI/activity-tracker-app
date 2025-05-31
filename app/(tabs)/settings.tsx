import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  useColorScheme,
  Alert,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useActivities } from '../../context/ActivityContext';
import { Trash2, Download, Moon, CircleAlert as AlertCircle, Info, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { clearAllActivities, activities, activityRecords } = useActivities();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all activities and records? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: clearAllActivities,
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      // Create CSV content
      const headers = ['Activity Name', 'Type', 'Timestamp', 'End Timestamp', 'Duration (ms)'];
      const rows = activityRecords.map(record => {
        const activity = activities.find(a => a.id === record.activityId);
        return [
          activity?.name || 'Unknown Activity',
          activity?.type || 'unknown',
          record.timestamp,
          record.endTimestamp || '',
          record.duration || ''
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      if (Platform.OS === 'web') {
        // Create blob and download file on web
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'activity_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Share file on mobile platforms
        await Share.share({
          message: csvContent,
          title: 'Activity Data Export',
        });
      }
    } catch (error) {
      Alert.alert(
        'Export Error',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Statistics
        </Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.statsText, isDark && styles.textDark]}>
            <Text style={styles.statsNumber}>{activities.length}</Text> activities
          </Text>
          <Text style={[styles.statsText, isDark && styles.textDark]}>
            <Text style={styles.statsNumber}>{activityRecords.length}</Text>{' '}
            total records
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          General
        </Text>
        <View style={[styles.settingsList, isDark && styles.settingsListDark]}>
          <View style={styles.settingsItem}>
            <View style={styles.settingLeft}>
              <Moon
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, isDark && styles.textDark]}>
                Dark Mode
              </Text>
            </View>
            <Text style={[styles.settingValue, isDark && styles.textDark]}>
              {isDark ? 'On' : 'Off'} (System)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          Data Management
        </Text>
        <View style={[styles.settingsList, isDark && styles.settingsListDark]}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Download
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, isDark && styles.textDark]}>
                Export Data
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.dangerItem]}
            onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Trash2
                size={20}
                color="#FF3B30"
                style={styles.settingIcon}
              />
              <Text style={styles.dangerText}>Clear All Data</Text>
            </View>
            <ChevronRight size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          About
        </Text>
        <View style={[styles.settingsList, isDark && styles.settingsListDark]}>
          <View style={styles.settingsItem}>
            <View style={styles.settingLeft}>
              <Info
                size={20}
                color={isDark ? '#FFFFFF' : '#000000'}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, isDark && styles.textDark]}>
                Version
              </Text>
            </View>
            <Text style={[styles.settingValue, isDark && styles.textDark]}>
              1.0.0
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 8,
    color: '#3C3C43',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  statsText: {
    fontSize: 16,
    color: '#3C3C43',
    marginBottom: 8,
  },
  statsNumber: {
    fontWeight: '700',
    fontSize: 18,
    color: '#007AFF',
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsListDark: {
    backgroundColor: '#1C1C1E',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  textDark: {
    color: '#FFFFFF',
  },
});