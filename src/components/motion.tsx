import React, { createContext, useContext, useEffect, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
// expo-router bundles its own React Navigation; its contexts are the ones that are populated.
import { NavigationContext, NavigationRouteContext } from 'expo-router/react-navigation';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/**
 * Motion vocabulary. Everything here runs on the UI thread and follows the system
 * "reduce motion" setting (Reanimated jumps straight to the end state).
 *
 * - Entrance: a screen's blocks rise and fade in, staggered top to bottom.
 * - Fill: rings and counters ease from zero to their value.
 * - Press: tiles and tab buttons shrink slightly under the finger and spring back.
 */

/**
 * Springs. `slide` has a touch of overshoot for the tab indicator; `press` is tighter;
 * `motif` is looser and bouncier, for the tab icon landing in the header art.
 */
export const springs = {
  slide: { mass: 1, stiffness: 220, damping: 22 },
  press: { mass: 1, stiffness: 420, damping: 28 },
  motif: { mass: 1, stiffness: 170, damping: 13 },
} as const;

const STAGGER = 55;
const ITEM = 420;
/** Blocks past this index come in together, so a long screen never keeps you waiting. */
const MAX_STAGGER = 9;
const ENTRANCE_TOTAL = MAX_STAGGER * STAGGER + ITEM;

/** How long a pushed screen takes to cover this one; rings rewind only after that. */
const COVERED_AFTER = 450;

const PROFILES = {
  /** Linear clock; each block eases its own slice of it. */
  entrance: { duration: ENTRANCE_TOTAL, delay: 0, easing: Easing.linear, replayOnReturn: false },
  /** Starts slow, lands soft. Replays every time the screen is opened. */
  fill: { duration: 1100, delay: 200, easing: Easing.inOut(Easing.cubic), replayOnReturn: true },
} as const;

/**
 * A 0 -> 1 value that plays when the screen comes into view.
 *
 * It rewinds while the screen is hidden behind another tab, so it replays on the next
 * visit without a flash of the finished state. `fill` also rewinds once a pushed screen
 * has covered this one, so it replays on the way back; `entrance` does not, because
 * the content was on screen the whole time the detail slid away.
 */
function useFocusProgress(kind: keyof typeof PROFILES): SharedValue<number> {
  const progress = useSharedValue(0);
  const navigation = useContext(NavigationContext);
  const routeKey = useContext(NavigationRouteContext)?.key;

  useEffect(() => {
    const { duration, delay, easing, replayOnReturn } = PROFILES[kind];
    let armed = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const play = () => {
      clearTimeout(timer);
      timer = undefined;
      if (!armed) return;
      armed = false;
      progress.set(withDelay(delay, withTiming(1, { duration, easing })));
    };
    const rewind = () => {
      armed = true;
      cancelAnimation(progress);
      progress.set(0);
    };

    // Outside a navigator (inside a Paper portal, for instance): play once.
    if (!navigation) {
      play();
      return;
    }

    if (navigation.isFocused()) play();
    const offFocus = navigation.addListener('focus', play);
    const offBlur = navigation.addListener('blur', () => {
      const state = navigation.getState();
      const behindAnotherTab = state?.type === 'tab' && state.routes[state.index]?.key !== routeKey;
      if (behindAnotherTab) rewind();
      else if (replayOnReturn) timer = setTimeout(rewind, COVERED_AFTER);
    });

    return () => {
      offFocus();
      offBlur();
      clearTimeout(timer);
    };
  }, [kind, navigation, routeKey, progress]);

  return progress;
}

/* -------------------------------------------------------------- Entrance */

const EntranceContext = createContext<SharedValue<number> | null>(null);

/**
 * Position of a block in its screen's entrance order. Screen sets it for each top-level
 * child; Bento refines it per row and per cell.
 */
export const EnterOrderContext = createContext(0);

/** Owns the entrance clock for one screen. Rendered by Screen and GroupedList. */
export function EntranceProvider({ children }: { children: React.ReactNode }) {
  const progress = useFocusProgress('entrance');
  return <EntranceContext.Provider value={progress}>{children}</EntranceContext.Provider>;
}

/**
 * One block of a screen's entrance: fades in and rises into place, `order` steps after
 * the first block. `pop` adds a slight scale-up, used by bento tiles. Outside an
 * EntranceProvider it renders its children as they are, and so does an Enter nested in
 * another one: the outer block already carries the motion.
 */
export function Enter({
  order,
  pop,
  style,
  children,
}: {
  order?: number;
  pop?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const progress = useContext(EntranceContext);
  const inherited = useContext(EnterOrderContext);
  const start = Math.min(order ?? inherited, MAX_STAGGER) * STAGGER;

  const animated = useAnimatedStyle(() => {
    if (!progress) return {};
    const local = Math.min(1, Math.max(0, (progress.get() * ENTRANCE_TOTAL - start) / ITEM));
    const eased = 1 - Math.pow(1 - local, 3);
    return {
      opacity: eased,
      transform: [{ translateY: (1 - eased) * 18 }, { scale: pop ? 0.94 + 0.06 * eased : 1 }],
    };
  });

  return (
    <Animated.View style={[style, animated]}>
      <EntranceContext.Provider value={null}>{children}</EntranceContext.Provider>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ Fill */

/** 0 -> 1 with an ease-in-out curve, replayed every time the screen is opened. */
export function useFillProgress() {
  return useFocusProgress('fill');
}

/**
 * A whole number that counts up to `target` as `progress` runs 0 -> 1. Only the
 * component calling this re-renders, and only when the visible number changes.
 */
export function useCountUp(target: number, progress: SharedValue<number>) {
  const [shown, setShown] = useState(0);
  useAnimatedReaction(
    () => Math.round(target * progress.get()),
    (now, before) => {
      if (now !== before) scheduleOnRN(setShown, now);
    },
    [target],
  );
  return shown;
}

/* ----------------------------------------------------------------- Press */

/** Spring press feedback: spread `handlers` on a Pressable, `style` on an Animated.View. */
export function usePressScale(to = 0.97) {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - to) * pressed.get() }],
  }));
  const handlers = {
    onPressIn: () => pressed.set(withSpring(1, springs.press)),
    onPressOut: () => pressed.set(withSpring(0, springs.press)),
  };
  return { style, handlers };
}
