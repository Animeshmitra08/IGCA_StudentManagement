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
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { elevation, radius, spacing, tabBar } from '@/src/theme/theme';
import { Bento, bentoSteps } from './Bento';
import { Enter, EnterOrderContext, EntranceProvider } from './motion';
import { Separator } from './ui';

/**
 * Bottom padding for a scrollable: the bottom inset, plus the floating tab bar on tab
 * screens (content scrolls underneath it), or nothing extra when an action bar below
 * the scroll view already clears the inset (`docked`).
 */
export function useBottomPadding(mode?: 'tabbed' | 'docked') {
  const insets = useSafeAreaInsets();
  if (mode === 'docked') return spacing.xl;
  if (mode === 'tabbed') return spacing.xl + insets.bottom + tabBar.gap + tabBar.height;
  return spacing.xl + insets.bottom;
}

/**
 * Height of the floating AppHeader over this screen, including its wavy edge (0 when
 * the screen has no header). Scroll content is padded by this so it starts below the
 * header and then scrolls up under it.
 */
export function useHeaderInset() {
  return React.useContext(HeaderHeightContext) ?? 0;
}

/** Top-level children with fragments opened up, so each visible block is one entry. */
function blocks(children: React.ReactNode, prefix = ''): { key: string; node: React.ReactNode }[] {
  return React.Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}${React.isValidElement(child) && child.key != null ? child.key : index}`;
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      return blocks(child.props.children, `${key}/`);
    }
    return [{ key, node: child }];
  });
}

/**
 * Wraps each block of a screen in its entrance step. A Bento is not wrapped: it gets
 * its starting step and its tiles enter one by one.
 */
function staggered(children: React.ReactNode) {
  let order = 0;
  return blocks(children).map(({ key, node }) => {
    if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === Bento) {
      const start = order;
      order += bentoSteps(node.props.children);
      return (
        <EnterOrderContext.Provider key={key} value={start}>
          {node}
        </EnterOrderContext.Provider>
      );
    }
    return (
      <Enter key={key} order={order++}>
        {node}
      </Enter>
    );
  });
}

/**
 * Returns a RefreshControl element, deliberately not a wrapper component: Android and
 * web clone this element and pass the scroll view in as its children and style, which
 * a wrapper would swallow (blank screen).
 */
function refresher(tint: string, refreshing: boolean, onRefresh?: () => void, offset = 0) {
  if (!onRefresh) return undefined;
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tint}
      colors={[tint]}
      // The spinner appears below the floating header, not behind it.
      progressViewOffset={offset}
    />
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
 * refresh, safe bottom inset, and the staggered entrance of its blocks each time the
 * screen is opened. Unbounded data belongs in GroupedList, not here.
 */
export function Screen({ children, refreshing = false, onRefresh, tabbed, noBottomInset, style }: Props) {
  const { colors } = useAppTheme();
  const paddingBottom = useBottomPadding(noBottomInset ? 'docked' : tabbed ? 'tabbed' : undefined);
  const headerInset = useHeaderInset();

  return (
    <EntranceProvider>
      <ScrollView
        style={[styles.base, { backgroundColor: colors.screen }]}
        contentContainerStyle={[styles.content, { paddingTop: headerInset + spacing.lg, paddingBottom }, style]}
        scrollIndicatorInsets={{ top: headerInset }}
        keyboardShouldPersistTaps="handled"
        refreshControl={refresher(colors.primary, refreshing, onRefresh, headerInset)}
      >
        {staggered(children)}
      </ScrollView>
    </EntranceProvider>
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
  /** Scrolls with the list, above the group (search fields, filter chips). */
  header?: React.ReactElement;
  /** Shown instead of the group when `data` is empty. */
  empty?: React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  tabbed?: boolean;
  separatorInset?: boolean | number;
}) {
  const { colors } = useAppTheme();
  const paddingBottom = useBottomPadding(tabbed ? 'tabbed' : undefined);
  const headerInset = useHeaderInset();
  const last = data.length - 1;

  return (
    <EntranceProvider>
    <FlatList
      style={[styles.base, { backgroundColor: colors.screen }]}
      contentContainerStyle={[styles.listContent, { paddingTop: headerInset + spacing.sm, paddingBottom }]}
      scrollIndicatorInsets={{ top: headerInset }}
      data={data}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={header ? <View style={styles.listHeader}>{header}</View> : undefined}
      ListEmptyComponent={empty}
      refreshControl={refresher(colors.primary, refreshing, onRefresh, headerInset)}
      renderItem={({ item, index }) => (
        // Rows on the first screenful cascade in; rows scrolled to later are just there.
        <Enter order={index}>
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
        </Enter>
      )}
    />
    </EntranceProvider>
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
  listContent: { flexGrow: 1 },
  listHeader: { paddingBottom: spacing.sm },
  cell: {
    marginHorizontal: spacing.lg,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cellFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  cellLast: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
