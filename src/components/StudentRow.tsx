import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text } from 'react-native-paper';
import { Card } from './ui';
import { StatusChip } from './StatusChip';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, initials } from '@/src/utils/format';
import type { Student } from '@/src/types';

export function StudentRow({
  student,
  courseTitle,
  batchCode,
  onPress,
}: {
  student: Student;
  courseTitle?: string;
  batchCode?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Avatar.Text
          size={44}
          label={initials(student.fullName)}
          style={{ backgroundColor: student.avatarColor }}
          labelStyle={{ fontSize: 15, fontWeight: '700' }}
          color="#FFFFFF"
        />

        <View style={styles.body}>
          <Text variant="titleSmall" style={styles.name} numberOfLines={1}>
            {student.fullName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={1}>
            {student.registrationNo} · {courseTitle ?? student.courseId}
          </Text>

          <View style={styles.metaRow}>
            <StatusChip status={student.status} size="sm" />
            {!!batchCode && (
              <View style={styles.meta}>
                <Icon source="account-group-outline" size={12} color={colors.muted} />
                <Text style={{ color: colors.muted, fontSize: 11 }}>{batchCode}</Text>
              </View>
            )}
            {!batchCode && student.status === 'PENDING_APPROVAL' && (
              <View style={styles.meta}>
                <Icon source="calendar-outline" size={12} color={colors.muted} />
                <Text style={{ color: colors.muted, fontSize: 11 }}>
                  {formatDate(student.appliedOn)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Icon source="chevron-right" size={20} color={colors.muted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: 2 },
  name: { fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
