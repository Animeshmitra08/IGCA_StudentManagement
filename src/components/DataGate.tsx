import React from 'react';
import { View } from 'react-native';
import { EmptyState, Group, SkeletonDetail, SkeletonList } from './ui';
import { useData } from '@/src/context/DataContext';
import { spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/**
 * Loading and error states for a data screen. Returns the placeholder to render, or
 * null once data is ready:
 *
 *   const gate = useDataGate('list');
 *   if (gate) return gate;
 *
 * Call it before any "not found" check, so a screen never claims something is
 * missing while the data is still in flight.
 */
export function useDataGate(kind: 'list' | 'detail' = 'list'): React.ReactElement | null {
  const { colors } = useAppTheme();
  const { loading, refreshing, error, refresh } = useData();

  if (loading || (error && refreshing)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        {kind === 'list' ? (
          // Bones sit on the card surface, like the rows they stand in for.
          <View style={{ padding: spacing.lg }}>
            <Group>
              <SkeletonList />
            </Group>
          </View>
        ) : (
          <SkeletonDetail />
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screen }}>
        <EmptyState
          icon="cloud-alert-outline"
          title="Couldn't load your data"
          body={error}
          action={{ label: 'Try again', onPress: refresh }}
        />
      </View>
    );
  }

  return null;
}
