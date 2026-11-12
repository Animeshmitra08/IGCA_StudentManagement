import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { CourseCard } from '@/src/components/CourseCard';
import { Screen } from '@/src/components/Screen';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatCurrency } from '@/src/utils/format';

export default function AdminCourses() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { courses, modulesOf, courseContent, batchesOf, studentsOfCourse, refresh, refreshing } =
    useData();

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Courses" subtitle={`${courses.length} courses in the catalogue`} />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            moduleCount={modulesOf(course.id).length}
            contentCount={courseContent(course.id).length}
            onPress={() =>
              router.push({ pathname: '/(admin)/course/[id]', params: { id: course.id } })
            }
            footer={
              <Text variant="bodySmall" style={{ color: colors.muted, marginTop: spacing.xs }}>
                {studentsOfCourse(course.id).length} students · {batchesOf(course.id).length} batches ·{' '}
                {formatCurrency(course.fee)}
              </Text>
            }
          />
        ))}
      </Screen>
    </View>
  );
}
