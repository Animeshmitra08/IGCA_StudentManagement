import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { Card, EmptyState, InfoRow, SectionHeader } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';

export default function TeacherBatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { batchById, courseById, studentsOfBatch, seatsTaken } = useData();

  const batch = batchById(id);

  if (!batch) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Batch" back />
        <EmptyState icon="calendar-alert" title="Batch not found" />
      </View>
    );
  }

  const course = courseById(batch.courseId);
  const enrolled = studentsOfBatch(batch.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title={batch.code} subtitle={course?.title} back />

      <Screen>
        <BatchCard batch={batch} course={course} seatsTaken={seatsTaken(batch.id)} />

        <SectionHeader title="Session Details" />
        <Card style={{ marginBottom: spacing.xl }}>
          <InfoRow label="Days" value={batch.days} icon="calendar-week" />
          <InfoRow label="Time" value={`${batch.startTime} - ${batch.endTime}`} icon="clock-outline" />
          <InfoRow label="Mode" value={`${batch.mode} · ${batch.room}`} icon="broadcast" />
          <InfoRow label="Starts" value={formatDate(batch.startDate)} icon="calendar-start" />
          <InfoRow label="Ends" value={formatDate(batch.endDate)} icon="calendar-end" />
        </Card>

        <SectionHeader title="Students" subtitle={`${enrolled.length} enrolled`} />
        {enrolled.length === 0 ? (
          <Card>
            <EmptyState icon="account-off-outline" title="No students allocated yet" />
          </Card>
        ) : (
          enrolled.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              courseTitle={course?.title}
              batchCode={batch.code}
            />
          ))
        )}
      </Screen>
    </View>
  );
}
