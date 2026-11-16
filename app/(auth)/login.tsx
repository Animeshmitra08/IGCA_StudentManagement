import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type TextInputInstance,
} from 'react-native';
import { Icon, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LoginBrand, LoginHeader } from '@/src/components/auth/LoginHeader';
import { LoginInput, PasswordInput } from '@/src/components/auth/LoginInput';
import { PrimaryButton } from '@/src/components/auth/PrimaryButton';
import { RememberMe } from '@/src/components/auth/RememberMe';
import { SocialLoginButton } from '@/src/components/auth/SocialLoginButton';
import { Enter, EntranceProvider } from '@/src/components/motion';
import { Group, Notice, Row, SectionHeader, Txt } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { haptic } from '@/src/utils/feedback';

const DEMO = [
  { role: 'Admin', icon: 'shield-account-outline', email: 'admin@ams.dev', password: 'admin123' },
  { role: 'Teacher', icon: 'human-male-board', email: 'ritu@ams.dev', password: 'teacher123' },
  { role: 'Student', icon: 'school-outline', email: 'ananya.sharma@example.com', password: 'student123' },
];

const DEMO_ICON = 24;
const WAVE = 96;

/**
 * "Remember me" keeps the last identifier for the next visit to this screen. It lives
 * in memory only: the app has no device storage yet, so it is lost when the app closes.
 */
let remembered = '';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn, signingIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const passwordRef = useRef<TextInputInstance>(null);

  const [identifier, setIdentifier] = useState(remembered);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(!!remembered);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const submit = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Enter your email or roll number and your password.');
      haptic.failure();
      return;
    }
    try {
      await signIn(identifier, password);
      remembered = remember ? identifier.trim() : '';
      haptic.success();
    } catch (e) {
      haptic.failure();
      setError(e instanceof Error ? e.message : 'Could not sign you in. Try again.');
    }
  };

  const fillDemo = (account: (typeof DEMO)[number]) => {
    setIdentifier(account.email);
    setPassword(account.password);
    setError('');
  };

  // The bottom wave is the top of a circle twice the screen wide, set off-centre.
  const waveSize = width * 2;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.screen }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <EntranceProvider>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + WAVE },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decoration: mint shape behind the header, mint wave at the bottom. */}
          <View style={styles.decor} importantForAccessibility="no-hide-descendants">
            <View style={[styles.blob, { backgroundColor: colors.primaryContainer }]} />
            <View
              style={[
                styles.wave,
                {
                  width: waveSize,
                  height: waveSize,
                  borderRadius: waveSize / 2,
                  left: -width * 0.75,
                  bottom: -(waveSize - WAVE - insets.bottom),
                  backgroundColor: colors.primaryContainer,
                },
              ]}
            />
            <View style={[styles.waveCap, { bottom: insets.bottom + spacing.lg }]}>
              <Icon source="school-outline" size={32} color={colors.primary} />
            </View>
          </View>

          <Enter order={0}>
            <LoginBrand />
          </Enter>

          <Enter order={1} style={styles.header}>
            <LoginHeader />
          </Enter>

          <Enter order={2}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LoginInput
                label="Email or Roll Number"
                placeholder="Enter email or roll number"
                icon="account-outline"
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  setError('');
                }}
                error={!!error}
                keyboardType="email-address"
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <PasswordInput
                ref={passwordRef}
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                error={!!error}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />

              <View style={styles.options}>
                <RememberMe checked={remember} onChange={setRemember} />
                <TextLink
                  label="Forgot Password?"
                  onPress={() =>
                    setToast('Password reset is not available in the app yet. Ask the institute office to reset it.')
                  }
                />
              </View>

              {!!error && (
                <View accessibilityLiveRegion="polite">
                  <Notice tone="error" icon="alert-circle-outline" message={error} />
                </View>
              )}

              <PrimaryButton label="Sign In" onPress={submit} loading={signingIn} />

              <View style={styles.divider}>
                <View style={[styles.rule, { backgroundColor: colors.border }]} />
                <Txt v="caption" muted>
                  or continue with
                </Txt>
                <View style={[styles.rule, { backgroundColor: colors.border }]} />
              </View>

              <View style={styles.social}>
                <SocialLoginButton
                  provider="Google"
                  icon="google"
                  onPress={() => setToast('Google sign-in is not set up yet.')}
                />
                <SocialLoginButton
                  provider="Apple"
                  icon="apple"
                  onPress={() => setToast('Apple sign-in is not set up yet.')}
                />
              </View>

              <View style={styles.signUp}>
                <Txt muted>Don&apos;t have an account?</Txt>
                <TextLink label="Sign Up" v="bodyStrong" onPress={() => router.push('/(auth)/register')} />
              </View>
            </View>
          </Enter>

          <Enter order={3}>
            <SectionHeader title="Demo accounts" />
            <Group separatorInset={spacing.lg + DEMO_ICON + spacing.md}>
              {DEMO.map((account) => {
                const filled = identifier === account.email && password === account.password;
                return (
                  <Row
                    key={account.role}
                    title={account.role}
                    subtitle={`${account.email} · ${account.password}`}
                    leading={
                      <Icon
                        source={account.icon}
                        size={DEMO_ICON}
                        color={filled ? colors.primary : colors.muted}
                      />
                    }
                    trailing={
                      filled ? <Icon source="check-circle" size={20} color={colors.primary} /> : undefined
                    }
                    onPress={() => fillDemo(account)}
                    accessibilityLabel={
                      filled
                        ? `${account.role} demo account, filled in`
                        : `Fill in the ${account.role} demo account`
                    }
                  />
                );
              })}
            </Group>
          </Enter>
        </ScrollView>
      </EntranceProvider>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={4000}>
        {toast}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

/** Inline text action in the accent colour. */
function TextLink({
  label,
  onPress,
  v = 'label',
}: {
  label: string;
  onPress: () => void;
  v?: 'label' | 'bodyStrong';
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={12}
      style={({ pressed }) => pressed && styles.linkPressed}
    >
      <Txt v={v} color={colors.primary} chrome>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, flexGrow: 1 },
  decor: { ...StyleSheet.absoluteFill, overflow: 'hidden', pointerEvents: 'none' },
  blob: { position: 'absolute', top: -96, right: -104, width: 320, height: 320, borderRadius: 160 },
  wave: { position: 'absolute' },
  waveCap: { position: 'absolute', right: spacing.xl, opacity: 0.6 },
  header: { marginTop: spacing.xl, marginBottom: spacing.lg },
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: spacing.md,
    rowGap: spacing.sm,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rule: { flex: 1, height: StyleSheet.hairlineWidth },
  social: { flexDirection: 'row', gap: spacing.md },
  signUp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacing.xs,
  },
  linkPressed: { opacity: 0.5 },
});
