import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { Button, Icon, Searchbar } from 'react-native-paper';
import { CHROME_FONT_SCALE, radius, spacing, type, type TypeVariant } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { initials } from '@/src/utils/format';

/* ------------------------------------------------------------------- Txt */

/**
 * Text colours for content sitting on a filled surface (a solid bento tile). Txt picks
 * them up by default, so the same content works on any tile tone.
 */
export const InkContext = React.createContext<{ fg: string; muted: string } | null>(null);

/**
 * Text on the type scale. `chrome` bounds Dynamic Type for text inside fixed-size
 * controls (chips, bars); body text scales freely.
 */
export function Txt({
  v = 'body',
  muted,
  color,
  chrome,
  style,
  ...rest
}: TextProps & { v?: TypeVariant; muted?: boolean; color?: string; chrome?: boolean }) {
  const { colors } = useAppTheme();
  const ink = React.useContext(InkContext);
  const fallback = muted ? (ink?.muted ?? colors.muted) : (ink?.fg ?? colors.onSurface);
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={chrome ? CHROME_FONT_SCALE : rest.maxFontSizeMultiplier}
      style={[type[v], { color: color ?? fallback }, style]}
    />
  );
}

/* ------------------------------------------------------------- Touchable */

/** Press feedback primitive: bounded ripple on Android, highlight elsewhere. */
export function Touchable({
  style,
  children,
  accessibilityRole = 'button',
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      {...rest}
      accessibilityRole={accessibilityRole}
      android_ripple={{ color: colors.pressed }}
      style={({ pressed }) => [
        style,
        pressed && Platform.OS !== 'android' && { backgroundColor: colors.pressed },
      ]}
    >
      {children}
    </Pressable>
  );
}

/* ----------------------------------------------------------------- Group */

/**
 * Grouped-list section: one flat surface with hairlines between its children, with the
 * same corner radius as a bento tile so lists and tiles read as one system.
 */
export function Group({
  children,
  style,
  separatorInset = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Left inset of the hairlines; pass AVATAR_INSET for rows that lead with an avatar. */
  separatorInset?: boolean | number;
}) {
  const { colors } = useAppTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Separator inset={separatorInset} />}
          {child}
        </React.Fragment>
      ))}
    </View>
  );
}

/** Hairline. `inset` true = screen padding; a number = custom left inset (e.g. past an avatar). */
export function Separator({ inset }: { inset?: boolean | number }) {
  const { colors } = useAppTheme();
  const marginLeft = inset === true ? spacing.lg : typeof inset === 'number' ? inset : 0;
  return <View style={[styles.separator, { backgroundColor: colors.border, marginLeft }]} />;
}

