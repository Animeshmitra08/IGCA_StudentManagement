import React from 'react';
import { Icon } from 'react-native-paper';

/** `tabBarIcon` renderer for the native tab bar: outline glyph, filled when active. */
export function tabIcon(outline: string, filled: string = outline) {
  return function TabIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
    return <Icon source={focused ? filled : outline} size={size} color={color} />;
  };
}
