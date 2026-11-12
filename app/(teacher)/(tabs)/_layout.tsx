import React from 'react';
import { Tabs } from 'expo-router';
import { SignOutButton } from '@/src/components/HeaderButton';
import { tabIcon } from '@/src/components/TabIcon';
import { tabScreenOptions } from '@/src/theme/navigation';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherTabs() {
  const { colors } = useAppTheme();

  return (
    <Tabs screenOptions={tabScreenOptions(colors)}>
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
