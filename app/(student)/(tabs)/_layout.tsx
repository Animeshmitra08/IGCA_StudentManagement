import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function StudentTabs() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon source="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          title: 'My Course',
          tabBarIcon: ({ color }) => <Icon source="bookshelf" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="batch"
        options={{
          title: 'Batch',
          tabBarIcon: ({ color }) => <Icon source="calendar-month-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon source="account-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