/** Plain padded block inside a Group, for content that isn't a row (timeline, progress). */
export function GroupBody({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.groupBody, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ Lead */

/**
 * Top block of a screen's content: the full title the native header is too narrow
 * for, a supporting line, and optional extras (chip, progress).
 */
export function Lead({
  title,
  body,
  overline,
  children,
}: {
  title: string;
  body?: string;
  overline?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.lead}>
      {!!overline && (
        <Txt v="label" muted>
          {overline}
        </Txt>
      )}
      <Txt v="title" accessibilityRole="header">
        {title}
      </Txt>
      {!!body && <Txt muted>{body}</Txt>}
      {children}
    </View>
  );
}

/* --------------------------------------------------------- SectionHeader */

export function SectionHeader({
  title,
  action,
  first,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  /** First section on a screen: no extra space above. */
  first?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.sectionHeader, first && { marginTop: 0 }]}>
      <Txt v="label" muted style={{ flex: 1 }} accessibilityRole="header">
        {title}
      </Txt>
      {!!action && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          hitSlop={14}
          android_ripple={{ color: colors.pressed, borderless: true }}
          style={({ pressed }) => pressed && Platform.OS !== 'android' && { opacity: 0.5 }}
        >
          <Txt v="label" color={colors.primary}>
            {action.label}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------- Row */

/**
 * List row. `pushes` draws the chevron and must only be set when tapping the row
 * pushes a screen; a row can be pressable without pushing.
 */
export function Row({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  onPress,
  pushes,
  destructive,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  pushes?: boolean;
  destructive?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors } = useAppTheme();
  const body = (
    <>
      {leading}
      <View style={styles.rowBody}>
        <Txt v="bodyStrong" color={destructive ? colors.error : undefined} numberOfLines={1}>
          {title}
        </Txt>
        {!!subtitle && (
          <Txt v="caption" muted numberOfLines={1}>
            {subtitle}
          </Txt>
        )}
        {!!meta && (
          <Txt v="caption" muted numberOfLines={1}>
            {meta}
          </Txt>
        )}
      </View>
      {trailing}
      {pushes && <Icon source="chevron-right" size={20} color={colors.muted} />}
    </>
  );

  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Touchable onPress={onPress} style={styles.row} accessibilityLabel={accessibilityLabel ?? title}>
      {body}
    </Touchable>
  );
}

/* ---------------------------------------------------------------- InfoRow */

export function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <View style={styles.infoRow}>
      <Txt muted style={styles.infoLabel}>
        {label}
      </Txt>
      <Txt v={empty ? 'body' : 'bodyStrong'} muted={empty} style={styles.infoValue} numberOfLines={3}>
        {empty ? 'Not provided' : String(value)}
      </Txt>
    </View>
  );
}

/* ----------------------------------------------------------------- Avatar */

/** Separator inset that lines hairlines up with row text after a 40pt avatar. */
export const AVATAR_INSET = spacing.lg + 40 + spacing.md;

/** The app's one avatar style: initials on a neutral surface. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, backgroundColor: colors.neutralContainer },
      ]}
    >
      <Txt v={size >= 56 ? 'heading' : 'label'} color={colors.onSurfaceVariant} chrome>
        {initials(name)}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------- EmptyState */

/**
 * Zero state for a data surface. Centred on purpose (the one place that is correct).
 * Pass the action that fixes it: populate, clear filters, or retry.
 */
export function EmptyState({
  icon = 'inbox-outline',
  title,
  body,
  action,
  fill = true,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
  /** Take the remaining height and centre vertically. */
  fill?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.empty, fill && styles.emptyFill]}>
      <Icon source={icon} size={48} color={colors.muted} />
      <Txt v="heading" style={styles.emptyTitle}>
        {title}
      </Txt>
      {!!body && (
        <Txt muted style={styles.emptyBody}>
          {body}
        </Txt>
      )}
      {!!action && (
        <Button mode="outlined" onPress={action.onPress} style={styles.emptyAction}>
          {action.label}
        </Button>
      )}
    </View>
  );
}

/* ----------------------------------------------------------------- Notice */

type NoticeTone = 'neutral' | 'info' | 'warning' | 'error';

