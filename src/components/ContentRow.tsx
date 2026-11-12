import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { CONTENT_META, radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatDate } from '@/src/utils/format';
import type { ContentItem } from '@/src/types';

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

  const tint =
    item.type === 'VIDEO'
      ? colors.primary
      : item.type === 'ASSIGNMENT'
        ? colors.warning
        : item.type === 'IMAGE'
          ? colors.secondary
          : colors.info;

  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, opacity: locked ? 0.55 : pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: tint + '1A' }]}>
        <Icon source={locked ? 'lock-outline' : meta.icon} size={18} color={locked ? colors.muted : tint} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMedium" style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 11.5 }} numberOfLines={1}>
          {meta.label}
          {item.duration ? ` · ${item.duration}` : ''}
          {` · ${item.fileSize}`}
          {item.dueDate ? ` · due ${formatDate(item.dueDate)}` : ''}
        </Text>
      </View>

      {onToggleComplete && !locked ? (
        <Pressable onPress={onToggleComplete} hitSlop={10}>
          <Icon
            source={completed ? 'check-circle' : 'circle-outline'}
            size={22}
            color={completed ? colors.success : colors.outline}
          />
        </Pressable>
      ) : (
        <Icon source="chevron-right" size={20} color={colors.muted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '600' },
});
