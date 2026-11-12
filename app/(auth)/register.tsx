import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInputProps,
} from 'react-native';
import {
  Button,
  Divider,
  HelperText,
  Icon,
  IconButton,
  Menu,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CourseCard } from '@/src/components/CourseCard';
import { Card, InfoRow, SectionHeader } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { formatCurrency } from '@/src/utils/format';
import type { DocumentType, StudentDocument } from '@/src/types';

const STEPS = [
  { key: 'personal', title: 'Personal', icon: 'account-outline' },
  { key: 'contact', title: 'Contact', icon: 'phone-outline' },
  { key: 'education', title: 'Education', icon: 'book-open-outline' },
  { key: 'course', title: 'Course', icon: 'bookshelf' },
  { key: 'documents', title: 'Documents', icon: 'file-upload-outline' },
] as const;

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const DOC_SLOTS: { type: DocumentType; label: string; hint: string; required: boolean }[] = [
  { type: 'PHOTO', label: 'Passport Photo', hint: 'JPG or PNG, under 2 MB', required: true },
  { type: 'ID_PROOF', label: 'ID Proof', hint: 'Aadhaar / PAN / Passport', required: true },
  { type: 'MARKSHEET', label: 'Latest Marksheet', hint: 'PDF of final marksheet', required: false },
  { type: 'OTHER', label: 'Other Document', hint: 'Portfolio, certificates', required: false },
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
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { courses, modulesOf, courseContent } = useData();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

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
      req('fullName', 'Full name is required');
      req('gender', 'Select a gender');
      if (!form.dob.trim()) next.dob = 'Date of birth is required';
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim())) next.dob = 'Use the format YYYY-MM-DD';
    }

    if (index === 1) {
      if (!form.email.trim()) next.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
      if (!form.phone.trim()) next.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(form.phone.trim())) next.phone = 'Enter a 10 digit number';
      req('address', 'Address is required');
      req('city', 'City is required');
      req('state', 'State is required');
      if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim()))
        next.pincode = 'Enter a 6 digit pincode';
    }

    if (index === 2) {
      req('qualification', 'Qualification is required');
      req('institution', 'Institution is required');
      if (!form.yearOfPassing.trim()) next.yearOfPassing = 'Year is required';
      else if (!/^\d{4}$/.test(form.yearOfPassing.trim())) next.yearOfPassing = 'Enter a 4 digit year';
      const pct = Number(form.percentage);
      if (!form.percentage.trim()) next.percentage = 'Percentage is required';
      else if (Number.isNaN(pct) || pct < 0 || pct > 100) next.percentage = 'Enter 0 - 100';
    }

    if (index === 3 && !form.courseId) {
      next.courseId = 'Select a course to continue';
    }

    if (index === 4) {
      const missing = DOC_SLOTS.filter(
        (slot) => slot.required && !documents.some((d) => d.type === slot.type),
      );
      if (missing.length) next.documents = `Attach: ${missing.map((m) => m.label).join(', ')}`;
      if (form.password.length < 6) next.password = 'Minimum 6 characters';
      if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else void submit();
  };

  const goBack = () => {
    if (step === 0) router.back();
    else setStep(step - 1);
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
      // RoleGate redirects into the student area once the account exists.
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Registration failed');
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.screen }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border, backgroundColor: colors.card }]}>
        <IconButton icon="arrow-left" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ fontWeight: '700' }}>
            Student Registration
          </Text>
          <Text variant="bodySmall" style={{ color: colors.muted }}>
            Step {step + 1} of {STEPS.length} · {STEPS[step].title}
          </Text>
        </View>
      </View>

      <Stepper step={step} />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <Card style={styles.card}>
            <SectionHeader title="Personal Information" subtitle="Tell us who you are" />
            <Field
              label="Full Name *"
              value={form.fullName}
              onChangeText={set('fullName')}
              error={errors.fullName}
              icon="account-outline"
            />
            <Field
              label="Date of Birth *  (YYYY-MM-DD)"
              value={form.dob}
              onChangeText={set('dob')}
              error={errors.dob}
              icon="cake-variant-outline"
              placeholder="2003-05-21"
            />
            <PickerField
              label="Gender *"
              value={form.gender}
              options={GENDERS}
              onSelect={set('gender')}
              error={errors.gender}
              icon="gender-male-female"
            />
            <PickerField
              label="Blood Group"
              value={form.bloodGroup}
              options={BLOOD_GROUPS}
              onSelect={set('bloodGroup')}
              icon="water-outline"
            />
          </Card>
        )}

        {step === 1 && (
          <Card style={styles.card}>
            <SectionHeader title="Contact Information" subtitle="How we reach you" />
            <Field
              label="Email *"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
              icon="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Phone *"
              value={form.phone}
              onChangeText={set('phone')}
              error={errors.phone}
              icon="phone-outline"
              keyboardType="phone-pad"
            />
            <Field
              label="Alternate Phone"
              value={form.altPhone}
              onChangeText={set('altPhone')}
              icon="phone-plus-outline"
              keyboardType="phone-pad"
            />
            <Field
              label="Address *"
              value={form.address}
              onChangeText={set('address')}
              error={errors.address}
              icon="map-marker-outline"
              multiline
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field label="City *" value={form.city} onChangeText={set('city')} error={errors.city} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="State *" value={form.state} onChangeText={set('state')} error={errors.state} />
              </View>
            </View>
            <Field
              label="Pincode"
              value={form.pincode}
              onChangeText={set('pincode')}
              error={errors.pincode}
              keyboardType="number-pad"
            />
            <Divider style={{ marginVertical: spacing.sm }} />
            <Field
              label="Guardian Name"
              value={form.guardianName}
              onChangeText={set('guardianName')}
              icon="account-child-outline"
            />
            <Field
              label="Guardian Phone"
              value={form.guardianPhone}
              onChangeText={set('guardianPhone')}
              icon="phone-outline"
              keyboardType="phone-pad"
            />
          </Card>
        )}

        {step === 2 && (
          <Card style={styles.card}>
            <SectionHeader title="Education Information" subtitle="Your highest qualification" />
            <Field
              label="Qualification *"
              value={form.qualification}
              onChangeText={set('qualification')}
              error={errors.qualification}
              icon="certificate-outline"
              placeholder="B.Tech - Computer Science"
            />
            <Field
              label="Institution *"
              value={form.institution}
              onChangeText={set('institution')}
              error={errors.institution}
              icon="office-building-outline"
            />
            <Field
              label="Board / University"
              value={form.board}
              onChangeText={set('board')}
              icon="bank-outline"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Year of Passing *"
                  value={form.yearOfPassing}
                  onChangeText={set('yearOfPassing')}
                  error={errors.yearOfPassing}
                  keyboardType="number-pad"
                  placeholder="2025"
                />
              </View>
              <View style={{ flex: 1 }}>
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
          </Card>
        )}

        {step === 3 && (
          <View>
            <SectionHeader
              title="Select a Course"
              subtitle="Admin allocates your batch after approval"
            />
            {!!errors.courseId && <HelperText type="error" visible>{errors.courseId}</HelperText>}
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                moduleCount={modulesOf(course.id).length}
                contentCount={courseContent(course.id).length}
                selected={form.courseId === course.id}
                onPress={() => set('courseId')(course.id)}
                footer={
                  <Text variant="bodySmall" style={{ color: colors.muted }}>
                    Course fee · {formatCurrency(course.fee)}
                  </Text>
                }
              />
            ))}
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: spacing.lg }}>
            <Card style={styles.card}>
              <SectionHeader title="Documents & Photo" subtitle="Attach the required files" />
              {DOC_SLOTS.map((slot) => {
                const doc = documents.find((d) => d.type === slot.type);
                return (
                  <View
                    key={slot.type}
                    style={[styles.docSlot, { borderColor: doc ? colors.success : colors.border }]}
                  >
                    <View
                      style={[
                        styles.docIcon,
                        { backgroundColor: doc ? colors.successContainer : colors.neutralContainer },
                      ]}
                    >
                      <Icon
                        source={doc ? 'check' : slot.type === 'PHOTO' ? 'camera-outline' : 'file-outline'}
                        size={18}
                        color={doc ? colors.success : colors.muted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                        {slot.label}
                        {slot.required ? ' *' : ''}
                      </Text>
                      <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={1}>
                        {doc ? `${doc.name} · ${doc.size}` : slot.hint}
                      </Text>
                    </View>
                    {doc ? (
                      <IconButton icon="close" size={18} onPress={() => removeDoc(slot.type)} />
                    ) : (
                      <Button mode="outlined" compact onPress={() => attach(slot)}>
                        Attach
                      </Button>
                    )}
                  </View>
                );
              })}
              {!!errors.documents && <HelperText type="error" visible>{errors.documents}</HelperText>}
              <Text variant="bodySmall" style={{ color: colors.muted }}>
                No storage is wired up yet - attaching records a mock file entry.
              </Text>
            </Card>

            <Card style={styles.card}>
              <SectionHeader title="Account Password" subtitle="Used to sign in after approval" />
              <Field
                label="Password *"
                value={form.password}
                onChangeText={set('password')}
                error={errors.password}
                icon="lock-outline"
                secureTextEntry
                autoCapitalize="none"
              />
              <Field
                label="Confirm Password *"
                value={form.confirmPassword}
                onChangeText={set('confirmPassword')}
                error={errors.confirmPassword}
                icon="lock-check-outline"
                secureTextEntry
                autoCapitalize="none"
              />
            </Card>

            <Card style={styles.card}>
              <SectionHeader title="Review" subtitle="Check before submitting" />
              <InfoRow label="Name" value={form.fullName} />
              <InfoRow label="Email" value={form.email} />
              <InfoRow label="Phone" value={form.phone} />
              <InfoRow label="Qualification" value={form.qualification} />
              <InfoRow label="Course" value={selectedCourse?.title} />
              <InfoRow label="Documents" value={`${documents.length} attached`} />
              <View style={[styles.notice, { backgroundColor: colors.warningContainer }]}>
                <Icon source="information-outline" size={16} color={colors.warning} />
                <Text variant="bodySmall" style={{ color: colors.warning, flex: 1 }}>
                  On submit your application moves to PENDING APPROVAL. An admin reviews it and
                  allocates your batch.
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + spacing.md }]}>
        <Button mode="outlined" onPress={goBack} style={styles.footerBtn} disabled={submitting}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          mode="contained"
          onPress={goNext}
          style={styles.footerBtn}
          loading={submitting}
          disabled={submitting}
        >
          {step === STEPS.length - 1 ? 'Submit Registration' : 'Continue'}
        </Button>
      </View>

      <Snackbar visible={!!toast} onDismiss={() => setToast('')} duration={4000}>
        {toast}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

