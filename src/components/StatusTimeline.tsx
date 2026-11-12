import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import type { Student, StudentStatus } from '@/src/types';

const FLOW: { status: StudentStatus; title: string; icon: string }[] = [
  { status: 'PENDING_APPROVAL', title: 'Registration submitted', icon: 'file-send-outline' },
  { status: 'APPROVED', title: 'Approved by admin', icon: 'check-decagram-outline' },
  { status: 'ALLOCATED', title: 'Batch allocated', icon: 'calendar-check-outline' },
  { status: 'ACTIVE', title: 'Enrolment active', icon: 'school-outline' },
];

const ORDER: Record<StudentStatus, number> = {
  PENDING_APPROVAL: 0,
  APPROVED: 1,
  ALLOCATED: 2,
  ACTIVE: 3,
  REJECTED: -1,
};

/** Vertical progress of the approval lifecycle for one student. */
export function StatusTimeline({ student, batchCode }: { student: Student; batchCode?: string | null }) {
  const { colors } = useAppTheme();
  const current = ORDER[student.status];
  const rejected = student.status === 'REJECTED';

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

  if (rejected) {
    return (
      <View style={[styles.rejected, { backgroundColor: colors.errorContainer }]}>
        <Icon source="close-circle-outline" size={22} color={colors.error} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="titleSmall" style={{ color: colors.error, fontWeight: '700' }}>
            Registration rejected
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onErrorContainer }}>
            {student.rejectionReason ?? 'Contact the administration office for details.'}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onErrorContainer, opacity: 0.7 }}>
            Reviewed on {formatDate(student.reviewedOn)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {FLOW.map((step, index) => {
        const done = index <= current;
        const isCurrent = index === current;
        const last = index === FLOW.length - 1;

        return (
          <View key={step.status} style={styles.step}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? colors.primary : colors.neutralContainer,
                    borderColor: isCurrent ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Icon
                  source={done ? (isCurrent ? step.icon : 'check') : step.icon}
                  size={14}
                  color={done ? colors.onPrimary : colors.muted}
                />
              </View>
              {!last && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < current ? colors.primary : colors.border },
                  ]}
                />
              )}
            </View>

            <View style={styles.stepBody}>
              <Text
                variant="bodyMedium"
                style={{ fontWeight: isCurrent ? '700' : '600', color: done ? colors.onSurface : colors.muted }}
              >
                {step.title}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {captionFor(step.status)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 30 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  line: { width: 2, flex: 1, minHeight: 22, marginVertical: 2 },
  stepBody: { flex: 1, paddingBottom: spacing.lg, gap: 1 },
  rejected: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
});
