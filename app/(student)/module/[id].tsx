import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Snackbar } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Bento, RingHero } from '@/src/components/Bento';
import { ContentRow } from '@/src/components/ContentRow';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import {
  EmptyState,
  Group,
  InfoRow,
  Notice,
  SectionHeader,
  Txt,
} from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { CONTENT_META, radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, percent } from '@/src/utils/format';
import type { ContentItem } from '@/src/types';

export default function ModuleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { modules, contentOf, toggleComplete } = useData();
  const { student, hasCourseAccess } = useCurrentStudent();
  const gate = useDataGate('detail');

  const [preview, setPreview] = useState<ContentItem | null>(null);
  const [toast, setToast] = useState('');

  if (gate) return gate;

  const module = modules.find((m) => m.id === id);

  if (!module || !student) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="folder-alert-outline"
          title="Module not found"
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const items = contentOf(module.id);
  const doneCount = items.filter((i) => student.completedContentIds.includes(i.id)).length;
  const pct = percent(doneCount, items.length);

  const toggle = async (item: ContentItem) => {
    try {
      await toggleComplete(student.id, item.id);
    } catch {
      setToast('Could not save your progress. Try again.');
    }
  };

  const open = (item: ContentItem) => {
    setPreview(null);
    router.push({ pathname: '/(student)/content/[id]', params: { id: item.id } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <Stack.Screen options={{ title: `Module ${module.order}` }} />

      <Screen>
        <Bento>
          <RingHero
            value={pct / 100}
            title={module.title}
            body={module.description}
            caption={`${doneCount} of ${items.length} done`}
            accessibilityLabel="Module progress"
          />
        </Bento>

        {!hasCourseAccess && (
          <Notice
            icon="lock-outline"
            title="Content is locked"
            message="Items unlock once your batch is allocated."
            style={styles.notice}
          />
        )}

        <SectionHeader title={`Content (${items.length})`} />
        {items.length === 0 ? (
          <Group>
            <EmptyState fill={false} icon="folder-open-outline" title="Nothing published yet" />
          </Group>
        ) : (
          <Group separatorInset={spacing.lg + 22 + spacing.md}>
            {items.map((item) => (
              <ContentRow
                key={item.id}
                item={item}
                completed={student.completedContentIds.includes(item.id)}
                locked={!hasCourseAccess}
                onPress={() => setPreview(item)}
                onToggleComplete={() => toggle(item)}
              />
            ))}
          </Group>
        )}
      </Screen>

      <Portal>
        <Modal
          visible={!!preview}
          onDismiss={() => setPreview(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.card }]}
        >
          {!!preview && (
            <View style={styles.modalBody}>
              <View style={styles.modalHead}>
                <Txt v="label" muted>
                  {CONTENT_META[preview.type].label}
                </Txt>
                <Txt v="heading" accessibilityRole="header">
                  {preview.title}
                </Txt>
                {!!preview.description && <Txt muted>{preview.description}</Txt>}
              </View>

              <Group>
                <InfoRow label="File" value={preview.fileName} />
                <InfoRow label="Size" value={preview.fileSize} />
                {!!preview.duration && <InfoRow label="Duration" value={preview.duration} />}
                {!!preview.dueDate && <InfoRow label="Due" value={formatDate(preview.dueDate)} />}
                <InfoRow label="Uploaded by" value={preview.uploadedBy} />
              </Group>

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setPreview(null)} style={styles.modalBtn} contentStyle={styles.btnContent}>
                  Close
                </Button>
                <Button mode="contained" onPress={() => open(preview)} style={styles.modalBtn} contentStyle={styles.btnContent}>
                  {preview.type === 'VIDEO' ? 'Play' : 'Open'}
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3000}>
        {toast}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notice: { marginTop: spacing.lg },
  modal: { margin: spacing.lg, padding: spacing.xl, borderRadius: radius.lg },
  modalBody: { gap: spacing.lg },
  modalHead: { gap: spacing.xs },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalBtn: { flex: 1 },
  btnContent: { height: 48 },
});
