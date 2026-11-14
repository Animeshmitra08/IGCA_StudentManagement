import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, TextInput } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BatchRow } from '@/src/components/BatchRow';
import { Bento, BentoRow, FactTile, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { DocumentsGroup } from '@/src/components/DocumentsGroup';
import { ActionBar, Screen } from '@/src/components/Screen';
import { StatusChip } from '@/src/components/StatusChip';
import { StatusTimeline } from '@/src/components/StatusTimeline';
import {
  Avatar,
  EmptyState,
  Group,
  GroupBody,
  InfoRow,
  SectionHeader,
  Separator,
  Txt,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { haptic } from '@/src/utils/feedback';
import { formatDate } from '@/src/utils/format';

export default function AdminStudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
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
  const gate = useDataGate('detail');

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [pickedBatch, setPickedBatch] = useState<string | null>(null);

  if (gate) return gate;

  const student = studentById(id);

  if (!student) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="account-question-outline"
          title="Student not found"
          body="This registration may have been removed."
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
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
      haptic.success();
      setToast(message);
    } catch (e) {
      haptic.failure();
      setToast(e instanceof Error ? e.message : 'That did not work. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onApprove = () =>
    run(() => approve(student.id, user?.name ?? 'Admin'), `${student.fullName} approved`);

  const onReject = () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    setRejectOpen(false);
    void run(
      () => reject(student.id, reason.trim(), user?.name ?? 'Admin'),
      `${student.fullName} rejected`,
    );
    setReason('');
  };

  const openAllocate = () => {
    setPickedBatch(student.batchId);
    setAllocateOpen(true);
  };

  const onAllocate = () => {
    if (!pickedBatch) return;
    setAllocateOpen(false);
    void run(() => allocateBatch(student.id, pickedBatch), 'Batch allocated');
  };

  const onActivate = () => run(() => activate(student.id), 'Enrolment is now active');

  /* --------------------------------------------------- action bar setup */

  const secondary = (label: string, onPress: () => void, destructive?: boolean) => (
    <Button
      key={label}
      mode="outlined"
      textColor={destructive ? colors.error : undefined}
      style={styles.action}
      contentStyle={styles.actionContent}
      disabled={busy}
      onPress={onPress}
    >
      {label}
    </Button>
  );

  const primary = (label: string, onPress: () => void) => (
    <Button
      key={label}
      mode="contained"
      style={styles.action}
      contentStyle={styles.actionContent}
      loading={busy}
      disabled={busy}
      onPress={onPress}
    >
      {label}
    </Button>
  );

  const actions: React.ReactNode[] = (() => {
    switch (student.status) {
      case 'PENDING_APPROVAL':
        return [secondary('Reject', () => setRejectOpen(true), true), primary('Approve', onApprove)];
      case 'APPROVED':
        return [secondary('Reject', () => setRejectOpen(true), true), primary('Allocate batch', openAllocate)];
      case 'ALLOCATED':
        return [secondary('Change batch', openAllocate), primary('Mark active', onActivate)];
      case 'ACTIVE':
        return [secondary('Change batch', openAllocate)];
      case 'REJECTED':
        return [primary('Reopen and approve', onApprove)];
    }
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <Stack.Screen options={{ title: student.registrationNo }} />

      <View style={styles.root}>
        <Screen noBottomInset>
          <Bento>
            <Tile style={styles.identity}>
              <Avatar name={student.fullName} size={56} />
              <View style={styles.identityBody}>
                <Txt v="title" accessibilityRole="header">
                  {student.fullName}
                </Txt>
                {!!course && (
                  <Txt muted numberOfLines={1}>
                    {course.title}
                  </Txt>
                )}
                <View style={styles.chip}>
                  <StatusChip status={student.status} />
                </View>
              </View>
            </Tile>
            <BentoRow>
              <FactTile
                span={3}
                icon="calendar-start"
                label="Applied on"
                value={formatDate(student.appliedOn)}
              />
              <FactTile
                span={2}
                tone={student.reviewedOn ? 'card' : 'warning'}
                icon="calendar-check-outline"
                label="Reviewed on"
                value={student.reviewedOn ? formatDate(student.reviewedOn) : 'Waiting'}
              />
            </BentoRow>
            {!!student.reviewedBy && (
              <FactTile icon="account-check-outline" label="Reviewed by" value={student.reviewedBy} />
            )}
          </Bento>

          <SectionHeader title="Progress" />
          {student.status === 'REJECTED' ? (
            <StatusTimeline student={student} />
          ) : (
            <Group>
              <GroupBody>
                <StatusTimeline student={student} batchCode={batch?.code} />
              </GroupBody>
            </Group>
          )}

          {!!batch && (
            <>
              <SectionHeader title="Batch" />
              <Group>
                <BatchRow
                  batch={batch}
                  seatsTaken={seatsTaken(batch.id)}
                  onPress={() => router.push({ pathname: '/(admin)/batch/[id]', params: { id: batch.id } })}
                  pushes
                />
              </Group>
            </>
          )}

          <SectionHeader title="Personal" />
          <Group>
            <InfoRow label="Date of birth" value={formatDate(student.dob)} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Blood group" value={student.bloodGroup} />
          </Group>

          <SectionHeader title="Contact" />
          <Group>
            <InfoRow label="Email" value={student.email} />
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
        </Screen>

        <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3000}>
          {toast}
        </Snackbar>
      </View>

      <ActionBar>{actions}</ActionBar>

      {/* Reject reason */}
      <Portal>
        <Dialog
          visible={rejectOpen}
          onDismiss={() => setRejectOpen(false)}
          style={{ borderRadius: radius.lg }}
        >
          <Dialog.Title>Reject registration?</Dialog.Title>
          <Dialog.Content style={{ gap: spacing.md }}>
            <Txt muted>{student.fullName} sees this reason on their status screen.</Txt>
            <TextInput
              mode="outlined"
              label="Reason"
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                setReasonError(false);
              }}
              error={reasonError}
              multiline
              numberOfLines={3}
              autoFocus
              outlineStyle={{ borderRadius: radius.sm }}
            />
            {reasonError && (
              <Txt v="caption" color={colors.error}>
                Enter a reason before rejecting.
              </Txt>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectOpen(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={onReject}>
              Reject
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Batch allocation: a modal screen, not a dialog, so the list has room. */}
      <Modal
        visible={allocateOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAllocateOpen(false)}
      >
        <View
          style={[
            styles.root,
            { backgroundColor: colors.screen, paddingTop: Platform.OS === 'ios' ? 0 : insets.top },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Button onPress={() => setAllocateOpen(false)} style={styles.sheetButton}>
              Cancel
            </Button>
            <Txt v="heading" style={styles.sheetTitle} accessibilityRole="header" chrome>
              Allocate batch
            </Txt>
            <Button onPress={onAllocate} disabled={!pickedBatch} style={styles.sheetButton}>
              Allocate
            </Button>
          </View>
          <Separator />

          <ScrollView contentContainerStyle={[styles.sheetBody, { paddingBottom: insets.bottom + spacing.xl }]}>
            <Txt muted style={styles.sheetIntro}>
              {course ? `Batches for ${course.title}` : 'Batches for this course'}
            </Txt>
            {candidateBatches.length === 0 ? (
              <Group>
                <EmptyState
                  fill={false}
                  icon="calendar-blank-outline"
                  title="No batches for this course"
                  body="Create a batch for this course first."
                />
              </Group>
            ) : (
              <Group separatorInset={spacing.lg + 22 + spacing.md}>
                {candidateBatches.map((item) => (
                  <BatchRow
                    key={item.id}
                    batch={item}
                    seatsTaken={seatsTaken(item.id)}
                    selected={pickedBatch === item.id}
                    onPress={() => setPickedBatch(item.id)}
                  />
                ))}
              </Group>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  identity: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  identityBody: { flex: 1, gap: spacing.xs },
  chip: { marginTop: spacing.xs },
  action: { flex: 1 },
  actionContent: { height: 48 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.xs,
  },
  sheetButton: { minWidth: 88 },
  sheetTitle: { flex: 1, textAlign: 'center' },
  sheetBody: { padding: spacing.lg },
  sheetIntro: { marginBottom: spacing.md, paddingHorizontal: spacing.xs },
});
