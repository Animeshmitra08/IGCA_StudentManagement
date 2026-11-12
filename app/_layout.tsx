import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, useSegments } from 'expo-router';

import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { DataProvider } from '@/src/context/DataContext';
import { DarkTheme, LightTheme } from '@/src/theme/theme';

/** Sends the signed-in user to their role's route group and blocks the others. */
function RoleGate() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const group = segments[0];
    if (!group) return;

    const inAuth = group === '(auth)';

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    const home =
      user.role === 'ADMIN'
        ? '/(admin)/(tabs)'
        : user.role === 'TEACHER'
          ? '/(teacher)/(tabs)'
          : '/(student)/(tabs)';

    const expected = user.role === 'ADMIN' ? '(admin)' : user.role === 'TEACHER' ? '(teacher)' : '(student)';

    if (inAuth || group !== expected) {
      router.replace(home as never);
    }
  }, [user, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <DataProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <RoleGate />
            </DataProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
