import React, { createContext, useContext } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { Enter, EnterOrderContext, useCountUp, useFillProgress, usePressScale } from './motion';
import { ProgressRing } from './ProgressRing';
import { InkContext, Txt } from './ui';
import { radius, spacing, type AppTheme, type TypeVariant } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { StudentStatus } from '@/src/types';

/**
 * Bento grid: tiles of different sizes packed into rows, one idea per tile.
 *
 *   <Bento>
 *     <BentoRow>
 *       <Tile span={3}>...</Tile>          wide tile
 *       <BentoCol span={2}>                two small tiles stacked beside it
 *         <StatTile ... />
 *         <StatTile ... />
 *       </BentoCol>
 *     </BentoRow>
 *     <Tile>...</Tile>                     full-width tile
 *   </Bento>
 *
 * Give a screen one dominant tile and vary the spans; a grid of equal tiles is a table.
 * Tiles enter in reading order (row by row, left to right) when the screen opens.
 */

const GAP = spacing.md;
/** Entrance delay between cells of one row, as a fraction of a row step. */
const CELL_STEP = 0.6;

type Axis = 'row' | 'col' | null;
const AxisContext = createContext<Axis>(null);

/** Hands each child its place in the entrance order. */
function ordered(children: React.ReactNode, base: number, step: number) {
  return React.Children.toArray(children).map((child, index) => (
    <EnterOrderContext.Provider key={index} value={base + index * step}>
      {child}
    </EnterOrderContext.Provider>
  ));
}

export function Bento({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const base = useContext(EnterOrderContext);
  return (
    <AxisContext.Provider value={null}>
      <View style={[styles.grid, style]}>{ordered(children, base, 1)}</View>
    </AxisContext.Provider>
  );
}

/** Number of entrance steps a Bento takes up, so the content after it follows on. */
export function bentoSteps(children: React.ReactNode) {
  return React.Children.toArray(children).length;
}

/** Cells side by side, sharing the width by `span` and stretched to the same height. */
export function BentoRow({ children }: { children: React.ReactNode }) {
  const base = useContext(EnterOrderContext);
  return (
    <AxisContext.Provider value="row">
      <View style={styles.row}>{ordered(children, base, CELL_STEP)}</View>
    </AxisContext.Provider>
  );
}

/** Tiles stacked inside a row, next to a taller tile. */
export function BentoCol({ span = 1, children }: { span?: number; children: React.ReactNode }) {
  const base = useContext(EnterOrderContext);
  return (
    <AxisContext.Provider value="col">
      <View style={[styles.col, { flex: span }]}>{ordered(children, base, CELL_STEP)}</View>
    </AxisContext.Provider>
  );
}

/* ------------------------------------------------------------------ Tile */

export type TileTone = 'card' | 'solid' | 'primary' | 'info' | 'warning' | 'error' | 'neutral';

/** Surface, border and accent colour for each tile tone. */
export function tileColors(colors: AppTheme['colors'], tone: TileTone) {
  switch (tone) {
    case 'solid':
      return { bg: colors.primary, border: colors.primary, accent: colors.onPrimary };
    case 'primary':
      return { bg: colors.primaryContainer, border: colors.primaryContainer, accent: colors.primary };
    case 'info':
      return { bg: colors.infoContainer, border: colors.infoContainer, accent: colors.info };
    case 'warning':
      return { bg: colors.warningContainer, border: colors.warningContainer, accent: colors.warning };
    case 'error':
      return { bg: colors.errorContainer, border: colors.errorContainer, accent: colors.error };
    case 'neutral':
      return { bg: colors.neutralContainer, border: colors.neutralContainer, accent: colors.onSurfaceVariant };
    case 'card':
      return { bg: colors.card, border: colors.border, accent: colors.primary };
  }
}

/** Tile tone for a point in the approval lifecycle (same mapping as `statusColors`). */
export function statusTone(status: StudentStatus): TileTone {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'APPROVED':
    case 'ALLOCATED':
      return 'info';
    case 'ACTIVE':
      return 'primary';
    case 'REJECTED':
      return 'error';
  }
}

/**
 * One bento cell. With `onPress` it is a button: it shrinks slightly under the finger,
 * springs back, and shows an arrow in the corner when `pushes` is set.
 */
