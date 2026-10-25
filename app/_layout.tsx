import { Redirect, Stack, useGlobalSearchParams, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ event?: string | string[] }>();

  // If a student came from the QR check-in page to register, remember which
  // event they were checking in to, so we can send them back to it.
  const rawEvent = Array.isArray(params.event) ? params.event[0] : params.event;
  const eventCode =
    typeof rawEvent === 'string' && /^[A-Za-z0-9_-]{3,40}$/.test(rawEvent)
      ? rawEvent
      : '';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const path = segments[0];
  const inAuthGroup = path === 'login' || path === 'register';
  const inTabsGroup = path === '(tabs)';

  if (!session && inTabsGroup) {
    return <Redirect href="/login" />;
  }

  if (session && inAuthGroup) {
    if (eventCode) {
      return <Redirect href={{ pathname: '/attend', params: { event: eventCode } }} />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="attend" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});