import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useFillProgress } from './motion';
import { Txt } from './ui';
import { useAppTheme } from '@/src/theme/useAppTheme';
import type { TypeVariant } from '@/src/theme/theme';

/**
 * Circular progress with the number in the centre. The arc eases from zero to `value`
 * and the number counts up with it, every time the screen is opened; a change to
 * `value` while the screen is open animates from where the arc already is.
 *
 * Drawn with plain views (two rotating half rings behind half-width masks, plus round
 * caps), so it needs no SVG dependency and animates on the UI thread.
 */
export function ProgressRing({
  value,
  size = 96,
  stroke,
  color,
  trackColor,
  label,
  caption,
  accessibilityLabel,
  style,
}: {
  /** 0 to 1. */
  value: number;
  /** Outer diameter. Use an even number so the two halves meet on a pixel. */
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  /** Fixed centre text (for example "2/5") instead of the animated percentage. */
  label?: string;
  /** Small line under the number. Only fits on rings of 96pt and up. */
  caption?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const target = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const width = stroke ?? Math.max(4, Math.round(size / 9));
  const half = size / 2;
  const ink = color ?? colors.primary;
  const track = trackColor ?? colors.neutralContainer;

  // `fill` replays on every visit; `level` follows the data while the screen is open.
  const fill = useFillProgress();
  const level = useSharedValue(target);
  useEffect(() => {
    level.set(withTiming(target, { duration: 500, easing: Easing.inOut(Easing.cubic) }));
  }, [target, level]);
  const shown = useDerivedValue(() => fill.get() * level.get());

  const [percent, setPercent] = useState(0);
  useAnimatedReaction(
    () => Math.round(shown.get() * 100),
    (now, before) => {
      if (now !== before) scheduleOnRN(setPercent, now);
    },
  );

  // First half of the turn is revealed on the right, the second half on the left.
  const firstHalf = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.min(shown.get(), 0.5) * 360}deg` }],
  }));
  const secondHalf = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.max(shown.get() - 0.5, 0) * 360}deg` }],
  }));
  const endCap = useAnimatedStyle(() => ({
    opacity: shown.get() > 0.004 ? 1 : 0,
    transform: [{ rotate: `${shown.get() * 360}deg` }],
  }));
  const startCap = useAnimatedStyle(() => ({ opacity: shown.get() > 0.004 ? 1 : 0 }));

  const box = { width: size, height: size };
  const circle = { ...box, borderRadius: half, borderWidth: width };
  const cap = {
    left: half - width / 2,
    width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: ink,
  };

  const numberVariant: TypeVariant = size >= 128 ? 'display' : size >= 84 ? 'title' : 'label';
  const big = size >= 84;

  return (
    <View
      style={[box, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={
        label ? { text: label } : { min: 0, max: 100, now: Math.round(target * 100) }
      }
    >
      <View style={[styles.layer, circle, { borderColor: track }]} />

      <View style={[styles.layer, styles.mask, { left: half, width: half, height: size }]}>
        <Animated.View style={[styles.layer, box, { left: -half }, firstHalf]}>
          <View style={[styles.layer, styles.mask, { width: half, height: size }]}>
            <View style={[circle, { borderColor: ink }]} />
          </View>
        </Animated.View>
      </View>

      <View style={[styles.layer, styles.mask, { width: half, height: size }]}>
        <Animated.View style={[styles.layer, box, secondHalf]}>
          <View style={[styles.layer, styles.mask, { left: half, width: half, height: size }]}>
            <View style={[styles.layer, circle, { left: -half, borderColor: ink }]} />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.layer, cap, startCap]} />
      <Animated.View style={[styles.layer, box, endCap]}>
        <View style={[styles.layer, cap]} />
      </Animated.View>

      <View style={[styles.layer, styles.centre, box]} importantForAccessibility="no-hide-descendants">
        {label ? (
          <Txt v={big ? 'heading' : 'label'} chrome style={styles.number}>
            {label}
          </Txt>
        ) : big ? (
          <View style={styles.percent}>
            <Txt v={numberVariant} chrome style={styles.number}>
              {percent}
            </Txt>
            <Txt v="label" muted chrome style={styles.sign}>
              %
            </Txt>
          </View>
        ) : (
          <Txt v="label" chrome style={styles.number}>
            {percent}%
          </Txt>
        )}
        {!!caption && size >= 96 && (
          <Txt v="caption" muted chrome numberOfLines={1}>
            {caption}
          </Txt>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0 },
  mask: { overflow: 'hidden' },
  centre: { alignItems: 'center', justifyContent: 'center' },
  percent: { flexDirection: 'row', alignItems: 'baseline' },
  number: { fontVariant: ['tabular-nums'] },
  sign: { marginLeft: 1 },
});
