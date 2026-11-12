import React from 'react';
import { Avatar, Row, Txt } from './ui';
import { StatusChip } from './StatusChip';
import { formatShortDate } from '@/src/utils/format';
import type { Student } from '@/src/types';

/**
 * One student in a list. The status chip is shown only where the list mixes statuses
 * (`showStatus`); in a list already filtered to one status it would repeat on every row.
 */
export function StudentRow({
  student,
  courseTitle,
  batchCode,
  showStatus,
  onPress,
}: {
  student: Student;
  courseTitle?: string;
  batchCode?: string | null;
  showStatus?: boolean;
  onPress?: () => void;
}) {
  const subtitle = [student.registrationNo, courseTitle, batchCode]
    .filter(Boolean)
    .join(' · ');

  return (
    <Row
      leading={<Avatar name={student.fullName} />}
      title={student.fullName}
      subtitle={subtitle}
      trailing={
        showStatus ? (
          <StatusChip status={student.status} />
        ) : (
          <Txt v="caption" muted>
            {formatShortDate(student.appliedOn)}
          </Txt>
        )
      }
      onPress={onPress}
      pushes={!!onPress}
    />
  );
}
