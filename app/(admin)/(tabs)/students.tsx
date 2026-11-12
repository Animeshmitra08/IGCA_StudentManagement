import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { GroupedList } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { AVATAR_INSET, EmptyState, FilterChips, SearchField } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
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
  const gate = useDataGate('list');

  const [filter, setFilter] = useState<Filter>((params.filter as Filter) ?? 'PENDING_APPROVAL');
  const [query, setQuery] = useState('');

  // Keep the tab in sync when the dashboard links into a specific bucket.
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

  if (gate) return gate;

  const searching = query.trim().length > 0;
  const filterLabel = FILTERS.find((f) => f.key === filter)?.label.toLowerCase();

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <View style={styles.search}>
        <SearchField placeholder="Name, reg. no, email or phone" value={query} onChangeText={setQuery} />
      </View>
      <FilterChips
        items={FILTERS.map((item) => ({ ...item, count: counts[item.key] }))}
        value={filter}
        onChange={setFilter}
      />

      <GroupedList
        tabbed
        data={visible}
        keyExtractor={(s) => s.id}
        separatorInset={AVATAR_INSET}
        refreshing={refreshing}
        onRefresh={refresh}
        renderItem={(student) => (
          <StudentRow
            student={student}
            courseTitle={courseById(student.courseId)?.title}
            batchCode={batchById(student.batchId)?.code}
            showStatus={filter === 'ALL'}
            onPress={() => router.push({ pathname: '/(admin)/student/[id]', params: { id: student.id } })}
          />
        )}
        empty={
          searching ? (
            <EmptyState
              icon="account-search-outline"
              title="No matches"
              body={`No ${filter === 'ALL' ? '' : `${filterLabel} `}students match "${query.trim()}".`}
              action={{ label: 'Clear search', onPress: () => setQuery('') }}
            />
          ) : filter !== 'ALL' ? (
            <EmptyState
              icon="account-outline"
              title={`No ${filterLabel} students`}
              action={{ label: 'Show all students', onPress: () => setFilter('ALL') }}
            />
          ) : (
            <EmptyState
              icon="account-outline"
              title="No registrations yet"
              body="Students appear here once they register."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
});
