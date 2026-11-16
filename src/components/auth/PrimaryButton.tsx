import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { usePressScale } from '@/src/components/motion';
import { Txt } from '@/src/components/ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/**
 * Full-width primary action: accent fill, label, and a trailing glyph that turns into
 * a spinner while `loading`. Shrinks slightly under the finger.
 */
export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-right',
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  const press = usePressScale();
  return (
    <Animated.View style={[styles.shell, { backgroundColor: colors.primary }, press.style]}>
      <Pressable
        onPress={onPress}
        {...press.handlers}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!loading, busy: !!loading }}
        android_ripple={{ color: colors.pressed }}
        style={({ pressed }) => [styles.button, pressed && Platform.OS !== 'android' && styles.pressed]}
      >
        <Txt v="heading" color={colors.onPrimary} chrome>
          {label}
        </Txt>
        {loading ? (
          <ActivityIndicator size={20} color={colors.onPrimary} />
        ) : (
          <Icon source={icon} size={20} color={colors.onPrimary} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: radius.lg, overflow: 'hidden' },
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.85 },
});
