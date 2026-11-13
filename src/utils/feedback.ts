import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Destructive confirmation. Native uses the system alert (the one sanctioned use of
 * Alert.alert); react-native-web has no Alert implementation, so web falls back to
 * window.confirm.
 */
export function confirmDestructive({
  title,
  message,
  confirmLabel,
  onConfirm,
}: {
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  if (Platform.OS === 'web') {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/**
 * Haptics vocabulary: `success` / `failure` for the outcome of an async action, and
 * `select` for switching tabs. Plain taps stay silent.
 */
export const haptic = {
  select: () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  failure: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
