import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BatchRow } from '@/src/components/BatchRow';
import { useDataGate } from '@/src/components/DataGate';
import { GroupedList } from '@/src/components/Screen';
import { EmptyState, FilterChips } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function AdminBatches() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { batches, courses, courseById, seatsTaken, refresh, refreshing } = useData();
  const gate = useDataGate('list');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  const visible = useMemo(
    () => (courseFilter === 'ALL' ? batches : batches.filter((b) => b.courseId === courseFilter)),
    [batches, courseFilter],
  );

  if (gate) return gate;

  const chips = [
    { key: 'ALL', label: 'All', count: batches.length },
    ...courses.map((c) => ({
      key: c.id,
      label: c.code,
      count: batches.filter((b) => b.courseId === c.id).length,
    })),
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <View style={styles.toolbar}>
        <FilterChips items={chips} value={courseFilter} onChange={setCourseFilter} />
      </View>

      <GroupedList
        tabbed
        data={visible}
        keyExtractor={(b) => b.id}
        refreshing={refreshing}
        onRefresh={refresh}
        renderItem={(batch) => (
          <BatchRow
            batch={batch}
            course={courseById(batch.courseId)}
            seatsTaken={seatsTaken(batch.id)}
            onPress={() => router.push({ pathname: '/(admin)/batch/[id]', params: { id: batch.id } })}
            pushes
          />
        )}
        empty={
          courseFilter === 'ALL' ? (
            <EmptyState icon="calendar-blank-outline" title="No batches yet" />
          ) : (
            <EmptyState
              icon="calendar-blank-outline"
              title="No batches for this course"
              action={{ label: 'Show all batches', onPress: () => setCourseFilter('ALL') }}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { paddingTop: spacing.sm },
});
