import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useAppTheme } from '@/src/theme/useAppTheme';

/** Depth of the wavy bottom edge. The header pads its content by this much. */
export const HEADER_CURVE = { tab: 28, stack: 18 } as const;

/** How far the lighter under-wave hangs below the body, as a share of the curve depth. */
const UNDER = 0.4;
/** The wave's lowest point (its left end) sits this share of the curve depth above its baseline. */
const DIP = 0.15;

/**
 * Header body: flat top, an S-shaped wave along the bottom, with its baseline at
 * `h + dy`. The lowest point of the curve is DIP * c above that baseline.
 */
function wave(w: number, h: number, c: number, dy = 0) {
  const y = (k: number) => (h + dy + c * k).toFixed(1);
  return `M0 0H${w}V${y(-1)}C${w * 0.7} ${y(0.75)} ${w * 0.3} ${y(-1.5)} 0 ${y(-0.15)}Z`;
}

/** Four-point sparkle centred on (x, y). */
function sparkle(x: number, y: number, s: number) {
  return `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
}

/**
 * Centre of the motif: the rings orbit it and the glow sits behind it. On tab roots the
 * motif itself is the active tab's icon, drawn on top by TabMotif.
 */
export function motifCentre(width: number, top: number, variant: 'tab' | 'stack') {
  return variant === 'tab' ? { x: width - 118, y: top + 40 } : { x: width - 96, y: top + 26 };
}

/** Open book (56 x 34) with a few lines of text on its pages. */
const BOOK =
  'M0 5C9 0 19 0 28 5V34C19 29 9 29 0 34Z M28 5C37 0 47 0 56 5V34C47 29 37 29 28 34Z ' +
  'M6 12C11 10 17 10 22 12 M6 19C11 17 17 17 22 19 M34 12C39 10 45 10 50 12';

interface Props {
  width: number;
  height: number;
  /** Status bar inset; the art is placed relative to the content below it. */
  top: number;
  variant: 'tab' | 'stack';
}

/**
 * Decorative background for AppHeader: a diagonal green gradient with a wavy bottom
 * edge and a mint under-wave, then line art clipped to it: a motif (the active tab's
 * icon on tab roots, see TabMotif; an open book on pushed screens) circled by rings, a soft
 * glow behind it, a dot grid and a few sparkles. Theme colours only, so it follows
 * dark mode. Hidden from assistive tech.
 */
export function HeaderArt({ width: w, height: h, top, variant }: Props) {
  const { colors } = useAppTheme();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${name}${uid}`;

  const tab = variant === 'tab';
  const c = HEADER_CURVE[variant];
  const art = colors.headerArt;

  const { x: mx, y: my } = motifCentre(w, top, variant);
  const rings = tab ? [46, 76, 108] : [34, 58, 84];

  const dotX = tab ? w * 0.38 : w * 0.5;
  const dotY = top + (tab ? 70 : 40);
  const dots: { x: number; y: number; o: number }[] = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      dots.push({ x: dotX + col * 10, y: dotY + row * 10, o: 0.5 - col * 0.07 });
    }
  }

  const sparkles: [number, number, number][] = tab
    ? [
        [mx - 72, top + 10, 5],
        [w - 26, top + 86, 4.5],
        [mx + 30, top + 2, 3.5],
      ]
    : [
        [mx - 52, top + 8, 3.5],
        [w - 22, top + 44, 4],
      ];

  // An Svg never draws past its own height, so both waves are lifted until the
  // under-wave's lowest point lands exactly on the bottom edge instead of being cut off.
  const under = wave(w, h, c, DIP * c);
  const body = wave(w, h, c, (DIP - UNDER) * c);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.headerStart} />
            <Stop offset="1" stopColor={colors.headerEnd} />
          </LinearGradient>
          <RadialGradient id={id('glow')} cx={mx} cy={my} r={tab ? 150 : 110} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={art} stopOpacity={0.3} />
            <Stop offset="1" stopColor={art} stopOpacity={0} />
          </RadialGradient>
          <ClipPath id={id('clip')}>
            <Path d={body} />
          </ClipPath>
        </Defs>

        <Path d={under} fill={art} fillOpacity={0.52} />
        <Path d={body} fill={`url(#${id('bg')})`} />

        <G clipPath={`url(#${id('clip')})`}>
          <Rect x={0} y={0} width={w} height={h} fill={`url(#${id('glow')})`} />
          <Circle cx={0} cy={h} r={tab ? 84 : 56} fill={art} fillOpacity={0.07} />

          {rings.map((r, i) => (
            <Circle
              key={r}
              cx={mx}
              cy={my}
              r={r}
              fill="none"
              stroke={art}
              strokeOpacity={0.22 - i * 0.06}
              strokeWidth={1.2}
            />
          ))}

          {dots.map((d) => (
            <Circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r={1.3} fill={art} fillOpacity={d.o} />
          ))}

          {/* Tab roots: the motif is the active tab's icon, animated by TabMotif. */}
          {!tab && (
            <G transform={`translate(${mx} ${my}) rotate(-10) scale(0.82) translate(-28 -17)`}>
              <Path
                d={BOOK}
                fill="none"
                stroke={art}
                strokeOpacity={0.45}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          )}

          {sparkles.map(([x, y, s]) => (
            <Path key={`${x}-${y}`} d={sparkle(x, y, s)} fill={art} fillOpacity={0.8} />
          ))}
        </G>
      </Svg>
    </View>
  );
}
