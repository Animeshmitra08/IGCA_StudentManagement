import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { elevation, radius, spacing } from '@/src/theme/theme';
import { Separator } from './ui';

/**
 * Bottom padding for a scrollable. Tab screens sit above the tab bar, which already
 * owns the bottom inset; pushed screens have to clear it themselves.
 */
export function useBottomPadding(tabbed?: boolean) {
  const insets = useSafeAreaInsets();
  return spacing.xl + (tabbed ? 0 : insets.bottom);
}

/**
 * Returns a RefreshControl element, deliberately not a wrapper component: Android and
 * web clone this element and pass the scroll view in as its children and style, which
 * a wrapper would swallow (blank screen).
 */
function refresher(tint: string, refreshing: boolean, onRefresh?: () => void) {
  if (!onRefresh) return undefined;
  return (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} colors={[tint]} />
  );
}

interface Props {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Screen is a tab root (the tab bar owns the bottom inset). */
  tabbed?: boolean;
  /** Something (an action bar) already clears the bottom inset below this scroll view. */
  noBottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Page shell for fixed, short content: themed background, 16pt padding, pull to
 * refresh, safe bottom inset. Unbounded data belongs in GroupedList, not here.
 */
export function Screen({ children, refreshing = false, onRefresh, tabbed, noBottomInset, style }: Props) {
  const { colors } = useAppTheme();
  const paddingBottom = useBottomPadding(tabbed || noBottomInset);

  return (
    <ScrollView
      style={[styles.base, { backgroundColor: colors.screen }]}
      contentContainerStyle={[styles.content, { paddingBottom }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refresher(colors.primary, refreshing, onRefresh)}
    >
      {children}
    </ScrollView>
  );
}

/**
 * Virtualized list drawn as one inset-grouped surface (the same look as <Group>),
 * for data that can grow without bound.
 */
export function GroupedList<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  empty,
  refreshing = false,
  onRefresh,
  tabbed,
  separatorInset = true,
}: {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactElement;
  /** Scrolls with the list, above the group. */
  header?: React.ReactElement;
  /** Shown instead of the group when `data` is empty. */
  empty?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  tabbed?: boolean;
  separatorInset?: boolean | number;
}) {
  const { colors } = useAppTheme();
  const paddingBottom = useBottomPadding(tabbed);
  const last = data.length - 1;

  return (
    <FlatList
      style={[styles.base, { backgroundColor: colors.screen }]}
      contentContainerStyle={[styles.listContent, { paddingBottom }]}
      data={data}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      refreshControl={refresher(colors.primary, refreshing, onRefresh)}
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.cell,
            { backgroundColor: colors.card, borderColor: colors.border },
            index === 0 && styles.cellFirst,
            index === last && styles.cellLast,
          ]}
        >
          {index > 0 && <Separator inset={separatorInset} />}
          {renderItem(item)}
        </View>
      )}
    />
  );
}

/** Bottom bar for a screen's primary actions. Flat, hairline on top, clears the inset. */
export function ActionBar({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.actionBar,
        elevation.raised,
        {
          backgroundColor: colors.screen,
          borderColor: colors.border,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  content: { padding: spacing.lg, flexGrow: 1 },
  listContent: { paddingTop: spacing.sm, flexGrow: 1 },
  cell: {
    marginHorizontal: spacing.lg,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cellFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  cellLast: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
