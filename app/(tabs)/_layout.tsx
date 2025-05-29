import { Tabs } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { ChartBar as BarChart2, Clock, Settings, ChartLine as LineChart } from 'lucide-react-native';
import { ActivityProvider } from '../../context/ActivityContext';

const TabBarIcon = ({ color, size, icon: Icon }) => {
  return <Icon size={size} color={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ActivityProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8E8E93',
          tabBarStyle: {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopColor: isDark ? '#38383A' : '#D1D1D6',
          },
          headerStyle: {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Activities',
            headerTitle: 'My Activities',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon icon={Clock} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            headerTitle: 'Activity History',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon icon={BarChart2} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            headerTitle: 'Activity Stats',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon icon={LineChart} color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon icon={Settings} color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </ActivityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});