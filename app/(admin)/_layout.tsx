import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="student/[id]" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="batch/[id]" />
    </Stack>
  );
}
