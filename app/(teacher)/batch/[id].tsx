import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { AVATAR_INSET, EmptyState, Group, InfoRow, Lead, Progress, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, titleCase } from '@/src/utils/format';

export default function TeacherBatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { batchById, courseById, studentsOfBatch } = useData();
  const gate = useDataGate('detail');
  if (gate) return gate;

  const batch = batchById(id);

  if (!batch) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="calendar-alert"
          title="Batch not found"
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const course = courseById(batch.courseId);
  const enrolled = studentsOfBatch(batch.id);
  const full = enrolled.length >= batch.capacity;

  return (
    <>
      <Stack.Screen options={{ title: batch.code }} />
      <Screen>
        <Lead
          overline={`${titleCase(batch.status)} · ${batch.mode}`}
          title={course?.title ?? batch.code}
        >
          <View style={styles.seats}>
            <Progress value={enrolled.length / batch.capacity} color={full ? colors.error : undefined} />
            <Txt v="caption" color={full ? colors.error : colors.muted}>
              {full ? `Full · ${batch.capacity} seats` : `${enrolled.length} of ${batch.capacity} seats taken`}
            </Txt>
          </View>
        </Lead>

        <SectionHeader title="Sessions" />
        <Group>
          <InfoRow label="Days" value={batch.days} />
          <InfoRow label="Time" value={`${batch.startTime} - ${batch.endTime}`} />
          <InfoRow label="Room" value={batch.room} />
          <InfoRow label="Starts" value={formatDate(batch.startDate)} />
          <InfoRow label="Ends" value={formatDate(batch.endDate)} />
        </Group>

        <SectionHeader title={`Students (${enrolled.length})`} />
        {enrolled.length === 0 ? (
          <Group>
            <EmptyState fill={false} icon="account-outline" title="No students allocated yet" />
          </Group>
        ) : (
          <Group separatorInset={AVATAR_INSET}>
            {enrolled.map((student) => (
              <StudentRow key={student.id} student={student} showStatus />
            ))}
          </Group>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  seats: { gap: spacing.sm, marginTop: spacing.md },
});
