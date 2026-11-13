import React from 'react';
import { Tabs } from 'expo-router';
import { pillTabBar } from '@/src/components/PillTabBar';
import { tabIcon } from '@/src/components/TabIcon';
import { tabScreenOptions } from '@/src/theme/navigation';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function StudentTabs() {
  const { colors } = useAppTheme();

  return (
    <Tabs tabBar={pillTabBar} screenOptions={tabScreenOptions(colors)}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: tabIcon('home-variant-outline', 'home-variant') }}
      />
      <Tabs.Screen
        name="course"
        options={{ title: 'Course', tabBarIcon: tabIcon('book-open-page-variant-outline', 'book-open-page-variant') }}
      />
      <Tabs.Screen
        name="batch"
        options={{ title: 'Batch', tabBarIcon: tabIcon('calendar-month-outline', 'calendar-month') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('account-outline', 'account') }}
      />
    </Tabs>
  );
}
