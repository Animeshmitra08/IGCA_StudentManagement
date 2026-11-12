import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ContentRow } from './ContentRow';
import { Group, Txt } from './ui';
import { spacing } from '@/src/theme/theme';
import type { ContentItem, CourseModule } from '@/src/types';

/** Read-only module outline: a heading row followed by its content items. */
export function ModuleGroup({ module, items }: { module: CourseModule; items: ContentItem[] }) {
  return (
    <Group style={styles.group}>
      <View style={styles.head}>
        <Txt v="label" muted>
          Module {module.order} · {items.length} {items.length === 1 ? 'item' : 'items'}
        </Txt>
        <Txt v="heading">{module.title}</Txt>
        {!!module.description && (
          <Txt v="caption" muted numberOfLines={2}>
            {module.description}
          </Txt>
        )}
      </View>
      {items.map((item) => (
        <ContentRow key={item.id} item={item} />
      ))}
    </Group>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  head: { padding: spacing.lg, gap: 2 },
});
