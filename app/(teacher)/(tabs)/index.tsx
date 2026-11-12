import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, SectionHeader, StatTile } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherOverview() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    batches,
    courseById,
    seatsTaken,
    studentsOfBatch,
    courseContent,
    modulesOf,
    refresh,
    refreshing,
  } = useData();

  const myCourseIds = user?.courseIds ?? [];
  const myBatches = batches.filter((b) => b.teacherId === user?.id);
  const myStudents = myBatches.flatMap((b) => studentsOfBatch(b.id));
  const myContent = myCourseIds.flatMap((id) => courseContent(id));
  const myModules = myCourseIds.flatMap((id) => modulesOf(id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader
        title={`Hi, ${user?.name.split(' ')[0] ?? 'Teacher'}`}
        subtitle={user?.designation}
        right={<IconButton icon="logout" size={20} onPress={signOut} />}
      />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        <View style={styles.grid}>
          <StatTile label="My Batches" value={myBatches.length} icon="calendar-month-outline" tint={colors.primary} />
          <StatTile label="Students" value={myStudents.length} icon="account-group-outline" tint={colors.success} />
        </View>
        <View style={styles.grid}>
          <StatTile label="Modules" value={myModules.length} icon="folder-outline" tint={colors.info} />
          <StatTile label="Content" value={myContent.length} icon="play-box-outline" tint={colors.secondary} />
        </View>

        <SectionHeader title="My Batches" subtitle="Batches assigned to you" />
        {myBatches.length === 0 ? (
          <Card>
            <EmptyState icon="calendar-remove-outline" title="No batches assigned yet" />
          </Card>
        ) : (
          myBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              course={courseById(batch.courseId)}
              seatsTaken={seatsTaken(batch.id)}
              onPress={() =>
                router.push({ pathname: '/(teacher)/batch/[id]', params: { id: batch.id } })
              }
            />
          ))
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
});
