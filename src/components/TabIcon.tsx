import React from 'react';
import type { ColorValue } from 'react-native';
import { Icon } from 'react-native-paper';

type TabIconProps = { focused: boolean; color: ColorValue; size: number };

/** A `tabBarIcon` renderer that also carries its glyph names, for the header motif. */
export type TabIconRenderer = ((props: TabIconProps) => React.ReactElement) & {
  glyph: { outline: string; filled: string };
};

/** `tabBarIcon` renderer for the pill tab bar: outline glyph, filled when active. */
export function tabIcon(outline: string, filled: string = outline): TabIconRenderer {
  function TabIcon({ focused, color, size }: TabIconProps) {
    return <Icon source={focused ? filled : outline} size={size} color={typeof color === 'string' ? color : undefined} />;
  }
  return Object.assign(TabIcon, { glyph: { outline, filled } });
}

/** The outline glyph behind a `tabBarIcon` made by `tabIcon`, if it was. */
export function tabGlyph(renderer: unknown): string | undefined {
  return (renderer as Partial<TabIconRenderer> | undefined)?.glyph?.outline;
}
