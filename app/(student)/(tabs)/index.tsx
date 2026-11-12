import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BatchRow } from '@/src/components/BatchRow';
import { useDataGate } from '@/src/components/DataGate';
import { useConfirmSignOut } from '@/src/components/HeaderButton';
import { Screen } from '@/src/components/Screen';
import { StatusTimeline } from '@/src/components/StatusTimeline';
import {
  EmptyState,
  Group,
  GroupBody,
  Lead,
  Notice,
  Progress,
  SectionHeader,
  Touchable,
  Txt,
} from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing, STATUS_META } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { percent } from '@/src/utils/format';

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

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Lead overline={student.registrationNo} title={meta.label} body={meta.description} />

      {!hasCourseAccess && student.status !== 'REJECTED' && (
        <Notice
          tone="neutral"
          icon="lock-outline"
          title="Course content is locked"
          message="Modules unlock once an admin approves your registration and allocates a batch."
          style={styles.notice}
        />
      )}

      {hasCourseAccess && !!course && (
        <>
          <SectionHeader title="Course" />
          <Group>
            <Touchable
              onPress={() => router.push('/(student)/(tabs)/course')}
              style={styles.course}
              accessibilityLabel={`${course.title}, ${progress} percent complete`}
            >
              <Txt v="heading">{course.title}</Txt>
              <Txt v="caption" muted>
                {modules.length} modules · {done} of {content.length} items done
              </Txt>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <Progress value={progress / 100} />
                </View>
                <Txt v="label" chrome>
                  {progress}%
                </Txt>
              </View>
            </Touchable>
          </Group>
        </>
      )}

      {!!batch && (
        <>
          <SectionHeader title="Batch" />
          <Group>
            <BatchRow
              batch={batch}
              seatsTaken={0}
              hideSeats
              onPress={() => router.push('/(student)/(tabs)/batch')}
              pushes
            />
          </Group>
        </>
      )}

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
  notice: { marginTop: spacing.lg },
  course: { padding: spacing.lg, gap: spacing.xs },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  progressTrack: { flex: 1 },
});
