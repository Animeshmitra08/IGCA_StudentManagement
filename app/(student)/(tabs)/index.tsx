import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import {
  Bento,
  BentoCol,
  BentoRow,
  FactTile,
  StatTile,
  statusTone,
  Tile,
  tileColors,
} from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { useConfirmSignOut } from '@/src/components/HeaderButton';
import { ProgressRing } from '@/src/components/ProgressRing';
import { Screen } from '@/src/components/Screen';
import { StatusTimeline } from '@/src/components/StatusTimeline';
import { EmptyState, Group, GroupBody, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing, STATUS_META } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatShortDate, percent } from '@/src/utils/format';

export default function StudentHome() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { refresh, refreshing, modulesOf, courseContent } = useData();
  const { student, course, batch, hasCourseAccess } = useCurrentStudent();
  const confirmSignOut = useConfirmSignOut();
  const gate = useDataGate('detail');
  if (gate) return gate;

  if (!student) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="account-question-outline"
          title="No student record on this account"
          body="Contact the administration office to link your registration."
          action={{ label: 'Sign out', onPress: confirmSignOut }}
        />
      </View>
    );
  }

  const modules = modulesOf(student.courseId);
  const content = courseContent(student.courseId);
  const done = student.completedContentIds.length;
  const progress = percent(done, content.length);
  const meta = STATUS_META[student.status];
  const tone = statusTone(student.status);

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Bento>
        <Tile tone={tone}>
          <View style={styles.statusHead}>
            <Icon source={meta.icon} size={28} color={tileColors(colors, tone).accent} />
            <Txt v="label" muted>
              {student.registrationNo}
            </Txt>
          </View>
          <Txt v="title" accessibilityRole="header">
            {meta.label}
          </Txt>
          <Txt muted>{meta.description}</Txt>
        </Tile>

        {!hasCourseAccess && student.status !== 'REJECTED' && (
          <Tile tone="neutral" style={styles.locked}>
            <Icon source="lock-outline" size={22} color={colors.onSurfaceVariant} />
            <View style={styles.lockedBody}>
              <Txt v="bodyStrong">Course content is locked</Txt>
              <Txt v="caption" muted>
                Modules unlock once an admin approves your registration and allocates a batch.
              </Txt>
            </View>
          </Tile>
        )}

        {hasCourseAccess && !!course && (
          <BentoRow>
            <Tile
              span={3}
              onPress={() => router.push('/(student)/(tabs)/course')}
              pushes
              accessibilityLabel={`${course.title}, ${progress} percent complete`}
              style={styles.course}
            >
              <Txt v="label" muted>
                Course progress
              </Txt>
              <ProgressRing value={progress / 100} size={116} style={styles.ring} />
              <Txt v="bodyStrong" numberOfLines={2}>
                {course.title}
              </Txt>
            </Tile>
            <BentoCol span={2}>
              <StatTile icon="view-grid-outline" value={modules.length} label="Modules" />
              <StatTile
                tone="primary"
                icon="check-circle-outline"
                value={done}
                label={`of ${content.length} items done`}
              />
            </BentoCol>
          </BentoRow>
        )}

        {!!batch && (
          <BentoRow>
            <Tile
              span={3}
              onPress={() => router.push('/(student)/(tabs)/batch')}
              pushes
              accessibilityLabel={`Batch ${batch.code}, ${batch.days}, ${batch.startTime} to ${batch.endTime}`}
            >
              <Txt v="label" muted>
                Your batch
              </Txt>
              <Txt v="heading" numberOfLines={1}>
                {batch.code}
              </Txt>
              <Txt v="caption" muted numberOfLines={1}>
                {batch.days}
              </Txt>
              <Txt v="caption" muted numberOfLines={1}>
                {batch.startTime} - {batch.endTime}
              </Txt>
            </Tile>
            <FactTile
              span={2}
              tone="info"
              icon="calendar-start"
              label="Starts"
              value={formatShortDate(batch.startDate)}
            />
          </BentoRow>
        )}
      </Bento>

      <SectionHeader title="Your enrolment" />
      {student.status === 'REJECTED' ? (
        <StatusTimeline student={student} />
      ) : (
        <Group>
          <GroupBody>
            <StatusTimeline student={student} batchCode={batch?.code} />
          </GroupBody>
        </Group>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  locked: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lockedBody: { flex: 1, gap: 2 },
  course: { gap: spacing.md },
  ring: { alignSelf: 'center' },
});
