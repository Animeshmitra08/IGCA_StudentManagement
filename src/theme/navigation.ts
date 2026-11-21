import { DarkTheme as NavDark, DefaultTheme as NavLight, type Theme } from 'expo-router';
import { renderStackHeader, renderTabHeader } from '@/src/components/header/AppHeader';
import type { AppTheme } from './theme';

/** React Navigation theme derived from the app tokens, so native headers and the tab bar match. */
export function navigationTheme(theme: AppTheme): Theme {
  const base = theme.dark ? NavDark : NavLight;
  const c = theme.colors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.screen,
      // Floating headers paint their own gradient; this colours any other card surface.
      card: c.screen,
      text: c.onSurface,
      border: c.border,
      notification: c.error,
    },
  };
}

/*
 * Both headers float (`headerTransparent`): the screen runs up to the top edge and
 * scrolls under the header's wavy bottom. Scrollables clear it with useHeaderInset()
 * (Screen, GroupedList and useDataGate already do).
 */

/**
 * Shared options for pushed (detail) screens: the compact AppHeader (back button,
 * short title, open book art). Screens set `title` and `headerRight` as usual.
 */
export const detailScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  header: renderStackHeader,
} as const;

/**
 * Shared options for tab navigators: the tall AppHeader (greeting, large title,
 * mortarboard art). The tab bar itself is the floating PillTabBar, passed as `tabBar`
 * in each tabs layout.
 */
export const tabScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  header: renderTabHeader,
} as const;
