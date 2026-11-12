import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { spacing } from '@/src/theme/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: ViewStyle;
}

/** Standard page shell: themed background, consistent padding, pull to refresh. */
export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  padded = true,
  style,
}: Props) {
  const { colors } = useAppTheme();
  const base = [styles.base, { backgroundColor: colors.screen }, style];
  const inner = padded ? styles.padded : undefined;

  if (!scroll) {
    return <View style={[base, inner]}>{children}</View>;
  }

  return (
    <ScrollView
      style={base}
      contentContainerStyle={[inner, styles.grow]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  padded: { padding: spacing.lg },
  grow: { paddingBottom: spacing.xxl * 2 },
});
