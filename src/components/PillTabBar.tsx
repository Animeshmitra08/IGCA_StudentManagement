import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { springs } from './motion';
import { Txt } from './ui';
import { elevation, radius, spacing, tabBar, type AppTheme } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { haptic } from '@/src/utils/feedback';

/**
 * Floating pill tab bar. Every tab is a pill button; the active one widens to show its
 * label, and one accent pill slides between them on a spring.
 *
 * Micro-interactions: the button shrinks under the finger, the glyph swaps from outline
 * to filled with a small pop, the label unrolls beside it, a selection haptic fires on
 * a change of tab, and the bar slides away while the keyboard is open.
 *
 * Pass it to a tab navigator: `<Tabs tabBar={(props) => <PillTabBar {...props} />}>`.
 */

/** Space between the bar's edge and its buttons. */
const INSET = 6;
const ICON = 24;
const LABEL_GAP = 6;
/** Padding on each side of an active button's icon + label. */
const BUTTON_PAD = 14;
/** How much wider the active button is than an idle one. */
const ACTIVE_RATIO = 2.1;
const MAX_WIDTH = 520;

export function PillTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);

  const count = state.routes.length;
  const track = Math.max(0, width - (INSET + StyleSheet.hairlineWidth) * 2);
  const idle = track / (count - 1 + ACTIVE_RATIO);
  const active = idle * ACTIVE_RATIO;

  // Fractional tab index: the indicator, button widths, icons and labels all read it.
  const position = useSharedValue(state.index);
  useEffect(() => {
    position.set(withSpring(state.index, springs.slide));
  }, [state.index, position]);

  const tucked = useSharedValue(0);
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => tucked.set(withTiming(1, { duration: 160 })),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => tucked.set(withTiming(0, { duration: 220 })),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [tucked]);

  const bottom = insets.bottom + tabBar.gap;
  const barStyle = useAnimatedStyle(() => ({
    opacity: 1 - tucked.get(),
    transform: [{ translateY: tucked.get() * (tabBar.height + bottom) }],
  }));
  const indicatorStyle = useAnimatedStyle(() => ({
    width: active,
    transform: [{ translateX: position.get() * idle }],
  }));

  return (
    <View style={[styles.dock, { paddingBottom: bottom }]}>
      <Animated.View
        style={[
          styles.bar,
          elevation.floating,
          { backgroundColor: colors.card, borderColor: colors.border },
          barStyle,
        ]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.track} accessibilityRole="tablist">
          {width > 0 && (
            <Animated.View
              style={[styles.indicator, { backgroundColor: colors.primary }, indicatorStyle]}
            />
          )}

          {width > 0 &&
            state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;
              const title =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : (options.title ?? route.name);

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptic.select();
                  navigation.dispatch({
                    ...CommonActions.navigate(route.name, route.params),
                    target: state.key,
                  });
                }
              };

              return (
                <TabButton
                  key={route.key}
                  index={index}
                  title={title}
                  focused={focused}
                  position={position}
                  idle={idle}
                  active={active}
                  colors={colors}
                  renderIcon={options.tabBarIcon}
                  accessibilityLabel={options.tabBarAccessibilityLabel ?? title}
                  onPress={onPress}
                  onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                />
              );
            })}
        </View>
      </Animated.View>
    </View>
  );
}

/** `tabBar` renderer for a tab navigator. */
export function pillTabBar(props: BottomTabBarProps) {
  return <PillTabBar {...props} />;
}

type IconRenderer = (props: { focused: boolean; color: string; size: number }) => React.ReactNode;

function TabButton({
  index,
  title,
  focused,
  position,
  idle,
  active,
  colors,
  renderIcon,
  accessibilityLabel,
  onPress,
  onLongPress,
}: {
  index: number;
  title: string;
  focused: boolean;
  position: SharedValue<number>;
  idle: number;
  active: number;
  colors: AppTheme['colors'];
  renderIcon?: IconRenderer;
  accessibilityLabel: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const pressed = useSharedValue(0);
  const [measured, setMeasured] = useState(0);
  // The label gets what is left of the active button once the icon and padding are in.
  const labelWidth = Math.max(0, Math.min(measured, active - ICON - LABEL_GAP - BUTTON_PAD * 2));

  /** 1 when this tab is the active one, 0 when the indicator is a full tab away. */
  const buttonStyle = useAnimatedStyle(() => {
    const activeness = Math.min(1, Math.max(0, 1 - Math.abs(position.get() - index)));
    return { width: idle + (active - idle) * activeness };
  });
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.1 * pressed.get() }],
  }));
  const iconStyle = useAnimatedStyle(() => {
    const activeness = Math.min(1, Math.max(0, 1 - Math.abs(position.get() - index)));
    // Peaks halfway through the change: a small pop as the glyph swaps.
    return { transform: [{ scale: 1 + 0.16 * Math.sin(Math.PI * activeness) }] };
  });
  const outlineStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, Math.abs(position.get() - index))),
  }));
  const filledStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, 1 - Math.abs(position.get() - index))),
  }));
  const labelStyle = useAnimatedStyle(() => {
    const activeness = Math.min(1, Math.max(0, 1 - Math.abs(position.get() - index)));
    return {
      width: activeness * (LABEL_GAP + labelWidth),
      // The label fades in over the second half, once there is room for it.
      opacity: Math.max(0, activeness * 2 - 1),
    };
  });

  return (
    <Animated.View style={[styles.button, buttonStyle]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => pressed.set(withSpring(1, springs.press))}
        onPressOut={() => pressed.set(withSpring(0, springs.press))}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={accessibilityLabel}
        style={styles.pressable}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          <Animated.View style={[styles.icon, iconStyle]}>
            <Animated.View style={[styles.glyph, outlineStyle]}>
              {renderIcon?.({ focused: false, color: colors.muted, size: ICON })}
            </Animated.View>
            <Animated.View style={[styles.glyph, filledStyle]}>
              {renderIcon?.({ focused: true, color: colors.onPrimary, size: ICON })}
            </Animated.View>
          </Animated.View>

          <Animated.View style={[styles.label, labelStyle]}>
            <View style={{ width: LABEL_GAP + labelWidth, paddingLeft: LABEL_GAP }}>
              <Txt v="label" color={colors.onPrimary} chrome numberOfLines={1}>
                {title}
              </Txt>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Off-screen copy that reports the label's natural width. */}
        <View
          style={styles.ruler}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Txt
            v="label"
            chrome
            numberOfLines={1}
            // Layout widths can come back rounded down; a point of slack keeps the last
            // letter from turning into an ellipsis.
            onLayout={(event) => setMeasured(Math.ceil(event.nativeEvent.layout.width) + 2)}
          >
            {title}
          </Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    // Touches beside and below the bar fall through to the screen.
    pointerEvents: 'box-none',
  },
  bar: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    height: tabBar.height,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  // Clips the indicator to the pill; kept apart from `bar` so the shadow is not clipped.
  track: {
    flex: 1,
    flexDirection: 'row',
    padding: INSET,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    left: INSET,
    borderRadius: radius.pill,
  },
  button: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  pressable: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: ICON, height: ICON },
  glyph: { position: 'absolute', top: 0, left: 0 },
  label: { overflow: 'hidden' },
  ruler: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    flexDirection: 'row',
    opacity: 0,
    pointerEvents: 'none',
  },
});
