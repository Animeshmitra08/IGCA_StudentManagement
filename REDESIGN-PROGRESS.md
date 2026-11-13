# UI redesign: progress record

**Started:** 13 Nov 2026
**Status:** Partly done. Nothing is committed yet; all changes are in the working tree.

## The request

The theme stays. The UI was too minimal, so the redesign adds:

1. A custom bottom tab bar: pill-shaped, with pill-shaped buttons, sliding animations and micro-interactions.
2. Circular progress rings in place of the linear progress bars, with the number in the centre and an ease-in animation every time the screen opens.
3. A bento grid layout across the app, with entrance animations when a screen opens.

## Summary

| Area | Status |
| --- | --- |
| Pill tab bar | Done, wired into all three roles |
| Circular progress ring | Component built, not used on any screen yet |
| Bento grid | Components built, not used on any screen yet |
| Screen entrance animation | Done for every screen built on `Screen` or `GroupedList` |
| Theme tokens | Done |
| Screen recomposition (bento layouts) | Pending |
| Replacing linear progress bars with rings | Pending |
| `MOBILE-DESIGN.md` update | Pending |
| Lint, device testing, commit | Pending |

---

## What has changed

### New files

| File | What it is |
| --- | --- |
| `src/components/PillTabBar.tsx` | Floating pill tab bar. Each tab is a pill button, and the active one widens to show its label. A green pill indicator slides between tabs on a spring. |
| `src/components/ProgressRing.tsx` | Circular progress with the percentage counting up in the centre. Can show a fixed label instead (for example `2/5`) and an optional caption. |
| `src/components/Bento.tsx` | Bento grid building blocks: `Bento`, `BentoRow`, `BentoCol`, `Tile`, `StatTile`, `FactTile`, `CountUp`. |
| `src/components/motion.tsx` | Shared motion helpers: screen entrance (`EntranceProvider`, `Enter`), the fill animation (`useFillProgress`, `useCountUp`), press feedback (`usePressScale`) and spring presets. |

### Changed files

| File | Change |
| --- | --- |
| `app/(admin)/(tabs)/_layout.tsx` | Uses the pill tab bar (`tabBar={pillTabBar}`). |
| `app/(teacher)/(tabs)/_layout.tsx` | Same. |
| `app/(student)/(tabs)/_layout.tsx` | Same. |
| `src/components/Screen.tsx` | Screen blocks now enter one after another, fading and rising into place. List rows in `GroupedList` cascade in the same way. Tab screens get extra bottom padding so the last item scrolls clear of the floating bar. `useBottomPadding` now takes `'tabbed'` or `'docked'` instead of a boolean. Rounder list corners. |
| `src/components/ui.tsx` | New `InkContext`, so text on a solid green tile turns white automatically. Corner radius: groups 10 → 22, notices and the search field 10 → 14. |
| `src/theme/theme.ts` | New `radius.xl` (22) for tiles and groups. New `tabBar` metrics (height 64, gap 12). New `elevation.floating` shadow for the tab bar. |
| `src/theme/navigation.ts` | Removed the native tab bar colour and label options (no longer used). Headers keep the screen background colour. |
| `src/utils/feedback.ts` | New `haptic.select()`, a light tick when the tab changes. It does nothing on web. |
| `src/components/TabIcon.tsx` | Comment update only. |

### How it behaves

**Pill tab bar**
- The bar floats above the content, 12pt above the bottom safe area, with a soft shadow. It is capped at 520pt wide on tablets.
- Switching tabs slides the green pill on a spring with a slight overshoot. The old tab shrinks back to an icon and the new one widens.
- The icon changes from outline to filled with a small pop halfway through the switch, and the label slides out beside it.
- A button shrinks slightly under your finger and springs back on release.
- A light haptic tick plays on a change of tab (not when you tap the tab you are already on).
- The bar slides down out of the way while the keyboard is open.
- Accessibility: the bar is a `tablist`, each button is a `tab` with a selected state, and long-press events are passed through to the navigator.

**Progress ring**
- The ring fills from zero with an ease-in-out curve (1.1s, after a 0.2s delay). It replays every time the screen is opened, including when you come back from a detail screen.
- The centre number counts up in step with the ring.
- If the value changes while the screen is open (for example, after ticking off a lesson), the ring animates from its current position instead of starting over.
- It is drawn with plain views rather than SVG, so there is no new native dependency and no dev-client rebuild.
- It reports a `progressbar` role and value to screen readers.

**Bento tiles and screen entrance**
- Tiles come in two kinds: plain card tiles and tinted tiles (`primary`, `solid` green, `info`, `warning`, `error`, `neutral`).
- A tile you can tap shrinks slightly when pressed. If it opens another screen, it shows a ↗ arrow in the corner.
- When a screen opens, its blocks fade in and rise into place one after another. Bento tiles also scale up slightly, in reading order. The stagger is capped so long screens are never slow to appear.
- The entrance replays when you switch back to a tab, but not when you return from a detail screen, because the content was already visible.
- All animations respect the system "Reduce motion" setting.

