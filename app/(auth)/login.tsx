import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

const DEMO = [
  { role: 'Admin', email: 'admin@ams.dev', password: 'admin123', icon: 'shield-account-outline' },
  { role: 'Teacher', email: 'ritu@ams.dev', password: 'teacher123', icon: 'account-tie-outline' },
  { role: 'Student', email: 'ananya.sharma@example.com', password: 'student123', icon: 'school-outline' },
];

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn, signingIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password');
      return;
    }
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in');
    }
  };

  const fillDemo = (account: (typeof DEMO)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.screen }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Icon source="school" size={30} color={colors.onPrimary} />
          </View>
          <Text variant="headlineSmall" style={styles.appName}>
            Student Management
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.muted }}>
            Learning platform for students, teachers and admins
          </Text>
        </View>

        <Card style={styles.card}>
          <Text variant="titleMedium" style={{ fontWeight: '700' }}>
            Sign in
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email-outline" />}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={secure ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setSecure((s) => !s)}
              />
            }
            style={styles.input}
          />

          {!!error && (
            <HelperText type="error" visible style={{ marginTop: -spacing.xs }}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={submit}
            loading={signingIn}
            disabled={signingIn}
            style={styles.primaryBtn}
            contentStyle={{ height: 48 }}
          >
            Sign In
          </Button>

          <View style={styles.registerRow}>
            <Text variant="bodySmall" style={{ color: colors.muted }}>
              New student?
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => router.push('/(auth)/register')}
              labelStyle={{ fontWeight: '700' }}
            >
              Register here
            </Button>
          </View>
        </Card>

        <Divider style={{ marginVertical: spacing.xl }} />

        <Text variant="labelLarge" style={{ color: colors.muted, marginBottom: spacing.md }}>
          DEMO ACCOUNTS (no backend - tap to fill)
        </Text>

        <View style={styles.demoList}>
          {DEMO.map((account) => (
            <Card key={account.role} onPress={() => fillDemo(account)} style={styles.demoCard}>
              <View style={styles.demoRow}>
                <View style={[styles.demoIcon, { backgroundColor: colors.primaryContainer }]}>
                  <Icon source={account.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                    {account.role}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    {account.email} · {account.password}
                  </Text>
                </View>
                <Icon source="arrow-top-left" size={16} color={colors.muted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  brand: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: { fontWeight: '800' },
  card: { gap: spacing.md },
  input: { backgroundColor: 'transparent' },
  primaryBtn: { borderRadius: radius.md, marginTop: spacing.xs },
  registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  demoList: { gap: spacing.sm },
  demoCard: { padding: spacing.md },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
