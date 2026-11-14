import React from 'react';
import { StyleSheet, View } from 'react-native';

import { batchTone, scheduleTiles } from '@/src/components/BatchTiles';
import { Bento, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { AVATAR_INSET, Avatar, EmptyState, Group, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { titleCase } from '@/src/utils/format';

export default function StudentBatch() {
  const { colors } = useAppTheme();
  const { refresh, refreshing, studentsOfBatch } = useData();
  const { student, course, batch } = useCurrentStudent();
  const gate = useDataGate('detail');
  if (gate) return gate;

  if (!student || !batch) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="calendar-blank-outline"
          title="No batch yet"
          body={
            student?.status === 'REJECTED'
              ? 'Your registration was not approved, so no batch was allocated.'
              : 'An admin allocates your batch after approving your registration.'
          }
        />
      </View>
    );
  }

  const classmates = studentsOfBatch(batch.id).filter((s) => s.id !== student.id);

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      <Bento>
        <Tile tone={batchTone(batch.status)}>
          <Txt v="label" muted>
            {titleCase(batch.status)} · {batch.mode}
          </Txt>
          <Txt v="title" accessibilityRole="header">
            {batch.code}
          </Txt>
          {!!course && <Txt muted>{course.title}</Txt>}
        </Tile>
        {scheduleTiles(batch, { allocatedOn: student.allocatedOn })}
      </Bento>

      <SectionHeader title={`Classmates (${classmates.length})`} />
      {classmates.length === 0 ? (
        <Group>
          <EmptyState
            fill={false}
            icon="account-group-outline"
            title="No classmates yet"
            body="Other students allocated to this batch appear here."
          />
        </Group>
      ) : (
        <Group separatorInset={AVATAR_INSET}>
          {classmates.map((mate) => (
            <Row key={mate.id} leading={<Avatar name={mate.fullName} />} title={mate.fullName} subtitle={mate.city} />
          ))}
        </Group>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
