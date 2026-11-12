import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { radius, spacing, STATUS_META, statusColors } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

export function StatusChip({
  status,
  size = 'md',
}: {
  status: StudentStatus;
  size?: 'sm' | 'md';
}) {
  const { colors } = useAppTheme();
  const meta = STATUS_META[status];
  const tone = statusColors(colors, status);
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: tone.bg,
          paddingVertical: size === 'sm' ? 3 : 5,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        },
      ]}
    >
      <Icon source={meta.icon} size={iconSize} color={tone.fg} />
      <Text
        style={{
          color: tone.fg,
          fontSize: size === 'sm' ? 10.5 : 12,
          fontWeight: '700',
          letterSpacing: 0.2,
        }}
      >
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
