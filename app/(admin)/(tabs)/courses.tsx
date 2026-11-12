import React from 'react';
import { useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { GroupedList } from '@/src/components/Screen';
import { EmptyState, Row } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { formatCurrency } from '@/src/utils/format';

export default function AdminCourses() {
  const router = useRouter();
  const { courses, modulesOf, batchesOf, studentsOfCourse, refresh, refreshing } = useData();
  const gate = useDataGate('list');
  if (gate) return gate;

  return (
    <GroupedList
      tabbed
      data={courses}
      keyExtractor={(c) => c.id}
      refreshing={refreshing}
      onRefresh={refresh}
      renderItem={(course) => (
        <Row
          title={course.title}
          subtitle={`${course.code} · ${course.durationWeeks} weeks · ${formatCurrency(course.fee)}`}
          meta={`${modulesOf(course.id).length} modules · ${batchesOf(course.id).length} batches · ${studentsOfCourse(course.id).length} students`}
          onPress={() => router.push({ pathname: '/(admin)/course/[id]', params: { id: course.id } })}
          pushes
        />
      )}
      empty={<EmptyState icon="bookshelf" title="No courses yet" body="Courses in the catalogue are listed here." />}
    />
  );
}
