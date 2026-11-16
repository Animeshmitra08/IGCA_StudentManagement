import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { radius } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/** The app mark: a graduation cap over an open book, on an accent tile. */
export function AppLogo({ size = 48 }: { size?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.mark, { width: size, height: size, backgroundColor: colors.primary }]}
      importantForAccessibility="no-hide-descendants"
    >
      <Icon source="book-education" size={Math.round(size * 0.58)} color={colors.onPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
