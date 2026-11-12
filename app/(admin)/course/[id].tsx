import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { ContentRow } from '@/src/components/ContentRow';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, InfoRow, Pill, SectionHeader, StatTile } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatCurrency } from '@/src/utils/format';

export default function AdminCourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { courseById, modulesOf, contentOf, courseContent, batchesOf, studentsOfCourse, seatsTaken } =
    useData();

  const course = courseById(id);

  if (!course) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Course" back />
        <EmptyState icon="book-alert-outline" title="Course not found" />
      </View>
    );
  }

  const modules = modulesOf(course.id);
  const content = courseContent(course.id);
  const batches = batchesOf(course.id);
  const students = studentsOfCourse(course.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title={course.title} subtitle={course.code} back />

      <Screen>
        <Card style={[styles.hero, { backgroundColor: course.color }]}>
          <Icon source={course.icon} size={28} color="#FFFFFF" />
          <Text variant="titleMedium" style={styles.heroTitle}>
            {course.title}
          </Text>
          <Text style={styles.heroSub}>{course.description}</Text>
        </Card>

        <View style={styles.grid}>
          <StatTile label="Modules" value={modules.length} icon="folder-outline" tint={colors.primary} />
          <StatTile label="Content" value={content.length} icon="play-box-outline" tint={colors.secondary} />
        </View>
        <View style={styles.grid}>
          <StatTile label="Batches" value={batches.length} icon="calendar-month-outline" tint={colors.info} />
          <StatTile label="Students" value={students.length} icon="account-group-outline" tint={colors.success} />
        </View>

        <SectionHeader title="Course Information" />
        <Card style={styles.card}>
          <InfoRow label="Code" value={course.code} icon="identifier" />
          <InfoRow label="Level" value={course.level} icon="signal-cellular-2" />
          <InfoRow label="Duration" value={`${course.durationWeeks} weeks`} icon="calendar-range" />
          <InfoRow label="Fee" value={formatCurrency(course.fee)} icon="currency-inr" />
          <InfoRow label="Status" value={course.active ? 'Active' : 'Inactive'} icon="toggle-switch-outline" />
        </Card>

        <SectionHeader title="Modules & Content" subtitle={`${content.length} published items`} />
        {modules.length === 0 && (
          <Card>
            <EmptyState icon="folder-open-outline" title="No modules created yet" />
          </Card>
        )}
        {modules.map((module) => {
          const items = contentOf(module.id);
          return (
            <Card key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHead}>
                <View style={[styles.moduleIndex, { backgroundColor: course.color + '1F' }]}>
                  <Text style={{ fontWeight: '800', color: course.color }}>{module.order}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                    {module.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={2}>
                    {module.description}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Pill icon="play-box-outline" label={`${items.length} items`} />
              </View>

              {items.map((item) => (
                <ContentRow key={item.id} item={item} />
              ))}
            </Card>
          );
        })}

        <SectionHeader title="Batches" subtitle={`${batches.length} scheduled`} />
        {batches.length === 0 ? (
          <Card>
            <EmptyState icon="calendar-remove-outline" title="No batches for this course" />
          </Card>
        ) : (
          batches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              seatsTaken={seatsTaken(batch.id)}
              onPress={() =>
                router.push({ pathname: '/(admin)/batch/[id]', params: { id: batch.id } })
              }
              compact
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.sm, borderWidth: 0, marginBottom: spacing.lg },
  heroTitle: { color: '#FFFFFF', fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  card: { marginBottom: spacing.lg },
  moduleCard: { marginBottom: spacing.md, paddingBottom: spacing.xs },
  moduleHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  moduleIndex: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
