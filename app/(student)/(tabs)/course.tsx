import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, ProgressBar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, Pill } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { percent } from '@/src/utils/format';

export default function StudentCourse() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { refresh, refreshing, modulesOf, contentOf, courseContent } = useData();
  const { student, course, hasCourseAccess } = useCurrentStudent();

  if (!student || !course) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="My Course" />
        <EmptyState icon="bookshelf" title="No course assigned yet" />
      </View>
    );
  }

  if (!hasCourseAccess) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="My Course" subtitle={course.title} />
        <EmptyState
          icon="lock-outline"
          title="Content locked"
          message="Your course modules unlock after admin approval and batch allocation."
        />
      </View>
    );
  }

  const modules = modulesOf(course.id);
  const allContent = courseContent(course.id);
  const overall = percent(student.completedContentIds.length, allContent.length);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="My Course" subtitle={course.title} />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        <Card style={[styles.hero, { backgroundColor: course.color }]}>
          <View style={styles.heroHead}>
            <Icon source={course.icon} size={26} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.heroTitle}>
                {course.title}
              </Text>
              <Text style={styles.heroSub}>{course.tagline}</Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <View style={styles.heroRow}>
              <Text style={styles.heroSub}>
                {student.completedContentIds.length} of {allContent.length} items completed
              </Text>
              <Text style={styles.heroPct}>{overall}%</Text>
            </View>
            <ProgressBar progress={overall / 100} color="#FFFFFF" style={styles.progress} />
          </View>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Modules
        </Text>

        {modules.map((module) => {
          const items = contentOf(module.id);
          const doneCount = items.filter((i) =>
            student.completedContentIds.includes(i.id),
          ).length;
          const pct = percent(doneCount, items.length);
          const complete = items.length > 0 && doneCount === items.length;

          return (
            <Card
              key={module.id}
              style={styles.moduleCard}
              onPress={() =>
                router.push({ pathname: '/(student)/module/[id]', params: { id: module.id } })
              }
            >
              <View style={styles.moduleHead}>
                <View
                  style={[
                    styles.moduleIndex,
                    { backgroundColor: complete ? colors.successContainer : course.color + '1F' },
                  ]}
                >
                  {complete ? (
                    <Icon source="check" size={18} color={colors.success} />
                  ) : (
                    <Text style={{ fontWeight: '800', color: course.color }}>{module.order}</Text>
                  )}
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                    {module.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={2}>
                    {module.description}
                  </Text>
                </View>

                <Icon source="chevron-right" size={20} color={colors.muted} />
              </View>

              <View style={styles.moduleMeta}>
                <Pill icon="play-box-outline" label={`${items.length} items`} />
                <Pill
                  icon="progress-check"
                  label={`${pct}% done`}
                  color={complete ? colors.success : undefined}
                  background={complete ? colors.successContainer : undefined}
                />
              </View>

              <ProgressBar
                progress={pct / 100}
                color={complete ? colors.success : course.color}
                style={styles.moduleProgress}
              />
            </Card>
          );
        })}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.lg, borderWidth: 0, marginBottom: spacing.xl },
  heroHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  heroTitle: { color: '#FFFFFF', fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroPct: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  progress: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  sectionTitle: { fontWeight: '700', marginBottom: spacing.md },
  moduleCard: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  moduleHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  moduleIndex: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleMeta: { flexDirection: 'row', gap: spacing.sm },
  moduleProgress: { height: 5, borderRadius: 3 },
});
