import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { initials } from '@/src/utils/format';

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  avatar?: { name: string; color: string };
  right?: React.ReactNode;
}

/** Shared top bar: optional back arrow, title block, avatar or custom actions. */
export function AppHeader({ title, subtitle, back, avatar, right }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {back && (
        <IconButton icon="arrow-left" size={22} onPress={() => router.back()} style={styles.back} />
      )}

      <View style={{ flex: 1, paddingLeft: back ? 0 : spacing.lg }}>
        <Text variant="titleLarge" style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {right}

      {!!avatar && (
        <Avatar.Text
          size={38}
          label={initials(avatar.name)}
          style={{ backgroundColor: avatar.color, marginRight: spacing.lg }}
          labelStyle={{ fontSize: 13, fontWeight: '700' }}
          color="#FFFFFF"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: { margin: 0, marginLeft: spacing.xs, marginRight: spacing.xs },
  title: { fontWeight: '800' },
});
