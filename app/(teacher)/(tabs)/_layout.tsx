import React from 'react';
import { Tabs } from 'expo-router';
import { SignOutButton } from '@/src/components/HeaderButton';
import { pillTabBar } from '@/src/components/PillTabBar';
import { tabIcon } from '@/src/components/TabIcon';
import { tabScreenOptions } from '@/src/theme/navigation';

export default function TeacherTabs() {
  return (
    <Tabs tabBar={pillTabBar} screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: tabIcon('view-dashboard-outline', 'view-dashboard'),
          headerRight: () => <SignOutButton />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{ title: 'Students', tabBarIcon: tabIcon('account-group-outline', 'account-group') }}
      />
      <Tabs.Screen
        name="content"
        options={{ title: 'Content', tabBarIcon: tabIcon('play-box-multiple-outline', 'play-box-multiple') }}
      />
    </Tabs>
  );
}
