import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { StudentStatus } from '@/src/types';

/** Spacing / radius tokens used across every screen. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

const brand = {
  primary: '#4F46E5',
  primaryDark: '#A5B4FC',
  secondary: '#0891B2',
};

export interface AppColors {
  success: string;
  onSuccess: string;
  successContainer: string;
  warning: string;
  onWarning: string;
  warningContainer: string;
  info: string;
  infoContainer: string;
  neutralContainer: string;
  muted: string;
  screen: string;
  card: string;
  border: string;
}

export type AppTheme = MD3Theme & { colors: MD3Theme['colors'] & AppColors };

export const LightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0E7FF',
    onPrimaryContainer: '#1E1B4B',
    secondary: brand.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CFFAFE',
    background: '#F4F5F9',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF0F6',
    onSurfaceVariant: '#5B6273',
    outline: '#D7DBE5',
    outlineVariant: '#E7EAF1',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#7F1D1D',
    elevation: { ...MD3LightTheme.colors.elevation, level1: '#FFFFFF' },

    success: '#059669',
    onSuccess: '#FFFFFF',
    successContainer: '#D1FAE5',
    warning: '#B45309',
    onWarning: '#FFFFFF',
    warningContainer: '#FEF3C7',
    info: '#2563EB',
    infoContainer: '#DBEAFE',
    neutralContainer: '#EEF0F6',
    muted: '#6B7280',
    screen: '#F4F5F9',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
};

export const DarkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.primaryDark,
    onPrimary: '#1E1B4B',
    primaryContainer: '#312E81',
    onPrimaryContainer: '#E0E7FF',
    secondary: '#67E8F9',
    onSecondary: '#083344',
    secondaryContainer: '#164E63',
    background: '#0B0F1A',
    surface: '#141A28',
    surfaceVariant: '#1E2637',
    onSurfaceVariant: '#A3ACC2',
    outline: '#334155',
    outlineVariant: '#25304A',
    error: '#F87171',
    errorContainer: '#4C1D1D',
    onErrorContainer: '#FEE2E2',
    elevation: { ...MD3DarkTheme.colors.elevation, level1: '#141A28' },

    success: '#34D399',
    onSuccess: '#052E23',
    successContainer: '#064E3B',
    warning: '#FBBF24',
    onWarning: '#3B2400',
    warningContainer: '#4A3005',
    info: '#60A5FA',
    infoContainer: '#1E3A8A',
    neutralContainer: '#1E2637',
    muted: '#94A3B8',
    screen: '#0B0F1A',
    card: '#141A28',
    border: '#25304A',
  },
};

export interface StatusMeta {
  label: string;
  icon: string;
  color: keyof AppColors | 'primary' | 'error';
  container: string;
}

/** Visual + copy mapping for every point in the approval lifecycle. */
export const STATUS_META: Record<StudentStatus, { label: string; icon: string; description: string }> = {
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    icon: 'clock-outline',
    description: 'Your registration has been submitted and is waiting for admin review.',
  },
  APPROVED: {
    label: 'Approved',
    icon: 'check-decagram-outline',
    description: 'Your registration is approved. A batch will be allocated to you shortly.',
  },
  ALLOCATED: {
    label: 'Batch Allocated',
    icon: 'calendar-check-outline',
    description: 'A batch has been allocated. Your course starts on the batch start date.',
  },
  ACTIVE: {
    label: 'Active',
    icon: 'school-outline',
    description: 'You are actively enrolled. All course content is available to you.',
  },
  REJECTED: {
    label: 'Rejected',
    icon: 'close-circle-outline',
    description: 'Your registration was not approved.',
  },
};

export function statusColors(colors: AppTheme['colors'], status: StudentStatus) {
  switch (status) {
    case 'PENDING_APPROVAL':
      return { fg: colors.warning, bg: colors.warningContainer };
    case 'APPROVED':
      return { fg: colors.info, bg: colors.infoContainer };
    case 'ALLOCATED':
      return { fg: colors.primary, bg: colors.primaryContainer };
    case 'ACTIVE':
      return { fg: colors.success, bg: colors.successContainer };
    case 'REJECTED':
      return { fg: colors.error, bg: colors.errorContainer };
  }
}

export const CONTENT_META = {
  VIDEO: { icon: 'play-circle-outline', label: 'Video' },
  NOTES: { icon: 'file-document-outline', label: 'Notes' },
  ASSIGNMENT: { icon: 'clipboard-text-outline', label: 'Assignment' },
  IMAGE: { icon: 'image-outline', label: 'Image' },
} as const;
