import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { Card, EmptyState, InfoRow, SectionHeader } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { daysBetween, formatDate } from '@/src/utils/format';

export default function AdminBatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
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

        <SectionHeader title="Schedule" />
        <Card style={{ marginBottom: spacing.xl }}>
          <InfoRow label="Course" value={course?.title} icon="bookshelf" />
          <InfoRow label="Start Date" value={formatDate(batch.startDate)} icon="calendar-start" />
          <InfoRow label="End Date" value={formatDate(batch.endDate)} icon="calendar-end" />
          <InfoRow label="Duration" value={`${daysBetween(batch.startDate, batch.endDate)} days`} icon="timer-sand" />
          <InfoRow label="Days" value={batch.days} icon="calendar-week" />
          <InfoRow label="Time" value={`${batch.startTime} - ${batch.endTime}`} icon="clock-outline" />
          <InfoRow label="Mode" value={batch.mode} icon="broadcast" />
          <InfoRow label="Room" value={batch.room} icon="map-marker-outline" />
          <InfoRow label="Capacity" value={`${enrolled.length} / ${batch.capacity}`} icon="account-group-outline" />
          <InfoRow label="Status" value={batch.status} icon="progress-clock" />
        </Card>

        <SectionHeader title="Enrolled Students" subtitle={`${enrolled.length} allocated`} />
        {enrolled.length === 0 ? (
          <Card>
            <EmptyState
              icon="account-off-outline"
              title="No students allocated"
              message="Approve a registration and allocate this batch to fill seats."
            />
          </Card>
        ) : (
          enrolled.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              courseTitle={course?.title}
              batchCode={batch.code}
              onPress={() =>
                router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })
              }
            />
          ))
        )}
      </Screen>
    </View>
  );
}
