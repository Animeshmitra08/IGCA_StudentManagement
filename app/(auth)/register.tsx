import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInputProps,
} from 'react-native';
import { Button, HelperText, Icon, Menu, Snackbar, TextInput } from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { usePreventRemove } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { useDataGate } from '@/src/components/DataGate';
import { ProgressRing } from '@/src/components/ProgressRing';
import { ActionBar } from '@/src/components/Screen';
import {
  Group,
  InfoRow,
  Notice,
  SectionHeader,
  SkeletonList,
  Touchable,
  Txt,
} from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { DOCUMENT_META, radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { haptic } from '@/src/utils/feedback';
import { formatCurrency } from '@/src/utils/format';
import type { Course, DocumentType, StudentDocument } from '@/src/types';

const STEPS = [
  { key: 'personal', title: 'Personal details', intro: 'Your name as it appears on your ID.' },
  { key: 'contact', title: 'Contact', intro: 'How the office reaches you and your guardian.' },
  { key: 'education', title: 'Education', intro: 'Your highest completed qualification.' },
  { key: 'course', title: 'Course', intro: 'An admin allocates your batch after approval.' },
  { key: 'documents', title: 'Documents and password', intro: 'Attach the required files, then set a password.' },
] as const;

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const DOC_SLOTS: { type: DocumentType; label: string; hint: string; required: boolean }[] = [
  { type: 'PHOTO', label: 'Passport photo', hint: 'JPG or PNG, under 2 MB', required: true },
  { type: 'ID_PROOF', label: 'ID proof', hint: 'Aadhaar, PAN or passport', required: true },
  { type: 'MARKSHEET', label: 'Latest marksheet', hint: 'PDF of your final marksheet', required: false },
  { type: 'OTHER', label: 'Other document', hint: 'Portfolio or certificates', required: false },
];

interface FormState {
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  guardianName: string;
  guardianPhone: string;
  qualification: string;
  institution: string;
  board: string;
  yearOfPassing: string;
  percentage: string;
  courseId: string;
  password: string;
  confirmPassword: string;
}

const EMPTY: FormState = {
  fullName: '', dob: '', gender: '', bloodGroup: '',
  email: '', phone: '', altPhone: '', address: '', city: '', state: '', pincode: '',
  guardianName: '', guardianPhone: '',
  qualification: '', institution: '', board: '', yearOfPassing: '', percentage: '',
  courseId: '', password: '', confirmPassword: '',
};

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { register } = useAuth();
  const { courses, modulesOf } = useData();
  const coursesGate = useDataGate('list');
  const scrollRef = useRef<ScrollView>(null);
  const headerHeight = useHeaderHeight();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const goToStep = (next: number) => {
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Header back, Android back and the iOS swipe all step back through the form
  // instead of throwing away everything entered so far.
  usePreventRemove(step > 0 && !submitting, () => goToStep(step - 1));

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === form.courseId),
    [courses, form.courseId],
  );

  /* -------------------------------------------------------- validation */

  const validateStep = (index: number) => {
    const next: Record<string, string> = {};
    const req = (key: keyof FormState, message: string) => {
      if (!form[key].trim()) next[key] = message;
    };

    if (index === 0) {
      req('fullName', 'Enter your full name');
      req('gender', 'Select a gender');
      if (!form.dob.trim()) next.dob = 'Enter your date of birth';
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim())) next.dob = 'Use the format YYYY-MM-DD, for example 2003-05-21';
    }

    if (index === 1) {
      if (!form.email.trim()) next.email = 'Enter your email';
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
      if (!form.phone.trim()) next.phone = 'Enter your phone number';
      else if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Enter a 10 digit number';
      req('address', 'Enter your address');
      req('city', 'Enter your city');
      req('state', 'Enter your state');
      if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim()))
        next.pincode = 'Enter a 6 digit pincode';
    }

    if (index === 2) {
      req('qualification', 'Enter your qualification');
      req('institution', 'Enter your institution');
      if (!form.yearOfPassing.trim()) next.yearOfPassing = 'Enter the year';
      else if (!/^\d{4}$/.test(form.yearOfPassing.trim())) next.yearOfPassing = 'Enter a 4 digit year';
      const pct = Number(form.percentage);
      if (!form.percentage.trim()) next.percentage = 'Enter your percentage';
      else if (Number.isNaN(pct) || pct < 0 || pct > 100) next.percentage = 'Enter 0 to 100';
    }

    if (index === 3 && !form.courseId) {
      next.courseId = 'Select a course to continue';
    }

    if (index === 4) {
      const missing = DOC_SLOTS.filter(
        (slot) => slot.required && !documents.some((d) => d.type === slot.type),
      );
      if (missing.length) next.documents = `Attach your ${missing.map((m) => m.label.toLowerCase()).join(' and ')}`;
      if (form.password.length < 6) next.password = 'Use at least 6 characters';
      if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) {
      haptic.failure();
      return;
    }
    if (step < STEPS.length - 1) goToStep(step + 1);
    else void submit();
  };

  const goBack = () => {
    if (step === 0) router.back();
    else goToStep(step - 1);
  };

  /* ------------------------------------------------------------ submit */

  const submit = async () => {
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        dob: form.dob.trim(),
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        email: form.email.trim(),
        phone: form.phone.trim(),
        altPhone: form.altPhone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        education: {
          qualification: form.qualification.trim(),
          institution: form.institution.trim(),
          board: form.board.trim(),
          yearOfPassing: Number(form.yearOfPassing),
          percentage: Number(form.percentage),
        },
        courseId: form.courseId,
        documents,
        password: form.password,
      });
      haptic.success();
      // RoleGate redirects into the student area once the account exists.
    } catch (e) {
      haptic.failure();
      setToast(e instanceof Error ? e.message : 'Registration failed. Try again.');
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------- doc helpers */

  const attach = (slot: (typeof DOC_SLOTS)[number]) => {
    const ext = slot.type === 'PHOTO' ? 'jpg' : 'pdf';
    const doc: StudentDocument = {
      id: `DOC-${Date.now()}-${slot.type}`,
      name: `${slot.type.toLowerCase()}-${form.fullName.split(' ')[0]?.toLowerCase() || 'file'}.${ext}`,
      type: slot.type,
      size: `${(Math.random() * 1.8 + 0.2).toFixed(1)} MB`,
      uploadedOn: new Date().toISOString().slice(0, 10),
    };
    setDocuments((prev) => [...prev.filter((d) => d.type !== slot.type), doc]);
    setErrors((prev) => ({ ...prev, documents: '' }));
  };

  const removeDoc = (type: DocumentType) =>
    setDocuments((prev) => prev.filter((d) => d.type !== type));

  /* -------------------------------------------------------------- view */

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.screen }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <StepProgress step={step} />

      <ScrollView
        ref={scrollRef}
        style={styles.root}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.intro}>
          <Txt v="title" accessibilityRole="header">
            {current.title}
          </Txt>
          <Txt muted>{current.intro}</Txt>
        </View>

        {step === 0 && (
          <View style={styles.fields}>
            <Field
              label="Full name *"
              value={form.fullName}
              onChangeText={set('fullName')}
              error={errors.fullName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <Field
              label="Date of birth *"
              value={form.dob}
              onChangeText={set('dob')}
              error={errors.dob}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              autoComplete="birthdate-full"
              hint="For example 2003-05-21"
            />
            <PickerField
              label="Gender *"
              value={form.gender}
              options={GENDERS}
              onSelect={set('gender')}
              error={errors.gender}
            />
            <PickerField
              label="Blood group"
              value={form.bloodGroup}
              options={BLOOD_GROUPS}
              onSelect={set('bloodGroup')}
            />
          </View>
        )}

        {step === 1 && (
          <View style={styles.fields}>
            <Field
              label="Email *"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Field
              label="Phone *"
              value={form.phone}
              onChangeText={set('phone')}
              error={errors.phone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
            <Field
              label="Alternate phone"
              value={form.altPhone}
              onChangeText={set('altPhone')}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
            <Field
              label="Address *"
              value={form.address}
              onChangeText={set('address')}
              error={errors.address}
              multiline
              autoComplete="street-address"
              textContentType="fullStreetAddress"
            />
            <View style={styles.pair}>
              <View style={styles.half}>
                <Field
                  label="City *"
                  value={form.city}
                  onChangeText={set('city')}
                  error={errors.city}
                  autoComplete="postal-address-locality"
                  textContentType="addressCity"
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="State *"
                  value={form.state}
                  onChangeText={set('state')}
                  error={errors.state}
                  autoComplete="postal-address-region"
                  textContentType="addressState"
                />
              </View>
            </View>
            <Field
              label="Pincode"
              value={form.pincode}
              onChangeText={set('pincode')}
              error={errors.pincode}
              keyboardType="number-pad"
              autoComplete="postal-code"
              textContentType="postalCode"
            />

            <SectionHeader title="Guardian" />
            <Field
              label="Guardian name"
              value={form.guardianName}
              onChangeText={set('guardianName')}
              autoCapitalize="words"
            />
            <Field
              label="Guardian phone"
              value={form.guardianPhone}
              onChangeText={set('guardianPhone')}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.fields}>
            <Field
              label="Qualification *"
              value={form.qualification}
              onChangeText={set('qualification')}
              error={errors.qualification}
              placeholder="B.Tech, Computer Science"
            />
            <Field
              label="Institution *"
              value={form.institution}
              onChangeText={set('institution')}
              error={errors.institution}
              autoCapitalize="words"
            />
            <Field
              label="Board or university"
              value={form.board}
              onChangeText={set('board')}
              autoCapitalize="words"
            />
            <View style={styles.pair}>
              <View style={styles.half}>
                <Field
                  label="Year of passing *"
                  value={form.yearOfPassing}
                  onChangeText={set('yearOfPassing')}
                  error={errors.yearOfPassing}
                  keyboardType="number-pad"
                  placeholder="2025"
                />
              </View>
              <View style={styles.half}>
                <Field
                  label="Percentage *"
                  value={form.percentage}
                  onChangeText={set('percentage')}
                  error={errors.percentage}
                  keyboardType="decimal-pad"
                  placeholder="78.5"
                />
              </View>
            </View>
          </View>
        )}

        {step === 3 &&
          (coursesGate ? (
            <Group>
              <SkeletonList rows={3} avatar={false} />
            </Group>
          ) : (
            <View>
              {!!errors.courseId && (
                <HelperText type="error" visible style={styles.groupError}>
                  {errors.courseId}
                </HelperText>
              )}
              <Group separatorInset={spacing.lg + 22 + spacing.md}>
                {courses.map((course) => (
                  <CourseOption
                    key={course.id}
                    course={course}
                    moduleCount={modulesOf(course.id).length}
                    selected={form.courseId === course.id}
                    onPress={() => set('courseId')(course.id)}
                  />
                ))}
              </Group>
            </View>
          ))}

        {step === 4 && (
          <View>
            <SectionHeader title="Documents" first />
            <Group separatorInset={spacing.lg + 24 + spacing.md}>
              {DOC_SLOTS.map((slot) => {
                const doc = documents.find((d) => d.type === slot.type);
                return (
                  <View key={slot.type} style={styles.docRow}>
                    <Icon
                      source={doc ? 'check-circle' : DOCUMENT_META[slot.type].icon}
                      size={24}
                      color={doc ? colors.success : colors.muted}
                    />
                    <View style={styles.docBody}>
                      <Txt v="bodyStrong">
                        {slot.label}
                        {slot.required ? ' *' : ''}
                      </Txt>
                      <Txt v="caption" muted numberOfLines={1}>
                        {doc ? `${doc.name} · ${doc.size}` : slot.hint}
                      </Txt>
                    </View>
                    {doc ? (
                      <Button
                        mode="text"
                        textColor={colors.error}
                        onPress={() => removeDoc(slot.type)}
                        accessibilityLabel={`Remove ${slot.label}`}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button mode="outlined" onPress={() => attach(slot)} accessibilityLabel={`Attach ${slot.label}`}>
                        Attach
                      </Button>
                    )}
                  </View>
                );
              })}
            </Group>
            {!!errors.documents && (
              <HelperText type="error" visible style={styles.groupError}>
                {errors.documents}
              </HelperText>
            )}

            <SectionHeader title="Password" />
            <View style={styles.fields}>
              <Field
                label="Password *"
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                hint="At least 6 characters. You use it to sign in after approval."
              />
              <Field
                label="Confirm password *"
                value={form.confirmPassword}
                onChangeText={set('confirmPassword')}
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
            </View>

            <SectionHeader title="Review" />
            <Group>
              <InfoRow label="Name" value={form.fullName} />
              <InfoRow label="Email" value={form.email} />
              <InfoRow label="Phone" value={form.phone} />
              <InfoRow label="Qualification" value={form.qualification} />
              <InfoRow label="Course" value={selectedCourse?.title} />
              <InfoRow label="Documents" value={`${documents.length} attached`} />
            </Group>
            <Notice
              tone="info"
              icon="information-outline"
              message="After you submit, an admin reviews your application and allocates your batch."
              style={styles.notice}
            />
          </View>
        )}
      </ScrollView>

      <ActionBar>
        <Button
          mode="outlined"
          onPress={goBack}
          style={styles.footerBtn}
          contentStyle={styles.buttonContent}
          disabled={submitting}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          mode="contained"
          onPress={goNext}
          style={styles.footerBtn}
          contentStyle={styles.buttonContent}
          loading={submitting}
          disabled={submitting}
        >
          {last ? 'Submit' : 'Continue'}
        </Button>
      </ActionBar>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={4000}>
        {toast}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

/* ---------------------------------------------------------- sub views */

function StepProgress({ step }: { step: number }) {
  const next = step + 1 < STEPS.length ? STEPS[step + 1] : undefined;
  return (
    <View
      style={styles.progress}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step + 1} of ${STEPS.length}, ${STEPS[step].title}`}
    >
      <ProgressRing
        value={(step + 1) / STEPS.length}
        size={52}
        stroke={5}
        label={`${step + 1}/${STEPS.length}`}
      />
      <View style={styles.progressBody}>
        <Txt v="label" muted chrome>
          Step {step + 1} of {STEPS.length}
        </Txt>
        <Txt v="caption" muted numberOfLines={1}>
          {next ? `Next: ${next.title}` : 'Last step'}
        </Txt>
      </View>
    </View>
  );
}

function CourseOption({
  course,
  moduleCount,
  selected,
  onPress,
}: {
  course: Course;
  moduleCount: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Touchable
      onPress={onPress}
      style={styles.option}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${course.title}, ${course.durationWeeks} weeks, ${formatCurrency(course.fee)}`}
    >
      <Icon
        source={selected ? 'radiobox-marked' : 'radiobox-blank'}
        size={22}
        color={selected ? colors.primary : colors.outline}
      />
      <View style={styles.optionBody}>
        <Txt v="bodyStrong">{course.title}</Txt>
        <Txt v="caption" muted numberOfLines={2}>
          {course.tagline}
        </Txt>
        <Txt v="caption" muted>
          {course.durationWeeks} weeks · {course.level} · {moduleCount} modules · {formatCurrency(course.fee)}
        </Txt>
      </View>
    </Touchable>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  /** Helper shown under the field while there is no error. */
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
}

