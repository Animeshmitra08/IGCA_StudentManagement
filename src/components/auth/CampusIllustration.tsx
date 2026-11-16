import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useAppTheme } from '@/src/theme/useAppTheme';

/**
 * Flat illustration for the sign-in screen: a student with a backpack and books in
 * front of a campus (two buildings, a clock tower, trees). Drawn with plain views in
 * theme colours, so it needs no image asset or SVG dependency and follows dark mode.
 */

const W = 152;
const H = 136;
const GROUND = 18;

/** `scale` shrinks the whole drawing for narrow screens. */
export function CampusIllustration({ scale = 1 }: { scale?: number }) {
  const { colors } = useAppTheme();
  const wall = { backgroundColor: colors.card, borderColor: colors.border };
  const pane = { backgroundColor: colors.primaryContainer };

  const windows = (rows: number, cols: number) => (
    <View style={styles.windows}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={styles.windowRow}>
          {Array.from({ length: cols }, (_, c) => (
            <View key={c} style={[styles.window, pane]} />
          ))}
        </View>
      ))}
    </View>
  );

  const tree = (left: number, size: number) => (
    <View style={[styles.tree, { left, width: size }]}>
      <View
        style={{ width: size, height: size * 1.25, borderRadius: size, backgroundColor: colors.inversePrimary }}
      />
      <View style={[styles.trunk, { backgroundColor: colors.outline }]} />
    </View>
  );

  return (
    <View
      style={{ width: W * scale, height: H * scale }}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={[styles.box, { transform: [{ scale }] }]}>
      {/* Ground */}
      <View style={[styles.ground, { backgroundColor: colors.inversePrimary }]} />

      {/* Left building */}
      <View style={[styles.building, wall, { left: 6, width: 40, height: 50 }]}>{windows(3, 3)}</View>

      {/* Clock tower */}
      <View style={[styles.roof, { left: 43, borderBottomColor: colors.primary }]} />
      <View style={[styles.building, wall, { left: 46, width: 26, height: 88 }]}>
        <View style={[styles.clock, { borderColor: colors.primary, backgroundColor: colors.card }]}>
          <View style={[styles.hand, { backgroundColor: colors.primary }]} />
        </View>
        {windows(3, 1)}
      </View>

      {/* Right building with a pediment */}
      <View style={[styles.pediment, { left: 70, borderBottomColor: colors.outlineVariant }]} />
      <View style={[styles.building, wall, { left: 72, width: 48, height: 38 }]}>{windows(2, 4)}</View>

      {tree(0, 16)}
      {tree(124, 20)}

      {/* Student */}
      <View style={styles.student}>
        <View style={[styles.backpack, { backgroundColor: colors.onPrimaryContainer }]} />
        <View style={[styles.leg, { left: 13, backgroundColor: colors.secondary }]} />
        <View style={[styles.leg, { left: 25, backgroundColor: colors.secondary }]} />
        <View style={[styles.torso, { backgroundColor: colors.primary }]} />
        <View style={[styles.head, { backgroundColor: colors.secondaryContainer, borderColor: colors.outline }]} />
        <View style={styles.cap}>
          <Icon source="school" size={26} color={colors.onSurface} />
        </View>
        <View style={[styles.book, styles.bookBack, { backgroundColor: colors.inversePrimary, borderColor: colors.primary }]} />
        <View style={[styles.book, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.bookLine, { backgroundColor: colors.primary }]} />
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: W, height: H, transformOrigin: 'top left' },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: GROUND,
    borderRadius: GROUND,
    opacity: 0.55,
  },
  building: {
    position: 'absolute',
    bottom: GROUND - 6,
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    alignItems: 'center',
  },
  windows: { marginTop: 8, gap: 6 },
  windowRow: { flexDirection: 'row', gap: 5 },
  window: { width: 6, height: 7, borderRadius: 1.5 },
  roof: {
    position: 'absolute',
    bottom: GROUND - 6 + 88,
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  clock: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 7,
    alignItems: 'center',
  },
  hand: { width: 2, height: 6, borderRadius: 1, marginTop: 1 },
  pediment: {
    position: 'absolute',
    bottom: GROUND - 6 + 38,
    width: 0,
    height: 0,
    borderLeftWidth: 26,
    borderRightWidth: 26,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tree: { position: 'absolute', bottom: GROUND - 6, alignItems: 'center' },
  trunk: { width: 3, height: 9 },

  student: { position: 'absolute', right: 6, bottom: 2, width: 50, height: 92 },
  cap: { position: 'absolute', top: 0, left: 10 },
  head: { position: 'absolute', top: 15, left: 14, width: 18, height: 18, borderRadius: 9, borderWidth: 1 },
  backpack: { position: 'absolute', top: 36, left: 4, width: 16, height: 26, borderRadius: 6 },
  torso: {
    position: 'absolute',
    top: 33,
    left: 10,
    width: 26,
    height: 34,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  leg: {
    position: 'absolute',
    top: 64,
    width: 9,
    height: 28,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  book: {
    position: 'absolute',
    top: 46,
    left: 28,
    width: 17,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBack: { top: 43, left: 31 },
  bookLine: { width: 9, height: 2, borderRadius: 1 },
});
