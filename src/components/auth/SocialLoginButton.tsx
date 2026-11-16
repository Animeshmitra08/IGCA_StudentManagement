import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { Touchable, Txt } from '@/src/components/ui';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

/** Outlined "continue with" button for one sign-in provider. */
export function SocialLoginButton({
  provider,
  icon,
  onPress,
}: {
  provider: string;
  icon: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={`Continue with ${provider}`}
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Icon source={icon} size={20} color={colors.onSurface} />
      <Txt v="bodyStrong" chrome>
        {provider}
      </Txt>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
