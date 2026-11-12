import { Stack } from 'expo-router';
import { detailScreenOptions } from '@/src/theme/navigation';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ ...detailScreenOptions, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" options={{ headerShown: false, title: 'Sign in' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  );
}
