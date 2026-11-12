import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type TextInput as RNTextInput,
} from 'react-native';
import { Button, Icon, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Group, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

const DEMO = [
  { role: 'Admin', email: 'admin@ams.dev', password: 'admin123' },
  { role: 'Teacher', email: 'ritu@ams.dev', password: 'teacher123' },
  { role: 'Student', email: 'ananya.sharma@example.com', password: 'student123' },
];

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn, signingIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<RNTextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign you in. Try again.');
    }
  };

  const fillDemo = (account: (typeof DEMO)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.screen }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={[styles.mark, { backgroundColor: colors.primary }]}>
            <Icon source="school" size={28} color={colors.onPrimary} />
          </View>
          <Txt v="title" accessibilityRole="header">
            Student Management
          </Txt>
          <Txt muted>Sign in with your registered email and password.</Txt>
        </View>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            outlineStyle={styles.outline}
          />

          <TextInput
            ref={passwordRef}
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            right={
              <TextInput.Icon
                icon={secure ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setSecure((s) => !s)}
                accessibilityLabel={secure ? 'Show password' : 'Hide password'}
              />
            }
            outlineStyle={styles.outline}
          />

          {!!error && (
            <Txt v="caption" color={colors.error} accessibilityLiveRegion="polite">
              {error}
            </Txt>
          )}

          <Button
            mode="contained"
            onPress={submit}
            loading={signingIn}
            disabled={signingIn}
            contentStyle={styles.buttonContent}
            style={styles.submit}
          >
            Sign in
          </Button>

          <View style={styles.registerRow}>
            <Txt muted>New student?</Txt>
            <Button mode="text" compact onPress={() => router.push('/(auth)/register')}>
              Register
            </Button>
          </View>
        </View>

        <SectionHeader title="Demo accounts" />
        <Group>
          {DEMO.map((account) => (
            <Row
              key={account.role}
              title={account.role}
              subtitle={`${account.email} · ${account.password}`}
              onPress={() => fillDemo(account)}
              accessibilityLabel={`Fill in the ${account.role} demo account`}
            />
          ))}
        </Group>
        <Txt v="caption" muted style={styles.demoHint}>
          Tap an account to fill in the form.
        </Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, flexGrow: 1 },
  brand: { gap: spacing.xs, paddingHorizontal: spacing.xs },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  form: { gap: spacing.md, marginTop: spacing.xl },
  outline: { borderRadius: radius.sm },
  submit: { marginTop: spacing.xs },
  buttonContent: { height: 48 },
  registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  demoHint: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
});
