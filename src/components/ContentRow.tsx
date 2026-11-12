import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Touchable, Txt } from './ui';
import { CONTENT_META, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import type { ContentItem } from '@/src/types';

/**
 * One content item. Opening it shows a preview (not a push), so there is no chevron;
 * the trailing control is the completion checkbox when the viewer can track progress.
 */
export function ContentRow({
  item,
  completed,
  locked,
  onPress,
  onToggleComplete,
}: {
  item: ContentItem;
  completed?: boolean;
  locked?: boolean;
  onPress?: () => void;
  onToggleComplete?: () => void;
}) {
  const { colors } = useAppTheme();
  const meta = CONTENT_META[item.type];

  const details = [
    meta.label,
    item.duration,
    item.fileSize,
    item.dueDate ? `Due ${formatDate(item.dueDate)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const body = (
    <>
      <Icon source={locked ? 'lock-outline' : meta.icon} size={22} color={colors.muted} />
      <View style={styles.body}>
        <Txt v="bodyStrong" muted={locked} numberOfLines={1}>
          {item.title}
        </Txt>
        <Txt v="caption" muted numberOfLines={1}>
          {details}
        </Txt>
      </View>

      {!!onToggleComplete && !locked && (
        <Pressable
          onPress={onToggleComplete}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!completed }}
          accessibilityLabel={`Mark ${item.title} as completed`}
          android_ripple={{ color: colors.pressed, borderless: true, radius: 20 }}
          style={styles.check}
        >
          <Icon
            source={completed ? 'check-circle' : 'circle-outline'}
            size={24}
            color={completed ? colors.success : colors.outline}
          />
        </Pressable>
      )}
    </>
  );

  if (!onPress || locked) {
    return (
      <View style={styles.row} accessibilityLabel={locked ? `${item.title}, locked` : undefined}>
        {body}
      </View>
    );
  }
  return (
    <Touchable onPress={onPress} style={styles.row} accessibilityLabel={`${item.title}, ${meta.label}`}>
      {body}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  body: { flex: 1, gap: 2 },
  check: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -spacing.sm },
});
