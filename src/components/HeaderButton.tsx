import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAuth } from '@/src/context/AuthContext';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { confirmDestructive } from '@/src/utils/feedback';

/** Icon button for a native header (44pt target, borderless ripple). */
export function HeaderButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: colors.pressed, borderless: true, radius: 22 }}
      style={({ pressed }) => [styles.button, pressed && Platform.OS !== 'android' && { opacity: 0.5 }]}
    >
      <Icon source={icon} size={22} color={colors.onSurface} />
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
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
