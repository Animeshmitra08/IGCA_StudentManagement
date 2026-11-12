import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/* ------------------------------------------------------------------ Card */

export function Card({
  children,
  style,
  onPress,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
}) {
  const { colors } = useAppTheme();
  const body = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        padded && styles.cardPadded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      {body}
    </Pressable>
  );
}

/* --------------------------------------------------------- SectionHeader */

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="bodySmall" style={{ color: colors.muted, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}

/* --------------------------------------------------------------- StatTile */

export function StatTile({
  label,
  value,
  icon,
  tint,
  onPress,
  style,
}: {
  label: string;
  value: number | string;
  icon: string;
  tint: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  return (
    <Card onPress={onPress} style={[styles.statTile, style]}>
      <View style={[styles.statIcon, { backgroundColor: tint + '22' }]}>
        <Icon source={icon} size={18} color={tint} />
      </View>
      <Text variant="headlineSmall" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={1}>
        {label}
      </Text>
    </Card>
  );
}

/* ---------------------------------------------------------------- InfoRow */

export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.infoRow}>
      {!!icon && <Icon source={icon} size={16} color={colors.muted} />}
      <Text variant="bodySmall" style={{ color: colors.muted, flex: 1 }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.infoValue} numberOfLines={2}>
        {value === null || value === undefined || value === '' ? '--' : String(value)}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------- EmptyState */

export function EmptyState({
  icon = 'inbox-outline',
  title,
  message,
}: {
  icon?: string;
  title: string;
  message?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.neutralContainer }]}>
        <Icon source={icon} size={28} color={colors.muted} />
      </View>
      <Text variant="titleSmall" style={{ marginTop: spacing.md }}>
        {title}
      </Text>
      {!!message && (
        <Text
          variant="bodySmall"
          style={{ color: colors.muted, textAlign: 'center', marginTop: spacing.xs }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ Pill */

export function Pill({
  label,
  color,
  background,
  icon,
}: {
  label: string;
  color?: string;
  background?: string;
  icon?: string;
}) {
  const { colors } = useAppTheme();
  const fg = color ?? colors.onSurfaceVariant;
  return (
    <View style={[styles.pill, { backgroundColor: background ?? colors.neutralContainer }]}>
      {!!icon && <Icon source={icon} size={12} color={fg} />}
      <Text style={{ color: fg, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardPadded: { padding: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { fontWeight: '700' },
  statTile: { flex: 1, minWidth: 140, padding: spacing.md, gap: 2 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontWeight: '800' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 7,
  },
  infoValue: { flex: 1.4, textAlign: 'right', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
});
