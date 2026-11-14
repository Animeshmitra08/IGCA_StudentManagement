import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { Bento, BentoCol, BentoRow, CountUp, StatTile, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { AVATAR_INSET, EmptyState, Group, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing, STATUS_META } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

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
  const countOf = (status: StudentStatus) => students.filter((s) => s.status === status).length;
  const waiting = pending.length === 1 ? 'registration waiting for review' : 'registrations waiting for review';

  const openStudents = (filter: StudentStatus | 'ALL') =>
    router.push({ pathname: '/(admin)/(tabs)/students', params: { filter } });

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Bento>
        <BentoRow>
          {/* The one thing an admin opens the app for: what needs a decision. */}
          <Tile
            span={3}
            tone="solid"
            onPress={() => openStudents('PENDING_APPROVAL')}
            pushes
            accessibilityLabel={`${pending.length} ${waiting}`}
            style={styles.hero}
          >
            <Icon source={STATUS_META.PENDING_APPROVAL.icon} size={26} color={colors.onPrimary} />
            <View>
              <CountUp value={pending.length} v="display" />
              <Txt>{waiting}</Txt>
            </View>
          </Tile>
          <BentoCol span={2}>
            <StatTile
              tone="info"
              icon="calendar-alert"
              value={countOf('APPROVED')}
              label="Approved, need a batch"
              onPress={() => openStudents('APPROVED')}
            />
            <StatTile
              icon="account-group-outline"
              value={students.length}
              label="All students"
              onPress={() => openStudents('ALL')}
            />
          </BentoCol>
        </BentoRow>
        <BentoRow>
          <StatTile
            icon={STATUS_META.ALLOCATED.icon}
            value={countOf('ALLOCATED')}
            label="Allocated"
            onPress={() => openStudents('ALLOCATED')}
          />
          <StatTile
            tone="primary"
            icon={STATUS_META.ACTIVE.icon}
            value={countOf('ACTIVE')}
            label="Active"
            onPress={() => openStudents('ACTIVE')}
          />
          <StatTile
            icon={STATUS_META.REJECTED.icon}
            value={countOf('REJECTED')}
            label="Rejected"
            onPress={() => openStudents('REJECTED')}
          />
        </BentoRow>
      </Bento>

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { justifyContent: 'space-between', gap: spacing.xl },
});