---

## What is pending

### 1. Recompose the screens into bento layouts

None of these screens use the bento components yet. The plan for each one:

| Screen | File | Planned layout |
| --- | --- | --- |
| Student home | `app/(student)/(tabs)/index.tsx` | Large course tile with the progress ring, plus a status tile, a batch tile, and an enrolment timeline tile. |
| Student course | `app/(student)/(tabs)/course.tsx` | Ring tile with done/total counts, then the module list. Each module could show a small ring. |
| Student batch | `app/(student)/(tabs)/batch.tsx` | Fact tiles for days, time, room and dates, then classmates. |
| Student profile | `app/(student)/(tabs)/profile.tsx` | Identity tile, then enrolment fact tiles. The long info lists stay as grouped lists. |
| Module detail | `app/(student)/module/[id].tsx` | Ring tile at the top, then content rows. |
| Admin dashboard | `app/(admin)/(tabs)/index.tsx` | Large "waiting for review" count tile, stat tiles per status (tapping one opens the filtered student list), then the pending list. |
| Admin course detail | `app/(admin)/course/[id].tsx` | Fact tiles for level, duration, fee and status, then batches and modules. |
| Admin batch detail | `app/(admin)/batch/[id].tsx` | Seats ring tile, schedule fact tiles, then the student list. |
| Admin student detail | `app/(admin)/student/[id].tsx` | Identity and status tile, then the timeline. Info lists stay as grouped lists. |
| Teacher overview | `app/(teacher)/(tabs)/index.tsx` | Identity tile, then stat tiles for batches, students and content, then the batch list. |
| Teacher batch detail | `app/(teacher)/batch/[id].tsx` | Same pattern as the admin batch detail. |

The list tabs (admin Students, Courses and Batches; teacher Students and Content) already get the entrance animation and rounder corners. They stay as lists, because their data can grow without limit.

### 2. Replace the linear progress bars with rings

The old `Progress` bar is still used in these places:

- `app/(student)/(tabs)/index.tsx`: course progress
- `app/(student)/(tabs)/course.tsx`: overall course progress
- `app/(student)/module/[id].tsx`: module progress
- `app/(admin)/batch/[id].tsx`: seats taken
- `app/(teacher)/batch/[id].tsx`: seats taken
- `src/components/BatchRow.tsx`: seats taken in batch lists. This needs a small ring (about 40pt) at the end of the row.

**Decision needed:** the register wizard's step indicator (`StepProgress` in `app/(auth)/register.tsx`) is a segmented bar showing which step you are on. It could become a small ring showing `2/5`, or stay as it is. Steps read more naturally as segments than as a percentage.

Once nothing uses `Progress` from `src/components/ui.tsx`, it can be deleted.

### 3. Update the design documentation

`MOBILE-DESIGN.md` still describes the old rules, and the redesign now breaks several of them:

- The motion dial was 1 (press feedback only); it is now around 6.
- It says "no stat-tile grids", but the bento grid uses stat tiles on purpose.
- It says pills are for chips and avatars only, but the tab bar is now a pill.
- It says the tab bar is native, but it is now custom.
- The radius scale gains `xl`, and the elevation scale gains `floating`.

Also note that `design-baseline.json` FINDING-002 had replaced an earlier custom floating tab bar with the native one. This redesign deliberately reverses that at your request. Record it there, so a future audit does not flag it as a regression.

### 4. Verification and commit

- [x] `npx tsc --noEmit` passes with no errors.
- [ ] `npm run lint`
- [ ] Run on Android and iOS, in light and dark mode.
- [ ] Tab bar: labels fit at the largest font size (1.3x cap); the bar clears the Android gesture bar with edge-to-edge on.
- [ ] Ring: the two halves meet cleanly on Android and web, with no seam at the 50% point.
- [ ] With "Reduce motion" on, everything appears without animating.
- [ ] Scrolling stays smooth on the longest list with row entrance enabled.
- [ ] Commit in steps: shared components, then each group of screens.

## Things to watch

- **Screens that skip the animation.** Empty states and "not found" screens render a plain `View`, not `Screen`, so they appear without the entrance animation. That is intended, but it is worth knowing.
- **Tab bar and keyboard.** The bar hides when the keyboard opens. On Android this happens after the keyboard has appeared (`keyboardDidShow`), so there can be a brief overlap.
- **Long tab labels.** The active button's width is shared out by tab count. A long label in a 4-tab bar on a narrow phone will be cut short rather than overflow.
