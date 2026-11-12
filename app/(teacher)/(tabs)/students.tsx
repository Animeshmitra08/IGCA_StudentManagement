import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { Card, EmptyState } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherStudents() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { batches, students, courseById, batchById, refresh, refreshing } = useData();
  const [query, setQuery] = useState('');

  const myBatchIds = useMemo(
    () => batches.filter((b) => b.teacherId === user?.id).map((b) => b.id),
    [batches, user?.id],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => !!s.batchId && myBatchIds.includes(s.batchId))
      .filter((s) => (!q ? true : s.fullName.toLowerCase().includes(q) || s.registrationNo.toLowerCase().includes(q)));
  }, [students, myBatchIds, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="My Students" subtitle={`${visible.length} across your batches`} />

      <View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Searchbar
          placeholder="Search students"
          value={query}
          onChangeText={setQuery}
          style={[styles.search, { backgroundColor: colors.surfaceVariant }]}
          inputStyle={{ fontSize: 14, minHeight: 0 }}
          elevation={0}
        />
      </View>

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {visible.length === 0 ? (
          <Card>
            <EmptyState
              icon="account-search-outline"
              title="No students yet"
              message="Students appear here once the admin allocates them to your batches."
            />
          </Card>
        ) : (
          visible.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              courseTitle={courseById(student.courseId)?.title}
              batchCode={batchById(student.batchId)?.code}
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  search: { marginHorizontal: spacing.lg, borderRadius: radius.md, height: 42 },
});
