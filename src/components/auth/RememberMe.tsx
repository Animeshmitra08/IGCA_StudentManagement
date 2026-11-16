import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Txt } from '@/src/components/ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/** "Remember me" checkbox with its label; the whole row is the 44pt target. */
export function RememberMe({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Remember me"
      hitSlop={{ top: 6, bottom: 6 }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.card,
            borderColor: checked ? colors.primary : colors.outline,
          },
        ]}
      >
        {checked && <Icon source="check-bold" size={14} color={colors.onPrimary} />}
      </View>
      <Txt v="label" color={colors.onSurfaceVariant} chrome>
        Remember me
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  pressed: { opacity: 0.6 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
