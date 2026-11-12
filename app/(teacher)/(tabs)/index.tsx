import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { BatchRow } from '@/src/components/BatchRow';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherOverview() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { batches, courseById, seatsTaken, studentsOfBatch, courseContent, modulesOf, refresh, refreshing } =
    useData();
  const gate = useDataGate('list');
  if (gate) return gate;

  const myCourseIds = user?.courseIds ?? [];
  const myBatches = batches.filter((b) => b.teacherId === user?.id);
  const myStudents = myBatches.flatMap((b) => studentsOfBatch(b.id));
  const myContent = myCourseIds.flatMap((id) => courseContent(id));
  const myModules = myCourseIds.flatMap((id) => modulesOf(id));

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      {!!user && (
        <View style={styles.identity}>
          <Txt v="heading">{user.name}</Txt>
          {!!user.designation && <Txt muted>{user.designation}</Txt>}
        </View>
      )}

      <SectionHeader title={`Your batches (${myBatches.length})`} />
      {myBatches.length === 0 ? (
        <Group>
          <EmptyState
            fill={false}
            icon="calendar-blank-outline"
            title="No batches assigned yet"
            body="Batches the admin assigns to you appear here."
          />
        </Group>
      ) : (
        <Group>
          {myBatches.map((batch) => (
            <BatchRow
              key={batch.id}
              batch={batch}
              course={courseById(batch.courseId)}
              seatsTaken={seatsTaken(batch.id)}
              onPress={() => router.push({ pathname: '/(teacher)/batch/[id]', params: { id: batch.id } })}
              pushes
            />
          ))}
        </Group>
      )}

      <SectionHeader title="Teaching" />
      <Group>
        <Row
          leading={<Icon source="account-group-outline" size={22} color={colors.muted} />}
          title="Students"
          subtitle="Across all your batches"
          trailing={<Txt v="bodyStrong" muted>{myStudents.length}</Txt>}
          onPress={() => router.push('/(teacher)/(tabs)/students')}
          pushes
          accessibilityLabel={`Students, ${myStudents.length}`}
        />
        <Row
          leading={<Icon source="play-box-multiple-outline" size={22} color={colors.muted} />}
          title="Course content"
          subtitle={`${myModules.length} modules`}
          trailing={<Txt v="bodyStrong" muted>{myContent.length}</Txt>}
          onPress={() => router.push('/(teacher)/(tabs)/content')}
          pushes
          accessibilityLabel={`Course content, ${myContent.length} items in ${myModules.length} modules`}
        />
      </Group>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { gap: 2, paddingHorizontal: spacing.xs, paddingTop: spacing.sm },
});