/** Inline message on a tinted background. */
export function Notice({
  icon,
  tone = 'neutral',
  title,
  message,
  action,
  style,
}: {
  icon: string;
  tone?: NoticeTone;
  title?: string;
  message?: string;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const tones: Record<NoticeTone, { fg: string; bg: string }> = {
    neutral: { fg: colors.onSurfaceVariant, bg: colors.neutralContainer },
    info: { fg: colors.info, bg: colors.infoContainer },
    warning: { fg: colors.warning, bg: colors.warningContainer },
    error: { fg: colors.error, bg: colors.errorContainer },
  };
  const t = tones[tone];

  return (
    <View style={[styles.notice, { backgroundColor: t.bg }, style]}>
      <Icon source={icon} size={20} color={t.fg} />
      <View style={styles.noticeBody}>
        {!!title && (
          <Txt v="bodyStrong" color={t.fg}>
            {title}
          </Txt>
        )}
        {!!message && (
          <Txt v="caption" color={t.fg}>
            {message}
          </Txt>
        )}
      </View>
      {!!action && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          hitSlop={14}
          android_ripple={{ color: colors.pressed, borderless: true }}
          style={({ pressed }) => pressed && Platform.OS !== 'android' && { opacity: 0.5 }}
        >
          <Txt v="label" color={t.fg}>
            {action.label}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------ FilterChips */

/** Horizontally scrolling single-select chips. */
export function FilterChips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (key: T) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
      style={styles.chipScroll}
    >
      {items.map((item) => {
        const active = item.key === value;
        const fg = active ? colors.screen : colors.onSurfaceVariant;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.count === undefined ? item.label : `${item.label}, ${item.count}`}
            // 36pt visual height + slop = 44pt target.
            hitSlop={{ top: 4, bottom: 4 }}
            android_ripple={{ color: colors.pressed }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? colors.onSurface : colors.card,
                borderColor: active ? colors.onSurface : colors.border,
              },
              pressed && Platform.OS !== 'android' && { opacity: 0.6 },
            ]}
          >
            <Txt v="label" color={fg} chrome>
              {item.label}
            </Txt>
            {item.count !== undefined && (
              <Txt v="label" color={fg} chrome style={styles.chipCount}>
                {item.count}
              </Txt>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------ SearchField */

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      icon="magnify"
      elevation={0}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}
      inputStyle={styles.searchInput}
      placeholderTextColor={colors.muted}
      iconColor={colors.muted}
    />
  );
}

/* -------------------------------------------------------------- Skeletons */

/** One shared opacity loop for every placeholder block (native driver, UI thread). */
function usePulse() {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [pulse]);
  return pulse;
}

function Bone({ width, height = 12 }: { width: ViewStyle['width']; height?: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ width, height, borderRadius: radius.sm, backgroundColor: colors.neutralContainer }} />
  );
}

/** Loading placeholder that mirrors a list of rows. */
export function SkeletonList({ rows = 7, avatar = true }: { rows?: number; avatar?: boolean }) {
  const { colors } = useAppTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={{ opacity: pulse }}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          {avatar && <View style={[styles.avatar, styles.boneAvatar, { backgroundColor: colors.neutralContainer }]} />}
          <View style={[styles.rowBody, { gap: spacing.sm }]}>
            <Bone width={i % 2 ? '55%' : '70%'} height={14} />
            <Bone width={i % 2 ? '80%' : '45%'} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

/** Loading placeholder that mirrors a detail screen: a lead block and two groups. */
export function SkeletonDetail() {
  const { colors } = useAppTheme();
  const pulse = usePulse();
  return (
    <Animated.View
      style={[styles.skeletonDetail, { opacity: pulse }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Bone width="60%" height={22} />
      <Bone width="40%" />
      {[0, 1].map((g) => (
        <View
          key={g}
          style={[styles.group, styles.skeletonGroup, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {[0, 1, 2].map((r) => (
            <View key={r} style={styles.skeletonLine}>
              <Bone width="30%" />
              <Bone width="35%" />
            </View>
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  separator: { height: StyleSheet.hairlineWidth },
  groupBody: { padding: spacing.lg, gap: spacing.sm },
  lead: { gap: spacing.xs, paddingHorizontal: spacing.xs, paddingTop: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  infoLabel: { flex: 1 },
  infoValue: { flex: 1.5, textAlign: 'right' },
  avatar: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  boneAvatar: { width: 40, height: 40 },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    maxWidth: 400,
    alignSelf: 'center',
  },
  emptyFill: { flex: 1, justifyContent: 'center' },
  emptyTitle: { marginTop: spacing.md, textAlign: 'center' },
  emptyBody: { marginTop: spacing.xs, textAlign: 'center' },
  emptyAction: { marginTop: spacing.lg },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  noticeBody: { flex: 1, gap: 2 },
  chipScroll: { flexGrow: 0 },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  chipCount: { opacity: 0.7 },
  search: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
  },
  searchInput: { ...type.body, minHeight: 0 },
  skeletonDetail: { padding: spacing.lg, gap: spacing.md },
  skeletonGroup: { marginTop: spacing.md },
  skeletonLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
});
