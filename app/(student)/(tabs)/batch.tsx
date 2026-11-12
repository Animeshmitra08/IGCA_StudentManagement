import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text } from 'react-native-paper';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, InfoRow, SectionHeader } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { daysBetween, formatDate, initials } from '@/src/utils/format';

export default function StudentBatch() {
  const { colors } = useAppTheme();
  const { refresh, refreshing, seatsTaken, studentsOfBatch } = useData();
  const { student, course, batch } = useCurrentStudent();

  if (!student) return null;

  if (!batch) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="My Batch" />
        <EmptyState
          icon="calendar-question-outline"
          title="No batch allocated"
          message={
            student.status === 'REJECTED'
              ? 'Your registration was rejected, so no batch was allocated.'
              : 'The admin allocates a batch once your registration is approved.'
          }
        />
      </View>
    );
  }

  const classmates = studentsOfBatch(batch.id).filter((s) => s.id !== student.id);
  const totalDays = daysBetween(batch.startDate, batch.endDate);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="My Batch" subtitle={batch.code} />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        <BatchCard batch={batch} course={course} seatsTaken={seatsTaken(batch.id)} />

        <SectionHeader title="Schedule Details" />
        <Card style={styles.card}>
          <InfoRow label="Course" value={course?.title} icon="bookshelf" />
          <InfoRow label="Batch Code" value={batch.code} icon="identifier" />
          <InfoRow label="Start Date" value={formatDate(batch.startDate)} icon="calendar-start" />
          <InfoRow label="End Date" value={formatDate(batch.endDate)} icon="calendar-end" />
          <InfoRow label="Duration" value={`${totalDays} days`} icon="timer-sand" />
          <InfoRow label="Class Days" value={batch.days} icon="calendar-week" />
          <InfoRow label="Timing" value={`${batch.startTime} - ${batch.endTime}`} icon="clock-outline" />
          <InfoRow label="Mode" value={`${batch.mode} · ${batch.room}`} icon="map-marker-outline" />
          <InfoRow label="Allocated On" value={formatDate(student.allocatedOn)} icon="check-decagram-outline" />
        </Card>

        <SectionHeader
          title="Classmates"
          subtitle={`${classmates.length} other student${classmates.length === 1 ? '' : 's'} in this batch`}
        />
        {classmates.length === 0 ? (
          <Card>
            <EmptyState icon="account-group-outline" title="You are the first one here" />
          </Card>
        ) : (
          <Card style={styles.card}>
            {classmates.map((mate, index) => (
              <View
                key={mate.id}
                style={[
                  styles.mate,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
                ]}
              >
                <Avatar.Text
                  size={36}
                  label={initials(mate.fullName)}
                  style={{ backgroundColor: mate.avatarColor }}
                  labelStyle={{ fontSize: 13, fontWeight: '700' }}
                  color="#FFFFFF"
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {mate.fullName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    {mate.city}
                  </Text>
                </View>
                <Icon source="account-outline" size={16} color={colors.muted} />
              </View>
            ))}
          </Card>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.xl },
  mate: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
});
