import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { BatchRow } from '@/src/components/BatchRow';
import { Bento, BentoRow, FactTile, StatTile, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { ModuleGroup } from '@/src/components/ModuleGroup';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatCurrency } from '@/src/utils/format';

export default function AdminCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { courseById, modulesOf, contentOf, courseContent, batchesOf, studentsOfCourse, seatsTaken } =
    useData();
  const gate = useDataGate('detail');
  if (gate) return gate;

  const course = courseById(id);

  if (!course) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="book-alert-outline"
          title="Course not found"
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const modules = modulesOf(course.id);
  const content = courseContent(course.id);
  const batches = batchesOf(course.id);
  const students = studentsOfCourse(course.id);

  return (
    <>
      <Stack.Screen options={{ title: course.code }} />
      <Screen>
        <Bento>
          <Tile tone="primary">
            <Txt v="label" muted>
              {course.active ? 'Open for registration' : 'Closed for registration'}
            </Txt>
            <Txt v="title" accessibilityRole="header">
              {course.title}
            </Txt>
            {!!course.description && <Txt muted>{course.description}</Txt>}
          </Tile>
          <BentoRow>
            <StatTile span={2} icon="account-group-outline" value={students.length} label="Students" />
            <FactTile span={3} icon="cash" label="Fee" value={formatCurrency(course.fee)} />
          </BentoRow>
          <BentoRow>
            <FactTile span={3} icon="stairs" label="Level" value={course.level} />
            <FactTile span={2} icon="timer-outline" label="Duration" value={`${course.durationWeeks} weeks`} />
          </BentoRow>
        </Bento>

        <SectionHeader title={`Batches (${batches.length})`} />
        {batches.length === 0 ? (
          <Group>
            <EmptyState fill={false} icon="calendar-blank-outline" title="No batches for this course" />
          </Group>
        ) : (
          <Group>
            {batches.map((batch) => (
              <BatchRow
                key={batch.id}
                batch={batch}
                seatsTaken={seatsTaken(batch.id)}
                onPress={() => router.push({ pathname: '/(admin)/batch/[id]', params: { id: batch.id } })}
                pushes
              />
            ))}
          </Group>
        )}

        <SectionHeader title={`Modules (${modules.length}) · ${content.length} items`} />
        {modules.length === 0 ? (
          <Group>
            <EmptyState fill={false} icon="folder-open-outline" title="No modules yet" />
          </Group>
        ) : (
          modules.map((module) => <ModuleGroup key={module.id} module={module} items={contentOf(module.id)} />)
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
