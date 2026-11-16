import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Icon, Snackbar } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Bento, Tile } from '@/src/components/Bento';
import { useDataGate } from '@/src/components/DataGate';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, InfoRow, Lead, Notice, SectionHeader, Txt } from '@/src/components/ui';
import { YouTubePlayer } from '@/src/components/YouTubePlayer';
import { useData } from '@/src/context/DataContext';
import { useCurrentStudent } from '@/src/hooks/useCurrentStudent';
import { CONTENT_META, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import { openDocument, type OpenResult, type OpenStage } from '@/src/utils/openDocument';
import { youtubeId } from '@/src/utils/youtube';
import type { ContentItem } from '@/src/types';

/**
 * One content item, opened from its module. A video plays here in an embedded YouTube
 * player; a document (assignment, notes, image) is downloaded and shown with the
 * device's file preview.
 */
export default function ContentViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { content, toggleComplete } = useData();
  const { student, hasCourseAccess } = useCurrentStudent();
  const gate = useDataGate('detail');
  const [toast, setToast] = useState('');

  if (gate) return gate;

  const item = content.find((c) => c.id === id);

  if (!item || !student) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screen }]}>
        <EmptyState
          icon="file-alert-outline"
          title="Content not found"
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </View>
    );
  }

  const meta = CONTENT_META[item.type];
  const completed = student.completedContentIds.includes(item.id);
  const overline = [meta.label, item.duration].filter(Boolean).join(' · ');

  const toggle = async () => {
    try {
      await toggleComplete(student.id, item.id);
    } catch {
      setToast('Could not save your progress. Try again.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.screen }]}>
      <Stack.Screen options={{ title: meta.label }} />

      <Screen>
        {!hasCourseAccess ? (
          <Notice
            icon="lock-outline"
            title="Content is locked"
            message="Items unlock once your batch is allocated."
          />
        ) : item.type === 'VIDEO' ? (
          <VideoBlock item={item} />
        ) : (
          <DocumentBlock item={item} />
        )}

        <Lead overline={overline} title={item.title} body={item.description} />

        <SectionHeader title="Details" />
        <Group>
          {item.type !== 'VIDEO' && <InfoRow label="File" value={item.fileName} />}
          {item.type !== 'VIDEO' && <InfoRow label="Size" value={item.fileSize} />}
          {!!item.duration && <InfoRow label="Duration" value={item.duration} />}
          {!!item.dueDate && <InfoRow label="Due" value={formatDate(item.dueDate)} />}
          <InfoRow label="Uploaded by" value={item.uploadedBy} />
          <InfoRow label="Uploaded on" value={formatDate(item.uploadedOn)} />
        </Group>

        {hasCourseAccess && (
          <Button
            mode={completed ? 'outlined' : 'contained'}
            icon={completed ? 'check-circle' : 'circle-outline'}
            onPress={toggle}
            style={styles.complete}
            contentStyle={styles.btnContent}
            accessibilityState={{ checked: completed }}
          >
            {completed ? 'Completed' : 'Mark as completed'}
          </Button>
        )}
      </Screen>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={3000}>
        {toast}
      </Snackbar>
    </View>
  );
}

/* ------------------------------------------------------------------ video */

function VideoBlock({ item }: { item: ContentItem }) {
  const videoId = youtubeId(item.url);
  if (!videoId) {
    return (
      <Notice
        icon="play-circle-outline"
        title="This video cannot play in the app"
        message="It is not a YouTube link."
        action={{ label: 'Open', onPress: () => Linking.openURL(item.url).catch(() => {}) }}
      />
    );
  }
  return <YouTubePlayer videoId={videoId} title={item.title} />;
}

/* --------------------------------------------------------------- document */

type DocState = 'idle' | OpenStage | OpenResult | 'error';

const DOC_STATUS: Record<DocState, string> = {
  idle: 'Opens in your device’s file viewer.',
  downloading: 'Downloading the file…',
  opening: 'Opening the file…',
  previewed: 'Shown in your device’s file viewer.',
  external: 'Opened outside the app.',
  error: 'This file is not available yet.',
};

/** Downloads the file and shows it with the device's preview, once on arrival and again on demand. */
function DocumentBlock({ item }: { item: ContentItem }) {
  const { colors } = useAppTheme();
  const [state, setState] = useState<DocState>('idle');
  const busy = state === 'downloading' || state === 'opening';

  const open = useCallback(async () => {
    setState('opening');
    try {
      setState(await openDocument(item, setState));
    } catch {
      setState('error');
    }
  }, [item]);

  // Open straight away when the screen is pushed; the ref keeps it to one attempt.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    void open();
  }, [open]);

  return (
    <Bento>
      <Tile style={styles.doc}>
        <View style={styles.docHead}>
          <Icon source={CONTENT_META[item.type].icon} size={28} color={colors.primary} />
          <View style={styles.docBody}>
            <Txt v="bodyStrong" numberOfLines={1}>
              {item.fileName}
            </Txt>
            <Txt
              v="caption"
              muted={state !== 'error'}
              color={state === 'error' ? colors.error : undefined}
              accessibilityLiveRegion="polite"
            >
              {DOC_STATUS[state]}
            </Txt>
          </View>
        </View>
        <Button
          mode="contained"
          icon="file-eye-outline"
          onPress={open}
          loading={busy}
          disabled={busy}
          contentStyle={styles.btnContent}
        >
          {state === 'error' ? 'Try again' : state === 'idle' || busy ? 'Open file' : 'Open again'}
        </Button>
      </Tile>
    </Bento>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  doc: { gap: spacing.lg },
  docHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  docBody: { flex: 1, gap: 2 },
  complete: { marginTop: spacing.xl },
  btnContent: { height: 48 },
});
