import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { Bento, BentoRow, FactTile, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { DocumentsGroup } from '@/src/components/DocumentsGroup';
import { useConfirmSignOut } from '@/src/components/HeaderButton';
import { Screen } from '@/src/components/Screen';
import { StatusChip } from '@/src/components/StatusChip';
import { Avatar, EmptyState, Group, InfoRow, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';

export default function StudentProfile() {
  const { colors } = useAppTheme();
  const confirmSignOut = useConfirmSignOut();
  const { student, course, batch } = useCurrentStudent();
  const gate = useDataGate('detail');
  if (gate) return gate;

  const signOutGroup = (
    <Group>
      <Row
        leading={<Icon source="logout" size={22} color={colors.error} />}
        title="Sign out"
        destructive
        onPress={confirmSignOut}
      />
    </Group>
  );

  if (!student) {
    return (
      <Screen tabbed>
        <EmptyState icon="account-question-outline" title="No profile on this account" />
        {signOutGroup}
      </Screen>
    );
  }

  return (
    <Screen tabbed>
      <Bento>
        <Tile style={styles.identity}>
          <Avatar name={student.fullName} size={56} />
          <View style={styles.identityBody}>
            <Txt v="title" accessibilityRole="header">
              {student.fullName}
            </Txt>
            <Txt muted numberOfLines={1}>
              {student.email}
            </Txt>
            <View style={styles.chip}>
              <StatusChip status={student.status} />
            </View>
          </View>
        </Tile>
        <BentoRow>
          <FactTile
            icon="card-account-details-outline"
            label="Registration no"
            value={student.registrationNo}
          />
          <FactTile
            tone={batch ? 'primary' : 'neutral'}
            icon="calendar-month-outline"
            label="Batch"
            value={batch?.code ?? 'Not allocated yet'}
          />
        </BentoRow>
        <FactTile icon="book-open-page-variant-outline" label="Course" value={course?.title} />
      </Bento>

      <SectionHeader title="Application" />
      <Group>
        <InfoRow label="Applied on" value={formatDate(student.appliedOn)} />
        <InfoRow label="Reviewed on" value={student.reviewedOn ? formatDate(student.reviewedOn) : 'Waiting for review'} />
      </Group>

      <SectionHeader title="Personal" />
      <Group>
        <InfoRow label="Date of birth" value={formatDate(student.dob)} />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Blood group" value={student.bloodGroup} />
      </Group>

      <SectionHeader title="Contact" />
      <Group>
        <InfoRow label="Phone" value={student.phone} />
        <InfoRow label="Alternate phone" value={student.altPhone} />
        <InfoRow label="Address" value={student.address} />
        <InfoRow label="City" value={[student.city, student.state].filter(Boolean).join(', ')} />
        <InfoRow label="Pincode" value={student.pincode} />
        <InfoRow label="Guardian" value={student.guardianName} />
        <InfoRow label="Guardian phone" value={student.guardianPhone} />
      </Group>

      <SectionHeader title="Education" />
      <Group>
        <InfoRow label="Qualification" value={student.education.qualification} />
        <InfoRow label="Institution" value={student.education.institution} />
        <InfoRow label="Board" value={student.education.board} />
        <InfoRow label="Year of passing" value={student.education.yearOfPassing} />
        <InfoRow label="Percentage" value={`${student.education.percentage}%`} />
      </Group>

      <SectionHeader title={`Documents (${student.documents.length})`} />
      <DocumentsGroup documents={student.documents} />

      <View style={styles.signOut}>{signOutGroup}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  identityBody: { flex: 1, gap: spacing.xs },
  chip: { marginTop: spacing.xs },
  signOut: { marginTop: spacing.xxl },
});