function Field({ label, value, onChangeText, error, hint, ...rest }: FieldProps) {
  return (
    <View>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        outlineStyle={styles.outline}
        {...rest}
      />
      {(!!error || !!hint) && (
        <HelperText type={error ? 'error' : 'info'} visible>
          {error || hint}
        </HelperText>
      )}
    </View>
  );
}

function PickerField({
  label,
  value,
  options,
  onSelect,
  error,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          // editable={false} swallows keyboard input; the Pressable keeps the tap target.
          <Pressable
            onPress={() => setOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`${label.replace(' *', '')}, ${value || 'not selected'}`}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={value}
                editable={false}
                error={!!error}
                right={<TextInput.Icon icon="menu-down" />}
                outlineStyle={styles.outline}
              />
            </View>
          </Pressable>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              onSelect(option);
              setOpen(false);
            }}
          />
        ))}
      </Menu>
      {!!error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressBody: { flex: 1, gap: 2 },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { gap: spacing.xs, paddingHorizontal: spacing.xs, marginBottom: spacing.xl },
  fields: { gap: spacing.md },
  pair: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  outline: { borderRadius: radius.sm },
  groupError: { paddingHorizontal: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  optionBody: { flex: 1, gap: 2 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  docBody: { flex: 1, gap: 2 },
  notice: { marginTop: spacing.md },
  footerBtn: { flex: 1 },
  buttonContent: { height: 48 },
});
