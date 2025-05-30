import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Clock, ChartBar as BarChart2 } from 'lucide-react-native';

type EmptyStateProps = {
  message?: string;
  icon?: 'clock' | 'bar-chart-2';
};

const EmptyState = ({ message, icon }: EmptyStateProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  let IconComponent = Clock;
  if (icon === 'bar-chart-2') {
    IconComponent = BarChart2;
  }

  // Fallback message if none provided
  const displayMessage = message || 'No activities found. Tap the + button to add your first activity.';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <IconComponent
          size={40}
          color={isDark ? '#8E8E93' : '#C7C7CC'}
        />
      </View>
      <Text style={[styles.message, isDark && styles.messageDark]}>
        {displayMessage}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  message: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 240,
  },
  messageDark: {
    color: '#8E8E93',
  },
});

export default EmptyState;