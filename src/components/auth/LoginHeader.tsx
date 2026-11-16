import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppLogo } from './AppLogo';
import { CampusIllustration } from './CampusIllustration';
import { Txt } from '@/src/components/ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/** Brand row: logo, app name and tagline, aligned to the left. */
export function LoginBrand() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.brand}>
      <AppLogo />
      <View style={styles.brandBody}>
        <Txt v="title" numberOfLines={1}>
          Student Management
        </Txt>
        <Txt v="label" color={colors.primary}>
          Learn • Track • Grow
        </Txt>
      </View>
    </View>
  );
}

/** Welcome heading on the left, campus illustration on the right. */
export function LoginHeader() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  // Keep room for the heading beside the drawing on narrow phones.
  const scale = width < 360 ? 0.72 : width < 400 ? 0.88 : 1;
  return (
    <View style={styles.hero}>
      <View style={styles.heroBody}>
        <Txt v="display" accessibilityRole="header">
          Welcome Back!
        </Txt>
        <Txt muted>Sign in to continue your learning journey.</Txt>
        <View style={[styles.underline, { backgroundColor: colors.primary }]} />
      </View>
      <CampusIllustration scale={scale} />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandBody: { flex: 1, gap: 2 },
  hero: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  heroBody: { flex: 1, gap: spacing.xs, paddingBottom: spacing.sm },
  underline: { width: 44, height: 4, borderRadius: radius.pill, marginTop: spacing.sm },
});
