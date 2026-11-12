import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, ProgressBar, Text } from 'react-native-paper';
import { Card, Pill } from './ui';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, percent } from '@/src/utils/format';
import type { Batch, Course } from '@/src/types';

export function BatchCard({
  batch,
  course,
  seatsTaken,
  selected,
  onPress,
  compact,
}: {
  batch: Batch;
  course?: Course;
  seatsTaken: number;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  const full = seatsTaken >= batch.capacity;
  const fill = percent(seatsTaken, batch.capacity);
  const accent = course?.color ?? colors.primary;

  const statusTone =
    batch.status === 'RUNNING'
      ? { fg: colors.success, bg: colors.successContainer }
      : batch.status === 'UPCOMING'
        ? { fg: colors.info, bg: colors.infoContainer }
        : { fg: colors.muted, bg: colors.neutralContainer };

  return (
    <Card
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.card,
        selected && { borderColor: accent, borderWidth: 2, backgroundColor: accent + '0D' },
      ])}
    >
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.code}>
            {batch.code}
          </Text>
          {!!course && (
            <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={1}>
              {course.title}
            </Text>
          )}
        </View>
        <Pill label={batch.status} color={statusTone.fg} background={statusTone.bg} />
      </View>

      <View style={styles.grid}>
        <Detail icon="calendar-start" label="Starts" value={formatDate(batch.startDate)} />
        <Detail icon="calendar-end" label="Ends" value={formatDate(batch.endDate)} />
        <Detail icon="calendar-week" label="Days" value={batch.days} />
        <Detail icon="clock-outline" label="Time" value={`${batch.startTime} - ${batch.endTime}`} />
        {!compact && <Detail icon="map-marker-outline" label="Mode" value={`${batch.mode} · ${batch.room}`} />}
      </View>

      <View style={styles.capacity}>
        <View style={styles.capacityLabel}>
          <Icon source="account-group-outline" size={13} color={colors.muted} />
          <Text style={{ color: colors.muted, fontSize: 11.5, flex: 1 }}>
            {seatsTaken} of {batch.capacity} seats filled
          </Text>
          {full && (
            <Text style={{ color: colors.error, fontSize: 11.5, fontWeight: '700' }}>FULL</Text>
          )}
        </View>
        <ProgressBar
          progress={fill / 100}
          color={full ? colors.error : accent}
          style={styles.progress}
        />
      </View>
    </Card>
  );
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.detail}>
      <Icon source={icon} size={14} color={colors.muted} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.muted, fontSize: 10.5 }}>{label}</Text>
        <Text style={{ fontSize: 12.5, fontWeight: '600' }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  code: { fontWeight: '800', letterSpacing: 0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  detail: { flexDirection: 'row', gap: 6, width: '50%', alignItems: 'center', paddingRight: spacing.sm },
  capacity: { gap: 6 },
  capacityLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  progress: { height: 6, borderRadius: 3 },
});
