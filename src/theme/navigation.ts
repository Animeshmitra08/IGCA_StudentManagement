import { DarkTheme as NavDark, DefaultTheme as NavLight, type Theme } from '@react-navigation/native';
import { spacing, type AppTheme } from './theme';

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
      // Headers and the tab bar sit flush on the screen background, separated by a hairline.
      card: c.screen,
      text: c.onSurface,
      border: c.border,
      notification: c.error,
    },
  };
}

/** Shared options for pushed (detail) screens: native header, no shadow, icon-only back. */
export const detailScreenOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  headerTitleStyle: { fontSize: 17, fontWeight: '600' },
} as const;

/** Shared options for tab navigators: native header with a left-aligned title, native tab bar. */
export function tabScreenOptions(colors: AppTheme['colors']) {
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerTitleAlign: 'left',
    headerTitleStyle: { fontSize: 22, fontWeight: '700' },
    headerRightContainerStyle: { paddingRight: spacing.lg },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    // Size stays on the platform default: the bar's height is computed for it, and a
    // larger size clips the label.
    tabBarLabelStyle: { fontWeight: '500' },
  } as const;
}
