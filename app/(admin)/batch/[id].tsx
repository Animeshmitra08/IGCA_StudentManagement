import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { batchTone, scheduleTiles } from '@/src/components/BatchTiles';
import { Bento, RingHero } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { AVATAR_INSET, EmptyState, Group, SectionHeader } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { titleCase } from '@/src/utils/format';

export default function AdminBatchDetail() {
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
        <Bento>
          <RingHero
            tone={batchTone(batch.status)}
            value={enrolled.length / batch.capacity}
            ringColor={full ? colors.error : undefined}
            overline={`${titleCase(batch.status)} · ${batch.mode}`}
            title={course?.title ?? batch.code}
            caption={full ? `Full · ${batch.capacity} seats` : `${enrolled.length} of ${batch.capacity} seats taken`}
            accessibilityLabel="Seats taken"
          />
          {scheduleTiles(batch)}
        </Bento>

        <SectionHeader title={`Students (${enrolled.length})`} />
        {enrolled.length === 0 ? (
          <Group>
            <EmptyState
              fill={false}
              icon="account-outline"
              title="No students in this batch"
              body="Approve a registration and allocate it to this batch to fill seats."
            />
          </Group>
        ) : (
          <Group separatorInset={AVATAR_INSET}>
            {enrolled.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                showStatus
                onPress={() => router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })}
              />
            ))}
          </Group>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
