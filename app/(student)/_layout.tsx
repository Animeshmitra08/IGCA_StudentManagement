import { Stack } from 'expo-router';
import { detailScreenOptions } from '@/src/theme/navigation';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ ...detailScreenOptions, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
      <Stack.Screen name="module/[id]" options={{ title: 'Module' }} />
      <Stack.Screen name="content/[id]" options={{ title: 'Content' }} />
    </Stack>
  );
}
