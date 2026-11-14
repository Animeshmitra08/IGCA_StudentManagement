import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Bento, BentoRow, RingHero, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { ProgressRing } from '@/src/components/ProgressRing';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { percent } from '@/src/utils/format';
import type { CourseModule } from '@/src/types';

/** Modules two to a row; an odd one out takes the full width. */
function pairs(modules: CourseModule[]) {
  const rows: CourseModule[][] = [];
  for (let i = 0; i < modules.length; i += 2) rows.push(modules.slice(i, i + 2));
  return rows;
}

export default function StudentCourse() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { refresh, refreshing, modulesOf, contentOf, courseContent } = useData();
  const { student, course, hasCourseAccess } = useCurrentStudent();
  const gate = useDataGate('detail');
  if (gate) return gate;

  if (!student || !course) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState icon="bookshelf" title="No course on your account yet" />
      </View>
    );
  }

  if (!hasCourseAccess) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="lock-outline"
          title={`${course.title} is locked`}
          body={
            student.status === 'REJECTED'
              ? 'Your registration was not approved, so course content is not available.'
              : 'Modules unlock once an admin approves your registration and allocates a batch.'
          }
        />
      </View>
    );
  }

  const modules = modulesOf(course.id);
  const allContent = courseContent(course.id);
  const doneTotal = student.completedContentIds.length;
  const overall = percent(doneTotal, allContent.length);

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Bento>
        <RingHero
          value={overall / 100}
          title={course.title}
          body={course.tagline}
          caption={`${doneTotal} of ${allContent.length} items done`}
          accessibilityLabel="Course progress"
        />
      </Bento>

      <SectionHeader title={`Modules (${modules.length})`} />
      {modules.length === 0 ? (
        <Group>
          <EmptyState fill={false} icon="folder-open-outline" title="No modules published yet" />
        </Group>
      ) : (
        <Bento>
          {pairs(modules).map((row) => (
            <BentoRow key={row[0].id}>
              {row.map((module) => {
                const items = contentOf(module.id);
                const doneCount = items.filter((i) => student.completedContentIds.includes(i.id)).length;
                const complete = items.length > 0 && doneCount === items.length;

                return (
                  <Tile
                    key={module.id}
                    tone={complete ? 'primary' : 'card'}
                    onPress={() => router.push({ pathname: '/(student)/module/[id]', params: { id: module.id } })}
                    pushes
                    accessibilityLabel={`Module ${module.order}, ${module.title}, ${doneCount} of ${items.length} done`}
                    style={styles.module}
                  >
                    <ProgressRing
                      value={percent(doneCount, items.length) / 100}
                      size={52}
                      stroke={5}
                      trackColor={complete ? colors.card : undefined}
                    />
                    <View style={styles.moduleBody}>
                      <Txt v="label" muted>
                        Module {module.order}
                      </Txt>
                      <Txt v="bodyStrong" numberOfLines={2}>
                        {module.title}
                      </Txt>
                      <Txt v="caption" muted>
                        {complete ? 'Completed' : `${doneCount} of ${items.length} done`}
                      </Txt>
                    </View>
                  </Tile>
                );
              })}
            </BentoRow>
          ))}
        </Bento>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  module: { gap: spacing.md },
  moduleBody: { gap: 2 },
});
