import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/src/context/AuthContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { HeaderButton } from '../HeaderButton';
import { tabGlyph } from '../TabIcon';
import { InkContext, Txt } from '../ui';
import { HEADER_CURVE, HeaderArt, motifCentre } from './HeaderArt';
import { TabMotif } from './TabMotif';

type HeaderRight = (props: { tintColor?: string; canGoBack: boolean }) => React.ReactNode;

/** The part of the navigator's header props this header reads (tabs and native stack). */
export interface AppHeaderProps {
  options: { title?: string; headerTitle?: unknown; headerRight?: HeaderRight; tabBarIcon?: unknown };
  route: { name: string };
  navigation: { goBack: () => void };
  /** Set by the stack when there is a screen to go back to. */
  back?: unknown;
}

/** Content height before the first layout pass, so the art never flashes in late. */
const ESTIMATE = { tab: 46 + spacing.md + spacing.xl, stack: 44 + spacing.xs * 2 } as const;

function greeting(name?: string) {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${part}, ${first}` : part;
}

/**
 * The app's header for every signed-in screen and the register form. It floats over the
 * screen (`headerTransparent`), runs up under the status bar (which turns light over
 * it) and draws HeaderArt behind its content. Its own background is transparent, so
 * content scrolls under the wavy bottom edge.
 *
 * - `tab`: a tab root. Greeting eyebrow, large title, `headerRight` actions, and the
 *   tab's own icon as the art's motif (TabMotif), animated on every tab change.
 * - `stack`: a pushed screen. Back button, short title, `headerRight` actions.
 */
export function AppHeader({ options, route, navigation, back, variant }: AppHeaderProps & { variant: 'tab' | 'stack' }) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const curve = HEADER_CURVE[variant];
  const tab = variant === 'tab';

  const [size, setSize] = useState({
    width: window.width,
    height: insets.top + ESTIMATE[variant] + curve,
  });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const title = typeof options.headerTitle === 'string' ? options.headerTitle : (options.title ?? route.name);
  const right = options.headerRight?.({ tintColor: colors.onHeader, canGoBack: !!back });
  const motif = motifCentre(size.width, insets.top, variant);

  return (
    <View
      onLayout={onLayout}
      // The header floats over the screen; only its buttons take touches.
      pointerEvents="box-none"
      style={[
        styles.base,
        {
          paddingTop: insets.top + (tab ? spacing.md : spacing.xs),
          paddingBottom: curve + (tab ? spacing.xl : spacing.xs),
          // A back button brings its own breathing room; a bare title needs the full gutter.
          paddingLeft: insets.left + (!tab && back ? spacing.sm : spacing.lg),
          paddingRight: insets.right + spacing.lg,
        },
      ]}
    >
      <StatusBar style="light" />
      <HeaderArt width={size.width} height={size.height} top={insets.top} variant={variant} />
      {tab && <TabMotif glyph={tabGlyph(options.tabBarIcon) ?? 'school-outline'} cx={motif.x} cy={motif.y} />}

      <InkContext.Provider value={{ fg: colors.onHeader, muted: colors.onHeaderMuted }}>
        {tab ? (
          <View style={styles.row} pointerEvents="box-none">
            <View style={styles.titles}>
              <Txt v="label" muted chrome numberOfLines={1} style={styles.eyebrow}>
                {greeting(user?.name)}
              </Txt>
              <Txt v="title" accessibilityRole="header" numberOfLines={1}>
                {title}
              </Txt>
            </View>
            {right}
          </View>
        ) : (
          <View style={[styles.row, styles.stackRow]} pointerEvents="box-none">
            {back ? <HeaderButton icon="arrow-left" label="Back" onPress={navigation.goBack} /> : null}
            <Txt v="heading" accessibilityRole="header" numberOfLines={1} style={styles.titles}>
              {title}
            </Txt>
            {right}
          </View>
        )}
      </InkContext.Provider>
    </View>
  );
}

/** `header` option for tab navigators. */
export const renderTabHeader = (props: AppHeaderProps) => <AppHeader {...props} variant="tab" />;

/** `header` option for stack navigators. */
export const renderStackHeader = (props: AppHeaderProps) => <AppHeader {...props} variant="stack" />;

const styles = StyleSheet.create({
  base: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stackRow: { minHeight: 44, gap: spacing.sm },
  titles: { flex: 1 },
  eyebrow: { letterSpacing: 0.3 },
});
