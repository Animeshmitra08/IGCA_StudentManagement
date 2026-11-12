import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, IconButton, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { Card, EmptyState, SectionHeader, StatTile } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function AdminDashboard() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { stats, students, courses, batches, loading, refresh, refreshing, courseById, batchById } =
    useData();

  const pending = students
    .filter((s) => s.status === 'PENDING_APPROVAL')
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));

  const awaitingBatch = students.filter((s) => s.status === 'APPROVED');

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader
        title="Admin Dashboard"
        subtitle={user?.name}
        right={<IconButton icon="logout" size={20} onPress={signOut} />}
      />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {loading || !stats ? (
          <ActivityIndicator style={{ marginTop: spacing.xxl }} />
        ) : (
          <>
            <SectionHeader title="Students" subtitle="Registration pipeline at a glance" />
            <View style={styles.grid}>
              <StatTile
                label="Pending Approval"
                value={stats.students.pending}
                icon="clock-outline"
                tint={colors.warning}
                onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'PENDING_APPROVAL' } })}
              />
              <StatTile
                label="Approved"
                value={stats.students.approved}
                icon="check-decagram-outline"
                tint={colors.info}
                onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'APPROVED' } })}
              />
            </View>
            <View style={styles.grid}>
              <StatTile
                label="Active"
                value={stats.students.active}
                icon="school-outline"
                tint={colors.success}
                onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'ACTIVE' } })}
              />
              <StatTile
                label="Rejected"
                value={stats.students.rejected}
                icon="close-circle-outline"
                tint={colors.error}
                onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'REJECTED' } })}
              />
            </View>

            <SectionHeader title="Catalogue" subtitle="Courses, batches and published content" />
            <View style={styles.grid}>
              <StatTile
                label="Courses"
                value={stats.courses}
                icon="bookshelf"
                tint={colors.primary}
                onPress={() => router.push('/(admin)/(tabs)/courses')}
              />
              <StatTile
                label="Batches"
                value={stats.batches}
                icon="calendar-month-outline"
                tint={colors.secondary}
                onPress={() => router.push('/(admin)/(tabs)/batches')}
              />
              <StatTile
                label="Content"
                value={stats.content}
                icon="play-box-multiple-outline"
                tint="#DB2777"
              />
            </View>

            {awaitingBatch.length > 0 && (
              <Card style={[styles.alert, { backgroundColor: colors.infoContainer }]}>
                <Icon source="alert-circle-outline" size={20} color={colors.info} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '700', color: colors.info }}>
                    {awaitingBatch.length} approved student
                    {awaitingBatch.length === 1 ? '' : 's'} waiting for a batch
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.info, opacity: 0.85 }}>
                    Allocate a batch to move them to ALLOCATED.
                  </Text>
                </View>
                <Button
                  compact
                  mode="text"
                  onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'APPROVED' } })}
                >
                  View
                </Button>
              </Card>
            )}

            <SectionHeader
              title="Pending Approvals"
              subtitle={`${pending.length} awaiting review`}
              action={
                <Button
                  compact
                  mode="text"
                  onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'PENDING_APPROVAL' } })}
                >
                  See all
                </Button>
              }
            />

            {pending.length === 0 ? (
              <Card>
                <EmptyState
                  icon="check-all"
                  title="Inbox zero"
                  message="No registrations are waiting for review."
                />
              </Card>
            ) : (
              pending.slice(0, 5).map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  courseTitle={courseById(student.courseId)?.title}
                  batchCode={batchById(student.batchId)?.code}
                  onPress={() => router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })}
                />
              ))
            )}

            <SectionHeader title="Quick Links" />
            <View style={styles.quickRow}>
              <QuickLink
                icon="account-multiple-outline"
                label="All Students"
                count={students.length}
                onPress={() => router.push({ pathname: '/(admin)/(tabs)/students', params: { filter: 'ALL' } })}
              />
              <QuickLink
                icon="bookshelf"
                label="Courses"
                count={courses.length}
                onPress={() => router.push('/(admin)/(tabs)/courses')}
              />
              <QuickLink
                icon="calendar-month-outline"
                label="Batches"
                count={batches.length}
                onPress={() => router.push('/(admin)/(tabs)/batches')}
              />
            </View>
          </>
        )}
      </Screen>
    </View>
  );
}

function QuickLink({
  icon,
  label,
  count,
  onPress,
}: {
  icon: string;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Card onPress={onPress} style={styles.quickCard}>
      <View style={[styles.quickIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon source={icon} size={18} color={colors.primary} />
      </View>
      <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1}>
        {label}
      </Text>
      <Text variant="bodySmall" style={{ color: colors.muted }}>
        {count}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 0,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  quickRow: { flexDirection: 'row', gap: spacing.md },
  quickCard: { flex: 1, padding: spacing.md, alignItems: 'flex-start', gap: 2 },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});

