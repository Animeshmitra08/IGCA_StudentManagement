import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Txt } from './ui';
import { radius, spacing, STATUS_META, statusColors } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

/** Enrolment status: colour is always paired with an icon and a label. */
export function StatusChip({ status }: { status: StudentStatus }) {
  const { colors } = useAppTheme();
  const meta = STATUS_META[status];
  const tone = statusColors(colors, status);

  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <Icon source={meta.icon} size={14} color={tone.fg} />
      <Txt v="label" color={tone.fg} chrome>
        {meta.label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
