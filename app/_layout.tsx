import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { enableScreens } from 'react-native-screens';
import { ActivityProvider } from '../context/ActivityContext';
import { ErrorBoundary } from 'react-error-boundary';

// Enable screens before any navigation components render
enableScreens(true);

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ color: 'red', fontSize: 18, margin: 20 }}>Something went wrong:</Text>
      <Text style={{ color: 'red', fontSize: 14 }}>{error?.message}</Text>
    </View>
  );
}

function RootLayoutContent() {
  const { ready, error } = useFrameworkReady();
  
  console.log('RootLayoutContent: Rendering with ready:', ready, 'error:', error?.message);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Mounting...');
  return (
    <ActivityProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RootLayoutContent />
      </ErrorBoundary>
    </ActivityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
});