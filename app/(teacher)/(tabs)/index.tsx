import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { BatchRow } from '@/src/components/BatchRow';
import { Bento, BentoCol, BentoRow, CountUp, StatTile, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { Avatar, EmptyState, Group, SectionHeader, Txt } from '@/src/components/ui';
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
  const across = myStudents.length === 1 ? 'student across your batches' : 'students across your batches';

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Bento>
        {!!user && (
          <Tile style={styles.identity}>
            <Avatar name={user.name} size={56} />
            <View style={styles.identityBody}>
              <Txt v="title" accessibilityRole="header">
                {user.name}
              </Txt>
              {!!user.designation && <Txt muted>{user.designation}</Txt>}
            </View>
          </Tile>
        )}
        <BentoRow>
          <Tile
            span={3}
            tone="solid"
            onPress={() => router.push('/(teacher)/(tabs)/students')}
            pushes
            accessibilityLabel={`${myStudents.length} ${across}`}
            style={styles.hero}
          >
            <Icon source="account-group-outline" size={26} color={colors.onPrimary} />
            <View>
              <CountUp value={myStudents.length} v="display" />
              <Txt>{across}</Txt>
            </View>
          </Tile>
          <BentoCol span={2}>
            <StatTile tone="info" icon="calendar-month-outline" value={myBatches.length} label="Batches" />
            <StatTile
              icon="play-box-multiple-outline"
              value={myContent.length}
              label={`Items in ${myModules.length} modules`}
              onPress={() => router.push('/(teacher)/(tabs)/content')}
            />
          </BentoCol>
        </BentoRow>
      </Bento>

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityBody: { flex: 1, gap: 2 },
  hero: { justifyContent: 'space-between', gap: spacing.xl },
});
