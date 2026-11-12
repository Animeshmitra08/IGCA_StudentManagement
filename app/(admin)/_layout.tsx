import { Stack } from 'expo-router';
import { detailScreenOptions } from '@/src/theme/navigation';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ ...detailScreenOptions, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Back' }} />
      <Stack.Screen name="student/[id]" options={{ title: 'Student' }} />
      <Stack.Screen name="course/[id]" options={{ title: 'Course' }} />
      <Stack.Screen name="batch/[id]" options={{ title: 'Batch' }} />
    </Stack>
  );
}
