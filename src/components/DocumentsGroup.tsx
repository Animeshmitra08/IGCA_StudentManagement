import React from 'react';
import { Icon } from 'react-native-paper';
import { EmptyState, Group, Row } from './ui';
import { DOCUMENT_META } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import type { StudentDocument } from '@/src/types';

/** A student's uploaded documents, read-only. */
export function DocumentsGroup({ documents }: { documents: StudentDocument[] }) {
  const { colors } = useAppTheme();

  if (documents.length === 0) {
    return (
      <Group>
        <EmptyState fill={false} icon="file-outline" title="No documents uploaded" />
      </Group>
    );
  }

  return (
    <Group separatorInset={56}>
      {documents.map((doc) => {
        const meta = DOCUMENT_META[doc.type];
        return (
          <Row
            key={doc.id}
            leading={<Icon source={meta.icon} size={24} color={colors.muted} />}
            title={doc.name}
            subtitle={`${meta.label} · ${doc.size} · ${formatDate(doc.uploadedOn)}`}
          />
        );
      })}
    </Group>
  );
}
