import React from 'react';
import type { ColorValue } from 'react-native';
import { Icon } from 'react-native-paper';

/** `tabBarIcon` renderer for the pill tab bar: outline glyph, filled when active. */
export function tabIcon(outline: string, filled: string = outline) {
  return function TabIcon({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) {
    return <Icon source={focused ? filled : outline} size={size} color={typeof color === 'string' ? color : undefined} />;
  };
}
