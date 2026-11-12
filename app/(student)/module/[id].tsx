import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Divider, Icon, Portal, Modal, Snackbar, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

import { AppHeader } from '@/src/components/AppHeader';
import { ContentRow } from '@/src/components/ContentRow';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, InfoRow, Pill } from '@/src/components/ui';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { CONTENT_META, radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate, percent } from '@/src/utils/format';
import type { ContentItem } from '@/src/types';

export default function ModuleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { modules, contentOf, courseById, toggleComplete } = useData();
  const { student, hasCourseAccess } = useCurrentStudent();

  const [preview, setPreview] = useState<ContentItem | null>(null);
  const [toast, setToast] = useState('');

  const module = modules.find((m) => m.id === id);

  if (!module || !student) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <AppHeader title="Module" back />
        <EmptyState icon="folder-alert-outline" title="Module not found" />
      </View>
    );
  }

  const course = courseById(module.courseId);
  const items = contentOf(module.id);
  const doneCount = items.filter((i) => student.completedContentIds.includes(i.id)).length;
  const pct = percent(doneCount, items.length);

  const openContent = (item: ContentItem) => setPreview(item);

  const toggle = async (item: ContentItem) => {
    await toggleComplete(student.id, item.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title={`Module ${module.order}`} subtitle={course?.title} back />

      <Screen>
        <Card style={styles.intro}>
          <Text variant="titleMedium" style={{ fontWeight: '800' }}>
            {module.title}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            {module.description}
          </Text>
          <View style={styles.pills}>
            <Pill icon="play-box-outline" label={`${items.length} items`} />
            <Pill
              icon="check-circle-outline"
              label={`${doneCount} completed · ${pct}%`}
              color={colors.success}
              background={colors.successContainer}
            />
          </View>
        </Card>

        <Card style={styles.list}>
          <Text variant="titleSmall" style={{ fontWeight: '700', marginBottom: spacing.xs }}>
            Content
          </Text>

          {items.length === 0 && (
            <EmptyState icon="folder-open-outline" title="No content published yet" />
          )}

          {items.map((item) => (
            <ContentRow
              key={item.id}
              item={item}
              completed={student.completedContentIds.includes(item.id)}
              locked={!hasCourseAccess}
              onPress={() => openContent(item)}
              onToggleComplete={() => toggle(item)}
            />
          ))}
        </Card>
      </Screen>

      <Portal>
        <Modal
          visible={!!preview}
          onDismiss={() => setPreview(null)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {!!preview && (
            <View style={{ gap: spacing.md }}>
              <View style={styles.modalHead}>
                <View style={[styles.modalIcon, { backgroundColor: colors.primaryContainer }]}>
                  <Icon source={CONTENT_META[preview.type].icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                    {preview.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    {CONTENT_META[preview.type].label}
                  </Text>
                </View>
              </View>

              <Text variant="bodySmall" style={{ color: colors.muted }}>
                {preview.description}
              </Text>

              <Divider />

              <InfoRow label="File" value={preview.fileName} icon="file-outline" />
              <InfoRow label="Size" value={preview.fileSize} icon="database-outline" />
              {!!preview.duration && (
                <InfoRow label="Duration" value={preview.duration} icon="timer-outline" />
              )}
              {!!preview.dueDate && (
                <InfoRow label="Due" value={formatDate(preview.dueDate)} icon="calendar-alert" />
              )}
              <InfoRow label="Uploaded by" value={preview.uploadedBy} icon="account-outline" />

              <View style={[styles.notice, { backgroundColor: colors.neutralContainer }]}>
                <Icon source="cloud-off-outline" size={16} color={colors.muted} />
                <Text variant="bodySmall" style={{ color: colors.muted, flex: 1 }}>
                  Files are mocked - no storage backend is connected yet.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={() => setPreview(null)} style={{ flex: 1 }}>
                  Close
                </Button>
                <Button
                  mode="contained"
                  style={{ flex: 1 }}
                  onPress={() => {
                    Linking.openURL(preview.url).catch(() =>
                      setToast('Mock URL - nothing to open yet'),
                    );
                    setPreview(null);
                  }}
                >
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
  intro: { gap: spacing.sm, marginBottom: spacing.lg },
  pills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  list: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  modal: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.sm },
  modalActions: { flexDirection: 'row', gap: spacing.md },
});
