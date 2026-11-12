import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, Lead, Progress, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { percent } from '@/src/utils/format';

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
      <Lead title={course.title} body={course.tagline}>
        <View style={styles.progress}>
          <Progress value={overall / 100} />
          <Txt v="caption" muted>
            {doneTotal} of {allContent.length} items done · {overall}%
          </Txt>
        </View>
      </Lead>

      <SectionHeader title={`Modules (${modules.length})`} />
      {modules.length === 0 ? (
        <Group>
          <EmptyState fill={false} icon="folder-open-outline" title="No modules published yet" />
        </Group>
      ) : (
        <Group separatorInset={spacing.lg + 24 + spacing.md}>
          {modules.map((module) => {
            const items = contentOf(module.id);
            const doneCount = items.filter((i) => student.completedContentIds.includes(i.id)).length;
            const complete = items.length > 0 && doneCount === items.length;

            return (
              <Row
                key={module.id}
                leading={
                  <View style={styles.marker}>
                    {complete ? (
                      <Icon source="check-circle" size={22} color={colors.success} />
                    ) : (
                      <Txt v="bodyStrong" muted chrome>
                        {module.order}
                      </Txt>
                    )}
                  </View>
                }
                title={module.title}
                subtitle={complete ? 'Completed' : `${doneCount} of ${items.length} done`}
                onPress={() => router.push({ pathname: '/(student)/module/[id]', params: { id: module.id } })}
                pushes
                accessibilityLabel={`Module ${module.order}, ${module.title}, ${doneCount} of ${items.length} done`}
              />
            );
          })}
        </Group>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progress: { gap: spacing.sm, marginTop: spacing.md },
  marker: { width: 24, alignItems: 'center' },
});
