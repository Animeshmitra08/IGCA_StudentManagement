import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { Card } from './ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { Course } from '@/src/types';

export function CourseCard({
  course,
  moduleCount,
  contentCount,
  selected,
  onPress,
  footer,
}: {
  course: Course;
  moduleCount?: number;
  contentCount?: number;
  selected?: boolean;
  onPress?: () => void;
  footer?: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <Card
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.card,
        selected && { borderColor: course.color, borderWidth: 2, backgroundColor: course.color + '0D' },
      ])}
    >
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: course.color + '1F' }]}>
          <Icon source={course.icon} size={22} color={course.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={styles.title}>
            {course.title}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={2}>
            {course.tagline}
          </Text>
        </View>

        {selected !== undefined && (
          <Icon
            source={selected ? 'check-circle' : 'circle-outline'}
            size={20}
            color={selected ? course.color : colors.outline}
          />
        )}
      </View>

      <View style={styles.metaRow}>
        <Meta icon="calendar-range" label={`${course.durationWeeks} weeks`} />
        <Meta icon="signal-cellular-2" label={course.level} />
        {moduleCount !== undefined && <Meta icon="folder-outline" label={`${moduleCount} modules`} />}
        {contentCount !== undefined && <Meta icon="play-box-outline" label={`${contentCount} items`} />}
      </View>

      {footer}
    </Card>
  );
}

function Meta({ icon, label }: { icon: string; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.meta}>
      <Icon source={icon} size={13} color={colors.muted} />
      <Text style={{ color: colors.muted, fontSize: 11.5 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  head: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', marginBottom: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