/* ---------------------------------------------------------- sub views */

function Stepper({ step }: { step: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stepper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {STEPS.map((item, index) => {
        const done = index < step;
        const active = index === step;
        return (
          <View key={item.key} style={styles.stepperItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: done || active ? colors.primary : colors.neutralContainer,
                },
              ]}
            >
              <Icon
                source={done ? 'check' : item.icon}
                size={14}
                color={done || active ? colors.onPrimary : colors.muted}
              />
            </View>
            <Text
              style={{
                fontSize: 9.5,
                marginTop: 4,
                color: active ? colors.primary : colors.muted,
                fontWeight: active ? '700' : '500',
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  { backgroundColor: done ? colors.primary : colors.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  icon?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

function Field({ label, value, onChangeText, error, icon, ...rest }: FieldProps) {
  return (
    <View>
      <TextInput
        mode="outlined"
        dense
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        style={{ backgroundColor: 'transparent' }}
        {...rest}
      />
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
    </View>
  );
}

function PickerField({
  label,
  value,
  options,
  onSelect,
  error,
  icon,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  error?: string;
  icon?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          // editable={false} swallows keyboard input; the Pressable keeps the tap target.
          <Pressable onPress={() => setOpen(true)}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                dense
                label={label}
                value={value}
                editable={false}
                error={!!error}
                left={icon ? <TextInput.Icon icon={icon} /> : undefined}
                right={<TextInput.Icon icon="menu-down" />}
                style={{ backgroundColor: 'transparent' }}
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
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  stepper: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepperItem: { flex: 1, alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    position: 'absolute',
    height: 2,
    top: 13,
    left: '60%',
    right: '-40%',
  },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  docSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  docIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBtn: { flex: 1, borderRadius: radius.md },
});