export function Tile({
  span = 1,
  tone = 'card',
  onPress,
  pushes,
  accessibilityLabel,
  style,
  children,
}: {
  /** Share of the row's width (or of the column's height) this tile takes. */
  span?: number;
  tone?: TileTone;
  onPress?: () => void;
  /** Tapping pushes a screen or switches tab: draws the corner arrow. */
  pushes?: boolean;
  accessibilityLabel?: string;
  /** Style of the padded content box. */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const axis = useContext(AxisContext);
  const press = usePressScale();
  const t = tileColors(colors, tone);

  const outer: ViewStyle | undefined =
    axis === 'row' ? { flex: span } : axis === 'col' ? { flexGrow: span } : undefined;
  const ink =
    tone === 'solid' ? { fg: colors.onPrimary, muted: colors.onPrimary } : null;

  const arrow = pushes && (
    <View style={styles.arrow}>
      <Icon source="arrow-top-right" size={18} color={tone === 'card' ? colors.muted : t.accent} />
    </View>
  );

  return (
    <Enter pop style={outer}>
      <Animated.View
        style={[
          styles.tile,
          { backgroundColor: t.bg, borderColor: t.border },
          axis !== null && styles.fill,
          press.style,
        ]}
      >
        {/* Nested rows and tiles start a fresh layout; they are not cells of this row. */}
        <AxisContext.Provider value={null}>
          <InkContext.Provider value={ink}>
            {onPress ? (
              <Pressable
                onPress={onPress}
                {...press.handlers}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                android_ripple={{ color: colors.pressed }}
                style={({ pressed }) => [
                  styles.content,
                  style,
                  pressed && Platform.OS !== 'android' && { backgroundColor: colors.pressed },
                ]}
              >
                {children}
                {arrow}
              </Pressable>
            ) : (
              <View
                style={[styles.content, style]}
                accessible={!!accessibilityLabel}
                accessibilityLabel={accessibilityLabel}
              >
                {children}
              </View>
            )}
          </InkContext.Provider>
        </AxisContext.Provider>
      </Animated.View>
    </Enter>
  );
}

/* ----------------------------------------------------------- Tile content */

/** A whole number that counts up from zero each time the screen is opened. */
export function CountUp({
  value,
  v = 'title',
  color,
}: {
  value: number;
  v?: TypeVariant;
  color?: string;
}) {
  const fill = useFillProgress();
  const shown = useCountUp(value, fill);
  return (
    <Txt v={v} color={color} chrome style={styles.number} importantForAccessibility="no">
      {shown}
    </Txt>
  );
}

/** Tile for one count: glyph, a number that counts up, and what it counts. */
export function StatTile({
  icon,
  value,
  label,
  span,
  tone = 'card',
  onPress,
}: {
  icon: string;
  value: number;
  label: string;
  span?: number;
  tone?: TileTone;
  /** Tapping opens the list behind the number. */
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const t = tileColors(colors, tone);
  return (
    <Tile
      span={span}
      tone={tone}
      onPress={onPress}
      pushes={!!onPress}
      accessibilityLabel={`${label}, ${value}`}
      style={styles.stat}
    >
      <Icon source={icon} size={22} color={t.accent} />
      <View>
        <CountUp value={value} />
        <Txt v="caption" muted numberOfLines={2}>
          {label}
        </Txt>
      </View>
    </Tile>
  );
}

/** Tile for one labelled fact (a date, a room, a fee). */
export function FactTile({
  icon,
  label,
  value,
  span,
  tone = 'card',
}: {
  icon: string;
  label: string;
  value?: string | number | null;
  span?: number;
  tone?: TileTone;
}) {
  const { colors } = useAppTheme();
  const t = tileColors(colors, tone);
  const empty = value === null || value === undefined || value === '';
  return (
    <Tile
      span={span}
      tone={tone}
      accessibilityLabel={`${label}, ${empty ? 'not provided' : value}`}
      style={styles.fact}
    >
      <Icon source={icon} size={20} color={tone === 'card' ? colors.muted : t.accent} />
      <View style={styles.factBody}>
        <Txt v="caption" muted numberOfLines={1}>
          {label}
        </Txt>
        <Txt v={empty ? 'body' : 'bodyStrong'} muted={empty} numberOfLines={2}>
          {empty ? 'Not provided' : String(value)}
        </Txt>
      </View>
    </Tile>
  );
}

/**
 * The lead tile of a screen that tracks progress: the ring on the left, and the title
 * with its supporting lines on the right.
 */
export function RingHero({
  value,
  overline,
  title,
  body,
  caption,
  tone = 'primary',
  ringColor,
  accessibilityLabel,
}: {
  /** 0 to 1. */
  value: number;
  overline?: string;
  title: string;
  body?: string;
  caption?: string;
  tone?: TileTone;
  ringColor?: string;
  accessibilityLabel?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Tile tone={tone} style={styles.hero}>
      <ProgressRing
        value={value}
        size={96}
        color={ringColor}
        // On a tinted tile the track is the card colour, so it reads as a cut-out.
        trackColor={tone === 'card' ? undefined : colors.card}
        accessibilityLabel={accessibilityLabel}
      />
      <View style={styles.heroBody}>
        {!!overline && (
          <Txt v="label" muted>
            {overline}
          </Txt>
        )}
        <Txt v="title" accessibilityRole="header">
          {title}
        </Txt>
        {!!body && <Txt muted>{body}</Txt>}
        {!!caption && (
          <Txt v="caption" color={ringColor} muted={!ringColor}>
            {caption}
          </Txt>
        )}
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroBody: { flex: 1, gap: spacing.xs },
  grid: { gap: GAP },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: GAP },
  col: { gap: GAP },
  tile: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.xs },
  arrow: { position: 'absolute', top: spacing.md, right: spacing.md, pointerEvents: 'none' },
  number: { fontVariant: ['tabular-nums'] },
  stat: { justifyContent: 'space-between', gap: spacing.md },
  fact: { gap: spacing.sm },
  factBody: { gap: 2 },
});
