import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,

  withSpring,
  withTiming,
} from 'react-native-reanimated';
// expo-router bundles its own React Navigation; its contexts are the ones that are populated.
import { NavigationContext } from 'expo-router/react-navigation';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { springs } from '../motion';

/** Glyph size, and the box the motif is laid out in (the inner orbit ring is r = 46). */
const SIZE = 60;
const BOX = 92;
/** The icon reads as line art: the same weight as the rings, not as a button. */
const INK = 0.55;
/** Resting tilt, matching the slant of the rest of the art. */
const TILT = -12;

/**
 * The glyph the header art shows right now. Every tab root has its own header, so this
 * is shared between them: a header that gains focus animates from whatever the last
 * one showed.
 */
let shown: string | null = null;

/**
 * The active tab's icon as the header motif, in the middle of HeaderArt's orbit rings.
 *
 * When its tab gains focus, the previous tab's icon spins away and fades out while
 * this one springs in from a tilt, and a ring ripples out to the inner orbit. Coming
 * back to the same tab (from a pushed screen, say) does not replay it. Runs on the UI
 * thread; with "reduce motion" on, Reanimated jumps straight to the end state.
 */
export function TabMotif({ glyph, cx, cy }: { glyph: string; cx: number; cy: number }) {
  const { colors } = useAppTheme();
  const navigation = useContext(NavigationContext);
  const [outgoing, setOutgoing] = useState<string | null>(null);

  // 0 -> 1 per transition. `enter` is a spring, so it overshoots 1 a little.
  const enter = useSharedValue(0);
  const leave = useSharedValue(1);
  const ripple = useSharedValue(1);
  // Whether this header has shown its glyph yet. The effect below re-runs whenever the
  // navigation object changes identity (every navigation state change), and that
  // re-run must not cut short a transition that is still playing.
  const started = useRef(false);
  const dbgId = useRef(Math.random().toString(36).slice(2, 6));
  const dbgBox = useRef<View>(null);

  useEffect(() => {
    console.log('[motif] effect mount', dbgId.current, glyph);
    return () => console.log('[motif] effect cleanup', dbgId.current, glyph);
  });

  useEffect(() => {
    const play = () => {
      const previous = shown;
      const node = dbgBox.current as unknown as HTMLElement | null;
      console.log('[motif] play', dbgId.current, glyph, 'previous', previous, 'started', started.current, 'connected', node?.isConnected, 'visible', node?.checkVisibility?.());
      shown = glyph;
      if (previous === glyph) {
        // Same icon already on show (back from a pushed screen, or a re-run): just make
        // sure a freshly mounted header isn't left blank.
        if (!started.current) enter.set(1);
        started.current = true;
        return;
      }
      started.current = true;
      setOutgoing(previous);
      // Jump to the start pose, then animate from there.
      enter.set(0);
      leave.set(0);
      ripple.set(0);
      enter.set(withSpring(1, springs.motif));
      leave.set(withTiming(1, { duration: 280, easing: Easing.in(Easing.cubic) }));
      ripple.set(withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
    };

    if (!navigation) {
      play();
      return;
    }
    if (navigation.isFocused()) play();
    return navigation.addListener('focus', play);
  }, [glyph, navigation, enter, leave, ripple]);

  console.log('[motif] render', dbgId.current, glyph, 'outgoing', outgoing);
  const incoming = useAnimatedStyle(() => {
    const p = enter.get();
    return {
      opacity: INK * Math.min(1, Math.max(0, p)),
      transform: [{ rotate: `${TILT - 70 * (1 - p)}deg` }, { scale: 0.35 + 0.65 * p }],
    };
  });

  const leaving = useAnimatedStyle(() => {
    const q = leave.get();
    return {
      opacity: INK * (1 - q),
      transform: [{ rotate: `${TILT + 60 * q}deg` }, { scale: 1 - 0.55 * q }],
    };
  });

  const pulse = useAnimatedStyle(() => {
    const r = ripple.get();
    return {
      opacity: 0.6 * (1 - r),
      transform: [{ scale: 0.45 + 0.55 * r }],
    };
  });

  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      ref={dbgBox}
      style={[styles.box, { left: cx - BOX / 2, top: cy - BOX / 2 }]}
    >
      <Animated.View style={[styles.ripple, { borderColor: colors.headerArt }, pulse]} />
      {outgoing && (
        <Animated.View style={[styles.glyph, leaving]}>
          <Icon source={outgoing} size={SIZE} color={colors.headerArt} />
        </Animated.View>
      )}
      <Animated.View style={[styles.glyph, incoming]}>
        <Icon source={glyph} size={SIZE} color={colors.headerArt} />
      </Animated.View>
    </View>
  );
}

const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  box: { position: 'absolute', width: BOX, height: BOX },
  glyph: { ...fill, alignItems: 'center', justifyContent: 'center' },
  ripple: { ...fill, borderRadius: BOX / 2, borderWidth: 1.5 },
});
