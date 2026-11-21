# Mobile design system

The rules this app's UI is built on. Read this before adding a screen or changing a
token. The audit that motivated the first pass is in `design-baseline.json`; the
13 Nov 2026 redesign (pill tab bar, rings, bento) is recorded in `REDESIGN-PROGRESS.md`.

## App read

An admin console, a teacher view and a student portal for one institute. People open it
to do a job (review a registration, check a batch, see what's next in the course). The
first pass made it calm and flat; the owner found that too minimal. The current
direction keeps the theme and the copy, and adds shape, colour blocks and motion: each
screen leads with a bento grid that puts its key numbers in tiles, progress is a ring,
and the tab bar is a floating pill.

**Dials:** expression 6 · motion 6 · density 4.
Expression 6 means a custom tab bar, tinted and solid tiles, and one hero tile per
screen. Decorative imagery lives in exactly two places: the sign-in screen and the
`AppHeader` (a green gradient band with SVG line art). Screen content stays undecorated. Motion 6 means screens
enter with a stagger, rings and counters fill, and tiles and tabs spring under the
finger; nothing loops and everything follows "reduce motion". Density 4 means tiles for
the headline facts and grouped lists (56pt rows) for everything long.

## Tokens: `src/theme/theme.ts`

| Token | Rule |
| --- | --- |
| `spacing` | 4/8 grid. Screen padding is always `lg` (16). Bento gap is `md` (12). |
| `radius` | `sm` 6 inputs, `md` 10 buttons, `lg` 14 dialogs, notices and the search field, `xl` 22 bento tiles and grouped lists, `pill` chips, avatars, and the tab bar with its buttons. |
| `type` | `display` (one hero number per screen at most), `title`, `heading`, `body`, `bodyStrong`, `label`, `caption`. Use them through `<Txt v="...">` and never write `fontSize` or `fontWeight` in a screen. |
| Color | One accent: `primary` (green). It also means "done or active". `secondary` and `tertiary` are neutral ink, so Paper never adds a second hue. Status colors come from `statusColors()` / `statusTone()` and always pair color with an icon and a label. |
| Tile tones | `card` (default), `solid` (the accent; one per screen, for the hero number), and the tinted containers `primary`, `info`, `warning`, `error`, `neutral`. A tint must mean something (a status, "done", "needs attention"); it is not decoration. |
| `elevation` | Content is flat: hairlines and tinted tiles, no shadows. `raised` is for bars docked above scrolling content (`ActionBar`); `floating` is for the pill tab bar only. |
| Header colours | `headerStart` → `headerEnd` (the header gradient), `onHeader` / `onHeaderMuted` (its ink), `headerArt` (its line art and under-wave), `headerButton` (the circle behind header icon buttons). Used by `AppHeader`, `HeaderArt` and `HeaderButton` only. |
| `tabBar` | Height 64, gap 12. Tab screens pad their scroll content by this much (handled by `Screen` and `GroupedList` with `tabbed`). |
| Dark mode | `DarkTheme` mirrors every key. Light and dark are both checked on every change. |

Screens and components contain zero hex or rgba values.

## Components: `src/components/`

| Need | Use |
| --- | --- |
| Text | `Txt` (`chrome` caps Dynamic Type at 1.3x for text inside fixed-size controls). On a `solid` tile it turns to the on-accent colour by itself (`InkContext`). |
| The lead of a screen | `Bento` with `BentoRow`, `BentoCol` and `Tile`. Ready-made tiles: `StatTile` (a count), `FactTile` (a labelled fact), `RingHero` (ring + title). Batch schedules: `scheduleTiles(batch)`. |
| Progress | `ProgressRing`: percentage in the centre, or a fixed label such as `2/5`. There is no linear progress bar. |
| A number that matters | `CountUp` (counts from zero each time the screen opens) |
| A group of rows | `Group` with `Row`, `InfoRow`, `BatchRow`, `StudentRow`, `ContentRow`, `GroupBody` for non-row content |
| A list that can grow | `GroupedList` (a virtualized FlatList with the same look as `Group`), never `Screen` + `.map`, and never a bento |
| Short fixed content | `Screen` (scroll, padding, pull to refresh, top inset under the floating header, bottom inset, entrance stagger) |
| Section label | `SectionHeader` |
| Loading or error | `useDataGate()`. Call it before any "not found" branch. |
| Nothing to show | `EmptyState` with the action that fixes it (clear search, show all, retry) |
| Inline message | `Notice` |
| Primary actions at the bottom | `ActionBar` |
| Press feedback | `Touchable` for rows (ripple on Android, highlight elsewhere); `Tile onPress` for tiles (spring scale) |
| Tab bar | `PillTabBar`, passed as `tabBar={pillTabBar}` in each tabs layout |
| Header | `AppHeader` through `tabScreenOptions` / `detailScreenOptions`. Never set `headerStyle`, `headerTitleStyle` or `headerTintColor` on a screen; set `title` and `headerRight`. Header actions are `HeaderButton`s. |
| Destructive confirmation | `confirmDestructive()`, the only sanctioned `Alert.alert` |
| Haptics | `haptic.success` / `haptic.failure` for the outcome of an async action, `haptic.select` on a change of tab. Plain taps stay silent. |

### Sign-in screen: `src/components/auth/`

The sign-in screen is the one screen with decoration: a mint shape behind the header, a
mint wave at the bottom, and `CampusIllustration` (drawn with plain views in theme
colours, no image asset). It is built from `AppLogo`, `LoginBrand` / `LoginHeader`,
`LoginInput` / `PasswordInput`, `RememberMe`, `PrimaryButton` and `SocialLoginButton`.
Its form sits in one flat card (`radius.xl`, hairline border, no shadow); its inputs use
`radius.md` and its buttons `radius.lg`, rounder than the rest of the app. It holds the
screen's one `display` text ("Welcome Back!"). Do not carry this decoration into the
signed-in screens; their decoration is the header (below).

### App header: `src/components/header/`

`AppHeader` replaces the native header on every screen that has one (all tab roots,
all pushed screens, and register). It runs up under the status bar, which it turns
`light` (`expo-status-bar`; the root layout's own style still applies to sign-in).

**It floats.** Both header option sets use `headerTransparent: true`, and the header's
own background is transparent, so screen content scrolls up under the wavy edge and
shows through the translucent under-wave. Every scrollable clears it at rest with
`useHeaderInset()` (from `Screen.tsx`; the measured header height, wave included):

- `Screen` and `GroupedList` pad their top by it, push the pull-to-refresh spinner
  below it (`progressViewOffset`) and inset the scroll indicator. `useDataGate`'s
  skeleton and error views pad by it too.
- Search fields and filter chips go in `GroupedList`'s `header` prop, so they scroll
  with the rows. Never pin a toolbar above a list: it would sit behind the header.
- A screen that builds its own layout (register) pads its root by the header height.
  Its `KeyboardAvoidingView` then needs no `keyboardVerticalOffset`.
- Only the header's buttons take touches (`pointerEvents="box-none"`).

- **Background (`HeaderArt`, react-native-svg):** a diagonal `headerStart` →
  `headerEnd` gradient with an S-shaped wave along the bottom edge and a lighter
  `headerArt` wave peeking out beneath it. Clipped to that shape: an academic motif
  in thin line art circled by three orbit rings, a soft radial glow behind it, a
  2 x 6 dot grid that fades out, and two or three sparkles. All art is on the right
  half, away from the title, and hidden from assistive tech.
- **`tab` variant (tab roots):** greeting eyebrow ("Good evening, Animesh", `label`,
  muted), `title`, then `headerRight`. Motif: a mortarboard. Wave depth 28.
- **`stack` variant (pushed screens):** a `HeaderButton` back arrow (when there is
  somewhere to go back to), `heading` title, `headerRight`. Motif: an open book.
  Wave depth 18. The back button calls `navigation.goBack()`, so `usePreventRemove`
  (register) still intercepts it.
- Text on the header picks up `onHeader` / `onHeaderMuted` through `InkContext`.
- The header measures itself, so large Dynamic Type grows it instead of clipping, and
  the art is redrawn to the new size.
- The art is static. It does not animate or loop.

### Bento rules

- One dominant tile per screen (the `solid` or ring tile); vary the spans around it. A
  grid of equal tiles is a table, so use a list for that.
- A tile holds one idea: one number, one fact, or one ring with its title.
- A tile that opens something sets `pushes` (the corner arrow), like `pushes` on a row.
- At most one `solid` tile and one `display` number per screen.
- Long or unbounded content never goes in tiles. Bento leads the screen; lists follow.
- Do not use shadowed cards, tinted icon badges, or pills that carry no state.

**Row rules:** set `pushes` (the chevron) only when tapping pushes a screen. Use 56pt
minimum rows and 44pt minimum touch targets. Separators are inset to the text,
using `AVATAR_INSET` after avatars.

## Motion: `src/components/motion.tsx`

| Motion | When | How |
| --- | --- | --- |
| Entrance | A screen opens, or its tab is switched to | Blocks fade in and rise 18pt, 55ms apart, 420ms each, ease-out. Tiles also scale up from 0.94. Capped at 9 steps. Not replayed when returning from a pushed screen. |
| Fill | A screen opens, switched to, or returned to | Rings and `CountUp` numbers run 0 to value in 1.1s, ease-in-out, after a 0.2s delay. A value that changes while the screen is open animates from where it is. |
| Press | Finger down on a tile or tab button | Spring scale to 0.97 (tiles) or 0.9 (tab content), and back on release. |
| Tab change | A tab is selected | The indicator slides on a spring with slight overshoot; the button widens, the glyph swaps to filled with a pop, and the label unrolls. |

Everything runs on the UI thread through Reanimated and follows the system "reduce
motion" setting. Nothing animates in a loop except the loading skeleton pulse. New
motion goes through the helpers in `motion.tsx`; screens do not create their own
shared values.

## Nav read

```
/                         redirect by role
(auth)      Stack         login (no header) -> register (header "Register")
(admin)     Stack         (tabs) -> student/[id], course/[id], batch/[id]
  (tabs)    Tabs          Dashboard [sign out] · Students · Courses · Batches
(teacher)   Stack         (tabs) -> batch/[id]
  (tabs)    Tabs          Overview [sign out] · Students · Content
(student)   Stack         (tabs) -> module/[id] -> content/[id]
  (tabs)    Tabs          Home · Course · Batch · Profile [sign out row]
```

- Headers are the custom `AppHeader`, set by `src/theme/navigation.ts`
  (`tabScreenOptions`, `detailScreenOptions`); `navigationTheme` colours the rest. The tab bar is the custom `PillTabBar`:
  it floats over the content, hides while the keyboard is open, and keeps the
  navigator's `tabPress` / `tabLongPress` events and tab accessibility roles.
- Detail screens set a short title (code, reg. no, `Module n`) with
  `<Stack.Screen options>`. The full title goes in the screen's lead tile.
- Modal versus push: the allocate-batch picker is a `pageSheet` modal (pick, then
  commit). Content preview is a Paper `Modal` with an explicit Close.
- Content: a row in a module opens the preview modal; its Play or Open button pushes
  `content/[id]`. A video plays there in `YouTubePlayer` (16:9, `radius.xl`); a document
  is downloaded and shown by `openDocument()`, which uses `File.preview()` when the
  installed expo-file-system has it (SDK 58 and up) and the system browser otherwise.
- Back: the register wizard uses `usePreventRemove`, so every back gesture steps back
  one step instead of discarding the form.
- Sign out always confirms.

Route names, tab order and deep links are part of the contract. Change them only with
an explicit migration note. The redesign changed none of them.

## Known gaps

These are recorded as open in `design-baseline.json`: role gating is still a root
`useEffect`, date of birth is free text, register fields don't chain the keyboard
action, and the app name differs between login ("Student Management") and `app.json`
("IGCA"). On the sign-in screen, "Remember me" keeps the identifier in memory only (the
app has no device storage), and "Forgot Password?", Google and Apple show a message
instead of doing anything, because there is no backend for them yet. The redesign has been checked in a browser at phone size only; see
`REDESIGN-PROGRESS.md` for what still needs a device.
