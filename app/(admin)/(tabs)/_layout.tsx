import React from 'react';
import { Tabs } from 'expo-router';
import { SignOutButton } from '@/src/components/HeaderButton';
import { tabIcon } from '@/src/components/TabIcon';
import { tabScreenOptions } from '@/src/theme/navigation';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function AdminTabs() {
  const { colors } = useAppTheme();

  return (
    <Tabs screenOptions={tabScreenOptions(colors)}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: tabIcon('view-dashboard-outline', 'view-dashboard'),
          headerRight: () => <SignOutButton />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{ title: 'Students', tabBarIcon: tabIcon('account-group-outline', 'account-group') }}
      />
      <Tabs.Screen
        name="courses"
        options={{ title: 'Courses', tabBarIcon: tabIcon('book-open-page-variant-outline', 'book-open-page-variant') }}
      />
      <Tabs.Screen
        name="batches"
        options={{ title: 'Batches', tabBarIcon: tabIcon('calendar-month-outline', 'calendar-month') }}
      />
    </Tabs>
  );
}
