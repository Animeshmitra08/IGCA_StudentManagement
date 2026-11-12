import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, ProgressBar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { StatusChip } from '@/src/components/StatusChip';
import { StatusTimeline } from '@/src/components/StatusTimeline';
import { Card, EmptyState, SectionHeader, StatTile } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { radius, spacing, STATUS_META } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, percent } from '@/src/utils/format';

export default function StudentHome() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { refresh, refreshing, modulesOf, courseContent } = useData();
  const { student, course, batch, hasCourseAccess } = useCurrentStudent();

  if (!student) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Home" />
        <EmptyState icon="account-question-outline" title="No student record linked" />
      </View>
    );
  }

  const modules = modulesOf(student.courseId);
  const content = courseContent(student.courseId);
  const done = student.completedContentIds.length;
  const progress = percent(done, content.length);
  const meta = STATUS_META[student.status];

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader
        title={`Hi, ${student.fullName.split(' ')[0]}`}
        subtitle={student.registrationNo}
        avatar={{ name: student.fullName, color: student.avatarColor }}
      />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {/* Enrolment status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHead}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="labelMedium" style={{ color: colors.muted }}>
                ENROLMENT STATUS
              </Text>
              <StatusChip status={student.status} />
            </View>
            <View style={[styles.statusIcon, { backgroundColor: colors.primaryContainer }]}>
              <Icon source={meta.icon} size={22} color={colors.primary} />
            </View>
          </View>

          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {meta.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <StatusTimeline student={student} batchCode={batch?.code} />
        </Card>

        {/* Course progress */}
        {hasCourseAccess && !!course && (
          <>
            <SectionHeader
              title="My Course"
              action={
                <Button compact mode="text" onPress={() => router.push('/(student)/(tabs)/course')}>
                  Open
                </Button>
              }
            />
            <Card style={styles.courseCard}>
              <View style={styles.courseHead}>
                <View style={[styles.courseIcon, { backgroundColor: course.color + '1F' }]}>
                  <Icon source={course.icon} size={24} color={course.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                    {course.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    {modules.length} modules · {content.length} items
                  </Text>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <View style={styles.progressLabel}>
                  <Text variant="bodySmall" style={{ color: colors.muted, flex: 1 }}>
                    {done} of {content.length} completed
                  </Text>
                  <Text variant="bodySmall" style={{ fontWeight: '700', color: course.color }}>
                    {progress}%
                  </Text>
                </View>
                <ProgressBar progress={progress / 100} color={course.color} style={styles.progress} />
              </View>
            </Card>
          </>
        )}

        {/* Batch schedule */}
        {!!batch && (
          <>
            <SectionHeader title="Batch Schedule" />
            <Card style={styles.batchCard}>
              <View style={styles.batchHead}>
                <Text variant="titleSmall" style={{ fontWeight: '800', letterSpacing: 0.3, flex: 1 }}>
                  {batch.code}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  {batch.mode}
                </Text>
              </View>
              <View style={styles.tiles}>
                <StatTile label="Starts" value={formatDate(batch.startDate)} icon="calendar-start" tint={colors.info} />
                <StatTile label="Timing" value={batch.startTime} icon="clock-outline" tint={colors.success} />
              </View>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {batch.days} · {batch.startTime} - {batch.endTime} · {batch.room}
              </Text>
            </Card>
          </>
        )}

        {/* Gated state */}
        {!hasCourseAccess && student.status !== 'REJECTED' && (
          <Card style={[styles.lockCard, { backgroundColor: colors.neutralContainer }]}>
            <Icon source="lock-clock" size={22} color={colors.muted} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                Course content is locked
              </Text>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                Modules unlock once an admin approves your registration and allocates a batch.
              </Text>
            </View>
          </Card>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: { gap: spacing.md, marginBottom: spacing.xl },
  statusHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.xs },
  courseCard: { gap: spacing.lg, marginBottom: spacing.xl },
  courseHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: { flexDirection: 'row', alignItems: 'center' },
  progress: { height: 8, borderRadius: 4 },
  batchCard: { gap: spacing.md, marginBottom: spacing.xl },
  batchHead: { flexDirection: 'row', alignItems: 'center' },
  tiles: { flexDirection: 'row', gap: spacing.md },
  lockCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
});
