import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useDataGate } from '@/src/components/DataGate';
import { GroupedList } from '@/src/components/Screen';
import { StudentRow } from '@/src/components/StudentRow';
import { AVATAR_INSET, EmptyState, SearchField } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherStudents() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { batches, students, courseById, batchById, refresh, refreshing } = useData();
  const gate = useDataGate('list');
  const [query, setQuery] = useState('');

  const myBatchIds = useMemo(
    () => batches.filter((b) => b.teacherId === user?.id).map((b) => b.id),
    [batches, user?.id],
  );

  const mine = useMemo(
    () => students.filter((s) => !!s.batchId && myBatchIds.includes(s.batchId)),
    [students, myBatchIds],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mine;
    return mine.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.registrationNo.toLowerCase().includes(q),
    );
  }, [mine, query]);

  if (gate) return gate;

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <GroupedList
        tabbed
        // The search scrolls with the rows, so everything passes under the header.
        header={
          mine.length > 0 ? (
            <View style={styles.search}>
              <SearchField placeholder="Name or reg. no" value={query} onChangeText={setQuery} />
            </View>
          ) : undefined
        }
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
            showStatus
          />
        )}
        empty={
          mine.length > 0 ? (
            <EmptyState
              icon="account-search-outline"
              title="No matches"
              body={`None of your students match "${query.trim()}".`}
              action={{ label: 'Clear search', onPress: () => setQuery('') }}
            />
          ) : (
            <EmptyState
              icon="account-outline"
              title="No students yet"
              body="Students appear here once the admin allocates them to your batches."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
});
