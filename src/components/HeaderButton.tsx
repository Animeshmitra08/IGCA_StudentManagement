import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAuth } from '@/src/context/AuthContext';
import { radius } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { confirmDestructive } from '@/src/utils/feedback';

/**
 * Icon button on the AppHeader: a 40pt translucent circle in the header ink, with a
 * 44pt touch target.
 */
export function HeaderButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={2}
      android_ripple={{ color: colors.headerButton, borderless: true, radius: 22 }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.headerButton },
        pressed && Platform.OS !== 'android' && { opacity: 0.6 },
      ]}
    >
      <Icon source={icon} size={20} color={colors.onHeader} />
    </Pressable>
  );
}

/** Asks before ending the session; signing out drops the user back at login. */
export function useConfirmSignOut() {
  const { signOut } = useAuth();
  return () =>
    confirmDestructive({
      title: 'Sign out?',
      message: 'You will need your email and password to sign back in.',
      confirmLabel: 'Sign out',
      onConfirm: signOut,
    });
}

export function SignOutButton() {
  const confirmSignOut = useConfirmSignOut();
  return <HeaderButton icon="logout" label="Sign out" onPress={confirmSignOut} />;
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
