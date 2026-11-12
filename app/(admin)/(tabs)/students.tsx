import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { Card, EmptyState } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

type Filter = StudentStatus | 'ALL';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'PENDING_APPROVAL', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'ALLOCATED', label: 'Allocated' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'ALL', label: 'All' },
];

export default function AdminStudents() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { students, courseById, batchById, refresh, refreshing } = useData();

  const [filter, setFilter] = useState<Filter>((params.filter as Filter) ?? 'PENDING_APPROVAL');
  const [query, setQuery] = useState('');

  // Keep the tab in sync when the dashboard deep links into a specific bucket.
  const routeFilter = params.filter as Filter | undefined;
  const [lastRouteFilter, setLastRouteFilter] = useState(routeFilter);
  if (routeFilter && routeFilter !== lastRouteFilter) {
    setLastRouteFilter(routeFilter);
    setFilter(routeFilter);
  }

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      PENDING_APPROVAL: 0, APPROVED: 0, ALLOCATED: 0, ACTIVE: 0, REJECTED: 0, ALL: students.length,
    };
    students.forEach((s) => { map[s.status] += 1; });
    return map;
  }, [students]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => (filter === 'ALL' ? true : s.status === filter))
      .filter((s) =>
        !q
          ? true
          : s.fullName.toLowerCase().includes(q) ||
            s.registrationNo.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.includes(q),
      )
      .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
  }, [students, filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Student Management" subtitle={`${students.length} registrations`} />

      <View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Searchbar
          placeholder="Search name, reg no, email"
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { backgroundColor: colors.surfaceVariant }]}
          inputStyle={{ fontSize: 14, minHeight: 0 }}
          icon="magnify"
          elevation={0}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Text
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    color: active ? colors.onPrimary : colors.onSurfaceVariant,
                  },
                ]}
              >
                {item.label} · {counts[item.key]}
              </Text>
            );
          })}
        </ScrollView>
      </View>

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {visible.length === 0 ? (
          <Card>
            <EmptyState
              icon="account-search-outline"
              title="No students found"
              message="Try a different filter or search term."
            />
          </Card>
        ) : (
          visible.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              courseTitle={courseById(student.courseId)?.title}
              batchCode={batchById(student.batchId)?.code}
              onPress={() =>
                router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })
              }
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  search: { marginHorizontal: spacing.lg, borderRadius: radius.md, height: 42 },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
