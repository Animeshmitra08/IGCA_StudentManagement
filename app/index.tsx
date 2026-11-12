import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

/** Entry point - bounces to the right role group (or to login). */
export default function Index() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'ADMIN') return <Redirect href="/(admin)/(tabs)" />;
  if (user.role === 'TEACHER') return <Redirect href="/(teacher)/(tabs)" />;
  return <Redirect href="/(student)/(tabs)" />;
}
