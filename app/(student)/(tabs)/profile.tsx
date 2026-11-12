import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Icon, Text } from 'react-native-paper';

import { AppHeader } from '@/src/components/AppHeader';
import { Screen } from '@/src/components/Screen';
import { StatusChip } from '@/src/components/StatusChip';
import { Card, EmptyState, InfoRow, SectionHeader } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, initials } from '@/src/utils/format';

export default function StudentProfile() {
  const { colors } = useAppTheme();
  const { signOut } = useAuth();
  const { student, course, batch } = useCurrentStudent();

  if (!student) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Profile" />
        <EmptyState icon="account-question-outline" title="No profile found" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Profile" subtitle={student.registrationNo} />

      <Screen>
        <Card style={styles.hero}>
          <Avatar.Text
            size={72}
            label={initials(student.fullName)}
            style={{ backgroundColor: student.avatarColor }}
            labelStyle={{ fontSize: 24, fontWeight: '700' }}
            color="#FFFFFF"
          />
          <Text variant="titleMedium" style={{ fontWeight: '800', marginTop: spacing.md }}>
            {student.fullName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {student.email}
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <StatusChip status={student.status} />
          </View>
        </Card>

        <SectionHeader title="Personal Information" />
        <Card style={styles.card}>
          <InfoRow label="Date of Birth" value={formatDate(student.dob)} icon="cake-variant-outline" />
          <InfoRow label="Gender" value={student.gender} icon="gender-male-female" />
          <InfoRow label="Blood Group" value={student.bloodGroup} icon="water-outline" />
        </Card>

        <SectionHeader title="Contact Information" />
        <Card style={styles.card}>
          <InfoRow label="Phone" value={student.phone} icon="phone-outline" />
          <InfoRow label="Alternate" value={student.altPhone} icon="phone-plus-outline" />
          <InfoRow label="Address" value={student.address} icon="map-marker-outline" />
          <InfoRow label="City / State" value={`${student.city}, ${student.state}`} icon="city-variant-outline" />
          <InfoRow label="Pincode" value={student.pincode} icon="mailbox-outline" />
          <InfoRow label="Guardian" value={student.guardianName} icon="account-child-outline" />
          <InfoRow label="Guardian Phone" value={student.guardianPhone} icon="phone-outline" />
        </Card>

        <SectionHeader title="Education" />
        <Card style={styles.card}>
          <InfoRow label="Qualification" value={student.education.qualification} icon="certificate-outline" />
          <InfoRow label="Institution" value={student.education.institution} icon="office-building-outline" />
          <InfoRow label="Board" value={student.education.board} icon="bank-outline" />
          <InfoRow label="Year" value={student.education.yearOfPassing} icon="calendar-outline" />
          <InfoRow label="Percentage" value={`${student.education.percentage}%`} icon="percent-outline" />
        </Card>

        <SectionHeader title="Enrolment" />
        <Card style={styles.card}>
          <InfoRow label="Course" value={course?.title} icon="bookshelf" />
          <InfoRow label="Batch" value={batch?.code ?? 'Not allocated'} icon="account-group-outline" />
          <InfoRow label="Applied On" value={formatDate(student.appliedOn)} icon="file-send-outline" />
          <InfoRow label="Reviewed On" value={student.reviewedOn ? formatDate(student.reviewedOn) : 'Pending'} icon="clipboard-check-outline" />
        </Card>

        <SectionHeader title="Documents" subtitle={`${student.documents.length} uploaded`} />
        <Card style={styles.card}>
          {student.documents.length === 0 && (
            <EmptyState icon="file-outline" title="No documents uploaded" />
          )}
          {student.documents.map((doc, index) => (
            <View
              key={doc.id}
              style={[
                styles.doc,
                index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
              ]}
            >
              <View style={[styles.docIcon, { backgroundColor: colors.neutralContainer }]}>
                <Icon
                  source={doc.type === 'PHOTO' ? 'image-outline' : 'file-document-outline'}
                  size={18}
                  color={colors.muted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.muted }}>
                  {doc.type.replace('_', ' ')} · {doc.size} · {formatDate(doc.uploadedOn)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Button
          mode="contained-tonal"
          icon="logout"
          onPress={signOut}
          style={styles.logout}
          contentStyle={{ height: 46 }}
        >
          Sign Out
        </Button>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  doc: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: { marginTop: spacing.md, borderRadius: radius.md },
});
