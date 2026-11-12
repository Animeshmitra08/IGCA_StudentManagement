import { Stack } from 'expo-router';
import { detailScreenOptions } from '@/src/theme/navigation';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ ...detailScreenOptions, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
      <Stack.Screen name="batch/[id]" options={{ title: 'Batch' }} />
    </Stack>
  );
}
