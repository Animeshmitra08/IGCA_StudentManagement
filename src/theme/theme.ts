import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { StudentStatus } from '@/src/types';

/**
 * Design tokens. The reasoning behind every value lives in MOBILE-DESIGN.md at the
 * project root - read it before changing anything here.
 */

/** 4/8pt spacing grid. Screen horizontal padding is always `lg` (16). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * One radius scale, applied by role: sm = inputs, md = buttons, lg = dialogs, notices
 * and the search field, xl = bento tiles and grouped lists.
 */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 22,
  /** Chips, avatars, and the tab bar with its buttons. */
  pill: 999,
} as const;

/** Floating pill tab bar metrics. Tab screens pad their scroll content to clear it. */
export const tabBar = {
  height: 64,
  /** Gap between the bar and the bottom inset, and between the bar and the screen edges. */
  gap: spacing.md,
} as const;

/**
 * Type scale on the system font. Screens use these through <Txt v="..."> instead of
 * per-screen fontSize/fontWeight literals.
 */
export const type = {
  /** One hero number per screen at most. */
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Upper bound for Dynamic Type on chrome text (chips, bars). Body text is unbounded. */
export const CHROME_FONT_SCALE = 1.3;

/**
 * Content is flat (hairlines and tinted tiles, no shadows). `raised` is for bars docked
 * above scrolling content, `floating` for the pill tab bar that hovers over it.
 */
export const elevation: Record<'flat' | 'raised' | 'floating', ViewStyle> = {
  flat: {},
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
    },
    android: { elevation: 10 },
    default: { boxShadow: '0 8px 28px rgba(0, 0, 0, 0.16)' },
  }) as ViewStyle,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
    default: { boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)' },
  }) as ViewStyle,
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
  /** Press highlight and Android ripple colour. */
  pressed: string;
}

export type AppTheme = MD3Theme & { colors: MD3Theme['colors'] & AppColors };

export const LightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,
    // The single accent. It also means "good / done" (see the RISK register).
    primary: '#1E6B52',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DCEFE7',
    onPrimaryContainer: '#0E3B2D',
    // Secondary and tertiary are neutral ink, so Paper never introduces a second hue.
    secondary: '#3F3F46',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E9E9EC',
    onSecondaryContainer: '#18181B',
    tertiary: '#3F3F46',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E9E9EC',
    onTertiaryContainer: '#18181B',
    background: '#F7F7F8',
    onBackground: '#18181B',
    surface: '#FFFFFF',
    onSurface: '#18181B',
    surfaceVariant: '#EEEEF0',
    onSurfaceVariant: '#4B4B55',
    surfaceDisabled: 'rgba(24, 24, 27, 0.10)',
    onSurfaceDisabled: 'rgba(24, 24, 27, 0.38)',
    outline: '#8E8E99',
    outlineVariant: '#E4E4E7',
    error: '#B42318',
    onError: '#FFFFFF',
    errorContainer: '#FBE5E2',
    onErrorContainer: '#7A1A10',
    inverseSurface: '#27272A',
    inverseOnSurface: '#F4F4F5',
    inversePrimary: '#7FD1B3',
    backdrop: 'rgba(9, 9, 11, 0.45)',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },

    success: '#1E6B52',
    onSuccess: '#FFFFFF',
    successContainer: '#DCEFE7',
    warning: '#8A5A00',
    onWarning: '#FFFFFF',
    warningContainer: '#FBF0D9',
    info: '#3A5A8C',
    infoContainer: '#E6ECF5',
    neutralContainer: '#EEEEF0',
    muted: '#5F5F69',
    screen: '#F7F7F8',
    card: '#FFFFFF',
    border: '#E4E4E7',
    pressed: 'rgba(24, 24, 27, 0.08)',
  },
};

export const DarkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 2,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6FCBA9',
    onPrimary: '#06301F',
    primaryContainer: '#17473A',
    onPrimaryContainer: '#CDEDE0',
    secondary: '#D4D4D8',
    onSecondary: '#18181B',
    secondaryContainer: '#2E2E33',
    onSecondaryContainer: '#F4F4F5',
    tertiary: '#D4D4D8',
    onTertiary: '#18181B',
    tertiaryContainer: '#2E2E33',
    onTertiaryContainer: '#F4F4F5',
    background: '#0E0E10',
    onBackground: '#F4F4F5',
    surface: '#18181B',
    onSurface: '#F4F4F5',
    surfaceVariant: '#232327',
    onSurfaceVariant: '#C4C4CC',
    surfaceDisabled: 'rgba(244, 244, 245, 0.10)',
    onSurfaceDisabled: 'rgba(244, 244, 245, 0.38)',
    outline: '#6B6B76',
    outlineVariant: '#2E2E33',
    error: '#F1867A',
    onError: '#4A0D06',
    errorContainer: '#4A1A14',
    onErrorContainer: '#FBE5E2',
    inverseSurface: '#E4E4E7',
    inverseOnSurface: '#18181B',
    inversePrimary: '#1E6B52',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    elevation: {
      level0: 'transparent',
      level1: '#18181B',
      level2: '#1D1D21',
      level3: '#222226',
      level4: '#26262B',
      level5: '#2A2A2F',
    },

    success: '#6FCBA9',
    onSuccess: '#06301F',
    successContainer: '#17473A',
    warning: '#E8B552',
    onWarning: '#2B1D00',
    warningContainer: '#40300C',
    info: '#9DB7E0',
    infoContainer: '#1F2D45',
    neutralContainer: '#232327',
    muted: '#A1A1AA',
    screen: '#0E0E10',
    card: '#18181B',
    border: '#2E2E33',
    pressed: 'rgba(244, 244, 245, 0.08)',
  },
};

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

/**
 * Status colours. Approved and Allocated share the "in progress" tone and are told
 * apart by icon and label; the accent is reserved for Active.
 */
export function statusColors(colors: AppTheme['colors'], status: StudentStatus) {
  switch (status) {
    case 'PENDING_APPROVAL':
      return { fg: colors.warning, bg: colors.warningContainer };
    case 'APPROVED':
    case 'ALLOCATED':
      return { fg: colors.info, bg: colors.infoContainer };
    case 'ACTIVE':
      return { fg: colors.success, bg: colors.successContainer };
    case 'REJECTED':
      return { fg: colors.error, bg: colors.errorContainer };
  }
}

export const DOCUMENT_META = {
  PHOTO: { icon: 'image-outline', label: 'Photo' },
  ID_PROOF: { icon: 'card-account-details-outline', label: 'ID proof' },
  MARKSHEET: { icon: 'file-document-outline', label: 'Marksheet' },
  OTHER: { icon: 'file-outline', label: 'Other document' },
} as const;

export const CONTENT_META = {
  VIDEO: { icon: 'play-circle-outline', label: 'Video' },
  NOTES: { icon: 'file-document-outline', label: 'Notes' },
  ASSIGNMENT: { icon: 'clipboard-text-outline', label: 'Assignment' },
  IMAGE: { icon: 'image-outline', label: 'Image' },
} as const;
