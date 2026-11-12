import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import {
  AVATAR_INSET,
  EmptyState,
  Group,
  Notice,
  Row,
  SectionHeader,
  Txt,
} from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing, STATUS_META, statusColors } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

const BUCKETS: StudentStatus[] = ['PENDING_APPROVAL', 'APPROVED', 'ALLOCATED', 'ACTIVE', 'REJECTED'];
const PREVIEW = 5;

export default function AdminDashboard() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { students, refresh, refreshing, courseById, batchById } = useData();
  const gate = useDataGate('list');
  if (gate) return gate;

  const pending = students
    .filter((s) => s.status === 'PENDING_APPROVAL')
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
  const awaitingBatch = students.filter((s) => s.status === 'APPROVED').length;
  const countOf = (status: StudentStatus) => students.filter((s) => s.status === status).length;

  const openStudents = (filter: StudentStatus | 'ALL') =>
    router.push({ pathname: '/(admin)/(tabs)/students', params: { filter } });

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.lead} accessible accessibilityLabel={`${pending.length} registrations waiting for review`}>
        <Txt v="display">{pending.length}</Txt>
        <Txt muted>{pending.length === 1 ? 'registration waiting for review' : 'registrations waiting for review'}</Txt>
      </View>

      {awaitingBatch > 0 && (
        <Notice
          tone="info"
          icon="calendar-alert"
          title={`${awaitingBatch} approved ${awaitingBatch === 1 ? 'student needs' : 'students need'} a batch`}
          message="Allocate a batch so they can start the course."
          action={{ label: 'View', onPress: () => openStudents('APPROVED') }}
          style={styles.notice}
        />
      )}

      <SectionHeader
        title="Waiting for review"
        action={pending.length > PREVIEW ? { label: 'See all', onPress: () => openStudents('PENDING_APPROVAL') } : undefined}
      />
      {pending.length === 0 ? (
        <Group>
          <EmptyState
            fill={false}
            icon="check-all"
            title="Nothing to review"
            body="New registrations appear here as students submit them."
          />
        </Group>
      ) : (
        <Group separatorInset={AVATAR_INSET}>
          {pending.slice(0, PREVIEW).map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              courseTitle={courseById(student.courseId)?.title}
              batchCode={batchById(student.batchId)?.code}
              onPress={() => router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })}
            />
          ))}
        </Group>
      )}

      <SectionHeader title="All registrations" />
      <Group>
        {BUCKETS.map((status) => {
          const meta = STATUS_META[status];
          const count = countOf(status);
          return (
            <Row
              key={status}
              leading={<Icon source={meta.icon} size={22} color={statusColors(colors, status).fg} />}
              title={meta.label}
              trailing={
                <Txt v="bodyStrong" muted>
                  {count}
                </Txt>
              }
              onPress={() => openStudents(status)}
              pushes
              accessibilityLabel={`${meta.label}, ${count}`}
            />
          );
        })}
        <Row
          leading={<Icon source="account-group-outline" size={22} color={colors.muted} />}
          title="All students"
          trailing={
            <Txt v="bodyStrong" muted>
              {students.length}
            </Txt>
          }
          onPress={() => openStudents('ALL')}
          pushes
          accessibilityLabel={`All students, ${students.length}`}
        />
      </Group>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { gap: spacing.xs, paddingHorizontal: spacing.xs, paddingTop: spacing.sm },
  notice: { marginTop: spacing.lg },
});
