import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Notice, Txt } from './ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import type { Student, StudentStatus } from '@/src/types';

const FLOW: { status: StudentStatus; title: string }[] = [
  { status: 'PENDING_APPROVAL', title: 'Registration submitted' },
  { status: 'APPROVED', title: 'Approved by admin' },
  { status: 'ALLOCATED', title: 'Batch allocated' },
  { status: 'ACTIVE', title: 'Enrolment active' },
];

const ORDER: Record<StudentStatus, number> = {
  PENDING_APPROVAL: 0,
  APPROVED: 1,
  ALLOCATED: 2,
  ACTIVE: 3,
  REJECTED: -1,
};

const DOT = 20;

/** Vertical progress of the approval lifecycle for one student. */
export function StatusTimeline({ student, batchCode }: { student: Student; batchCode?: string | null }) {
  const { colors } = useAppTheme();
  const current = ORDER[student.status];

  if (student.status === 'REJECTED') {
    return (
      <Notice
        tone="error"
        icon="close-circle-outline"
        title="Registration rejected"
        message={`${student.rejectionReason ?? 'Contact the administration office for details.'}\nReviewed on ${formatDate(student.reviewedOn)}`}
      />
    );
  }

  const captionFor = (status: StudentStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return formatDate(student.appliedOn);
      case 'APPROVED':
        return student.reviewedOn ? formatDate(student.reviewedOn) : 'Waiting for review';
      case 'ALLOCATED':
        return batchCode ?? (student.allocatedOn ? formatDate(student.allocatedOn) : 'Not allocated yet');
      case 'ACTIVE':
        return student.status === 'ACTIVE' ? 'Course access unlocked' : 'Starts with your batch';
      default:
        return '';
    }
  };

  return (
    <View accessibilityRole="list">
      {FLOW.map((step, index) => {
        const done = index < current;
        const isCurrent = index === current;
        const reached = done || isCurrent;
        const last = index === FLOW.length - 1;

        return (
          <View
            key={step.status}
            style={styles.step}
            accessible
            accessibilityLabel={`${step.title}, ${done ? 'done' : isCurrent ? 'current step' : 'not reached'}. ${captionFor(step.status)}`}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  reached
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.outlineVariant },
                ]}
              >
                {done && <Icon source="check" size={12} color={colors.onPrimary} />}
                {isCurrent && <View style={[styles.core, { backgroundColor: colors.onPrimary }]} />}
              </View>
              {!last && (
                <View style={[styles.line, { backgroundColor: done ? colors.primary : colors.border }]} />
              )}
            </View>

            <View style={[styles.stepBody, last && { paddingBottom: 0 }]}>
              <Txt v={isCurrent ? 'bodyStrong' : 'body'} muted={!reached}>
                {step.title}
              </Txt>
              <Txt v="caption" muted>
                {captionFor(step.status)}
              </Txt>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: DOT },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  core: { width: 6, height: 6, borderRadius: radius.pill },
  line: { width: 2, flex: 1, minHeight: spacing.lg },
  stepBody: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
});
