import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Progress, Touchable, Txt } from './ui';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, percent, titleCase } from '@/src/utils/format';
import type { Batch, Course } from '@/src/types';

/**
 * One batch in a list: code, schedule line and seat usage. With `selected` defined it
 * acts as a radio option (the allocate-batch picker).
 */
export function BatchRow({
  batch,
  course,
  seatsTaken,
  selected,
  onPress,
  pushes,
  hideSeats,
}: {
  batch: Batch;
  course?: Course;
  seatsTaken: number;
  selected?: boolean;
  onPress?: () => void;
  pushes?: boolean;
  /** Seat usage is an admin concern; students only need the schedule. */
  hideSeats?: boolean;
}) {
  const { colors } = useAppTheme();
  const full = seatsTaken >= batch.capacity;
  const fill = percent(seatsTaken, batch.capacity);

  const statusColor =
    batch.status === 'RUNNING' ? colors.success : batch.status === 'UPCOMING' ? colors.info : colors.muted;

  const body = (
    <>
      {selected !== undefined && (
        <Icon
          source={selected ? 'radiobox-marked' : 'radiobox-blank'}
          size={22}
          color={selected ? colors.primary : colors.outline}
        />
      )}

      <View style={styles.body}>
        <View style={styles.head}>
          <Txt v="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
            {batch.code}
          </Txt>
          <Txt v="label" color={statusColor} chrome>
            {titleCase(batch.status)}
          </Txt>
        </View>

        {!!course && (
          <Txt v="caption" muted numberOfLines={1}>
            {course.title}
          </Txt>
        )}
        <Txt v="caption" muted numberOfLines={1}>
          {formatDate(batch.startDate)} to {formatDate(batch.endDate)} · {batch.mode}
        </Txt>
        <Txt v="caption" muted numberOfLines={1}>
          {batch.days} · {batch.startTime} - {batch.endTime}
        </Txt>

        {!hideSeats && (
          <View style={styles.seats}>
            <View style={styles.track}>
              <Progress value={fill / 100} color={full ? colors.error : undefined} />
            </View>
            <Txt v="caption" color={full ? colors.error : colors.muted}>
              {full ? 'Full' : `${seatsTaken} of ${batch.capacity} seats`}
            </Txt>
          </View>
        )}
      </View>

      {pushes && <Icon source="chevron-right" size={20} color={colors.muted} />}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Touchable
      onPress={onPress}
      style={styles.row}
      accessibilityRole={selected !== undefined ? 'radio' : 'button'}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      accessibilityLabel={`Batch ${batch.code}`}
    >
      {body}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  body: { flex: 1, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  seats: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  track: { flex: 1 },
});
