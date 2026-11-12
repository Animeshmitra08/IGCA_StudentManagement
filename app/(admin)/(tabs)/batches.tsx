import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function AdminBatches() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { batches, courses, courseById, seatsTaken, refresh, refreshing } = useData();
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  const visible = useMemo(
    () => (courseFilter === 'ALL' ? batches : batches.filter((b) => b.courseId === courseFilter)),
    [batches, courseFilter],
  );

  const chips = [{ id: 'ALL', label: 'All' }, ...courses.map((c) => ({ id: c.id, label: c.code }))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Batch Management" subtitle={`${batches.length} batches`} />

      <View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {chips.map((chip) => {
            const active = courseFilter === chip.id;
            return (
              <Text
                key={chip.id}
                onPress={() => setCourseFilter(chip.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceVariant,
                    color: active ? colors.onPrimary : colors.onSurfaceVariant,
                  },
                ]}
              >
                {chip.label}
              </Text>
            );
          })}
        </ScrollView>
      </View>

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {visible.length === 0 ? (
          <Card>
            <EmptyState icon="calendar-remove-outline" title="No batches found" />
          </Card>
        ) : (
          visible.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              course={courseById(batch.courseId)}
              seatsTaken={seatsTaken(batch.id)}
              onPress={() =>
                router.push({ pathname: '/(admin)/batch/[id]', params: { id: batch.id } })
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
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
