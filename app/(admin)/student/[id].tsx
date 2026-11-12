import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  Icon,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/src/components/AppHeader';
import { BatchCard } from '@/src/components/BatchCard';
import { Screen } from '@/src/components/Screen';
import { StatusChip } from '@/src/components/StatusChip';
import { StatusTimeline } from '@/src/components/StatusTimeline';
import { Card, EmptyState, InfoRow, SectionHeader } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, initials } from '@/src/utils/format';

export default function AdminStudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    studentById,
    courseById,
    batchById,
    batchesOf,
    seatsTaken,
    approve,
    reject,
    allocateBatch,
    activate,
  } = useData();

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [pickedBatch, setPickedBatch] = useState<string | null>(null);

  const student = studentById(id);

  if (!student) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Student" back />
        <EmptyState icon="account-question-outline" title="Student not found" />
      </View>
    );
  }

  const course = courseById(student.courseId);
  const batch = batchById(student.batchId);
  const candidateBatches = batchesOf(student.courseId);

  const run = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    try {
      await action();
      setToast(message);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const onApprove = () =>
    run(() => approve(student.id, user?.name ?? 'Admin'), `${student.fullName} approved`);

  const onReject = () => {
    if (!reason.trim()) {
      setToast('Enter a rejection reason');
      return;
    }
    setRejectOpen(false);
    void run(
      () => reject(student.id, reason.trim(), user?.name ?? 'Admin'),
      `${student.fullName} rejected`,
    );
    setReason('');
  };

  const onAllocate = () => {
    if (!pickedBatch) {
      setToast('Select a batch first');
      return;
    }
    setAllocateOpen(false);
    void run(() => allocateBatch(student.id, pickedBatch), 'Batch allocated');
  };

  const onActivate = () => run(() => activate(student.id), 'Enrolment activated');

  /* --------------------------------------------------- action bar setup */

  const actions: React.ReactNode[] = [];

  if (student.status === 'PENDING_APPROVAL') {
    actions.push(
      <Button
        key="reject"
        mode="outlined"
        textColor={colors.error}
        style={[styles.action, { borderColor: colors.error }]}
        disabled={busy}
        onPress={() => setRejectOpen(true)}
      >
        Reject
      </Button>,
      <Button key="approve" mode="contained" style={styles.action} loading={busy} disabled={busy} onPress={onApprove}>
        Approve
      </Button>,
    );
  } else if (student.status === 'APPROVED') {
    actions.push(
      <Button
        key="reject"
        mode="outlined"
        textColor={colors.error}
        style={[styles.action, { borderColor: colors.error }]}
        disabled={busy}
        onPress={() => setRejectOpen(true)}
      >
        Reject
      </Button>,
      <Button
        key="allocate"
        mode="contained"
        icon="calendar-plus"
        style={styles.action}
        loading={busy}
        disabled={busy}
        onPress={() => {
          setPickedBatch(student.batchId);
          setAllocateOpen(true);
        }}
      >
        Allocate Batch
      </Button>,
    );
  } else if (student.status === 'ALLOCATED') {
    actions.push(
      <Button
        key="change"
        mode="outlined"
        style={styles.action}
        disabled={busy}
        onPress={() => {
          setPickedBatch(student.batchId);
          setAllocateOpen(true);
        }}
      >
        Change Batch
      </Button>,
      <Button key="activate" mode="contained" icon="check" style={styles.action} loading={busy} disabled={busy} onPress={onActivate}>
        Mark Active
      </Button>,
    );
  } else if (student.status === 'ACTIVE') {
    actions.push(
      <Button
        key="change"
        mode="outlined"
        style={styles.action}
        disabled={busy}
        onPress={() => {
          setPickedBatch(student.batchId);
          setAllocateOpen(true);
        }}
      >
        Change Batch
      </Button>,
    );
  } else if (student.status === 'REJECTED') {
    actions.push(
      <Button key="reopen" mode="contained" icon="restore" style={styles.action} loading={busy} disabled={busy} onPress={onApprove}>
        Re-open & Approve
      </Button>,
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Student Details" subtitle={student.registrationNo} back />

      <Screen>
        <Card style={styles.hero}>
          <Avatar.Text
            size={64}
            label={initials(student.fullName)}
            style={{ backgroundColor: student.avatarColor }}
            labelStyle={{ fontSize: 22, fontWeight: '700' }}
            color="#FFFFFF"
          />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="titleMedium" style={{ fontWeight: '800' }}>
              {student.fullName}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              {course?.title}
            </Text>
            <StatusChip status={student.status} />
          </View>
        </Card>

        <SectionHeader title="Approval Progress" />
        <Card style={styles.card}>
          <StatusTimeline student={student} batchCode={batch?.code} />
        </Card>

        <SectionHeader title="Personal Information" />
        <Card style={styles.card}>
          <InfoRow label="Date of Birth" value={formatDate(student.dob)} icon="cake-variant-outline" />
          <InfoRow label="Gender" value={student.gender} icon="gender-male-female" />
          <InfoRow label="Blood Group" value={student.bloodGroup} icon="water-outline" />
        </Card>

        <SectionHeader title="Contact Information" />
        <Card style={styles.card}>
          <InfoRow label="Email" value={student.email} icon="email-outline" />
          <InfoRow label="Phone" value={student.phone} icon="phone-outline" />
          <InfoRow label="Address" value={student.address} icon="map-marker-outline" />
          <InfoRow label="City / State" value={`${student.city}, ${student.state}`} icon="city-variant-outline" />
          <InfoRow label="Pincode" value={student.pincode} icon="mailbox-outline" />
          <InfoRow label="Guardian" value={student.guardianName} icon="account-child-outline" />
          <InfoRow label="Guardian Phone" value={student.guardianPhone} icon="phone-outline" />
        </Card>

        <SectionHeader title="Education Information" />
        <Card style={styles.card}>
          <InfoRow label="Qualification" value={student.education.qualification} icon="certificate-outline" />
          <InfoRow label="Institution" value={student.education.institution} icon="office-building-outline" />
          <InfoRow label="Board" value={student.education.board} icon="bank-outline" />
          <InfoRow label="Year of Passing" value={student.education.yearOfPassing} icon="calendar-outline" />
          <InfoRow label="Percentage" value={`${student.education.percentage}%`} icon="percent-outline" />
        </Card>

        <SectionHeader title="Documents" subtitle={`${student.documents.length} uploaded`} />
        <Card style={styles.card}>
          {student.documents.length === 0 ? (
            <EmptyState icon="file-outline" title="No documents uploaded" />
          ) : (
            student.documents.map((doc, index) => (
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
                    {doc.type.replace('_', ' ')} · {doc.size}
                  </Text>
                </View>
                <Icon source="download-outline" size={18} color={colors.muted} />
              </View>
            ))
          )}
        </Card>

        {!!batch && (
          <>
            <SectionHeader title="Allocated Batch" />
            <BatchCard batch={batch} course={course} seatsTaken={seatsTaken(batch.id)} compact />
          </>
        )}

        {student.status === 'REJECTED' && !!student.rejectionReason && (
          <Card style={[styles.card, { backgroundColor: colors.errorContainer, borderWidth: 0 }]}>
            <Text variant="bodySmall" style={{ fontWeight: '700', color: colors.error }}>
              Rejection reason
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onErrorContainer, marginTop: 4 }}>
              {student.rejectionReason}
            </Text>
          </Card>
        )}
      </Screen>

      {actions.length > 0 && (
        <View
          style={[
            styles.actionBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          {actions}
        </View>
      )}

      {/* Reject reason */}
      <Portal>
        <Dialog visible={rejectOpen} onDismiss={() => setRejectOpen(false)}>
          <Dialog.Title>Reject registration</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ color: colors.muted, marginBottom: spacing.md }}>
              The reason is shown to {student.fullName} on their status screen.
            </Text>
            <TextInput
              mode="outlined"
              label="Reason"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectOpen(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={onReject}>
              Reject
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Batch allocation */}
        <Dialog
          visible={allocateOpen}
          onDismiss={() => setAllocateOpen(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Allocate batch</Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: spacing.md }}>
            <Text variant="bodySmall" style={{ color: colors.muted, marginBottom: spacing.md }}>
              Batches for {course?.title}
            </Text>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {candidateBatches.length === 0 ? (
                <EmptyState icon="calendar-remove-outline" title="No batches for this course" />
              ) : (
                candidateBatches.map((item) => (
                  <BatchCard
                    key={item.id}
                    batch={item}
                    seatsTaken={seatsTaken(item.id)}
                    selected={pickedBatch === item.id}
                    onPress={() => setPickedBatch(item.id)}
                    compact
                  />
                ))
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAllocateOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={onAllocate} disabled={!pickedBatch}>
              Allocate
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3000}>
        {toast}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center', marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  doc: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: { flex: 1, borderRadius: radius.md },
});
