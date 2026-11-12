# Mobile design system

The rules this app's UI is built on. Read this before adding a screen or changing a
token. The audit that motivated it is in `design-baseline.json`.

## App read

An admin console, a teacher view and a student portal for one institute. People open it
to do a job (review a registration, check a batch, see what's next in the course), not
to browse. The UI should feel like a well-kept system app: calm, dense enough to scan,
and with nothing decorative competing with the data.

**Dials:** expression 3 · motion 1 · density 5.
Low expression means native chrome (headers, tab bar) and no hero bands. Low motion
means press feedback and the skeleton pulse only. Medium density means grouped lists
with 56pt rows.

## Tokens: `src/theme/theme.ts`

| Token | Rule |
| --- | --- |
| `spacing` | 4/8 grid. Screen padding is always `lg` (16). |
| `radius` | `sm` 6 inputs, `md` 10 groups and buttons, `lg` 14 dialogs and modals, `pill` chips and avatars only. |
| `type` | `display` (one hero number per screen at most), `title`, `heading`, `body`, `bodyStrong`, `label`, `caption`. Use them through `<Txt v="...">` and never write `fontSize` or `fontWeight` in a screen. |
| Color | One accent: `primary` (green). It also means "done or active". `secondary` and `tertiary` are neutral ink, so Paper never adds a second hue. Status colors come from `statusColors()` and always pair color with an icon and a label. |
| `elevation` | Content is flat. `raised` is only for bars above scrolling content (`ActionBar`). |
| Dark mode | `DarkTheme` mirrors every key. Light and dark are both checked on every change. |

Screens and components contain zero hex or rgba values.

## Components: `src/components/`

| Need | Use |
| --- | --- |
| Text | `Txt` (`chrome` caps Dynamic Type at 1.3x for text inside fixed-size controls) |
| A group of rows | `Group` with `Row`, `InfoRow`, `BatchRow`, `StudentRow`, `ContentRow`, `GroupBody` for non-row content |
| A list that can grow | `GroupedList` (a virtualized FlatList with the same look as `Group`), never `Screen` + `.map` |
| Short fixed content | `Screen` (scroll, padding, pull to refresh, bottom inset) |
| Title block under the header | `Lead` |
| Section label | `SectionHeader` |
| Loading or error | `useDataGate()`. Call it before any "not found" branch. |
| Nothing to show | `EmptyState` with the action that fixes it (clear search, show all, retry) |
| Inline message | `Notice` |
| Primary actions at the bottom | `ActionBar` |
| Press feedback | `Touchable` (ripple on Android, highlight elsewhere, `accessibilityRole` defaulted) |
| Destructive confirmation | `confirmDestructive()`, the only sanctioned `Alert.alert` |
| Haptics | `haptic.success` / `haptic.failure`, only for the outcome of an async action |

Do not use shadowed cards, tinted icon badges, stat-tile grids, or pills that carry no
state.

**Row rules:** set `pushes` (the chevron) only when tapping pushes a screen. Use 56pt
minimum rows and 44pt minimum touch targets. Separators are inset to the text,
using `AVATAR_INSET` after avatars.

## Nav read

```
/                         redirect by role
(auth)      Stack         login (no header) -> register (header "Register")
(admin)     Stack         (tabs) -> student/[id], course/[id], batch/[id]
  (tabs)    Tabs          Dashboard [sign out] · Students · Courses · Batches
(teacher)   Stack         (tabs) -> batch/[id]
  (tabs)    Tabs          Overview [sign out] · Students · Content
(student)   Stack         (tabs) -> module/[id]
  (tabs)    Tabs          Home · Course · Batch · Profile [sign out row]
```

- Native headers and tab bar come from `src/theme/navigation.ts` (`tabScreenOptions`,
  `detailScreenOptions`, `navigationTheme`). Detail screens set a short title
  (code, reg. no, `Module n`) with `<Stack.Screen options>`. The full title goes in `Lead`.
- Modal versus push: the allocate-batch picker is a `pageSheet` modal (pick, then
  commit). Content preview is a Paper `Modal` with an explicit Close.
- Back: the register wizard uses `usePreventRemove`, so every back gesture steps back
  one step instead of discarding the form.
- Sign out always confirms.

Route names, tab order and deep links are part of the contract. Change them only with
an explicit migration note.

## Known gaps

These are recorded as open in `design-baseline.json`: role gating is still a root
`useEffect`, date of birth is free text, register fields don't chain the keyboard
action, there is no spring press motion, and the app name differs between login
("Student Management") and `app.json` ("IGCA").
