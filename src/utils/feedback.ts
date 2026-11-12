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
 * Haptics vocabulary: only for the outcome of an async action, never for plain taps
 * or navigation.
 */
export const haptic = {
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  failure: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
