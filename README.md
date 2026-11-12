# Student Management & Learning Platform

Role-based Expo app for student registration, admin approval, batch allocation and
course content delivery. There is **no backend yet** — everything runs off the JSON
seed data in [`data/`](./data/README.md).

## Run it

```bash
npm install
npx expo start
```

Sign in with one of the demo accounts listed on the login screen (tap a card to fill
the form):

| Role    | Email                       | Password     |
| ------- | --------------------------- | ------------ |
| Admin   | `admin@ams.dev`             | `admin123`   |
| Teacher | `ritu@ams.dev`              | `teacher123` |
| Student | `ananya.sharma@example.com` | `student123` |

## Roles

**Student** — registration wizard, live approval status timeline, batch schedule,
course modules with per-item completion, profile and documents.

**Teacher** — assigned batches, students in those batches, read-only course content.

**Admin** — dashboard counters, student pipeline (pending / approved / allocated /
active / rejected), approve & reject with a reason, batch allocation with seat
capacity checks, course catalogue and batch management.

## Flows

```
Registration
  Personal -> Contact -> Education -> Course -> Documents
      |
      v
PENDING_APPROVAL --(admin)--> APPROVED --> ALLOCATED --> ACTIVE
      |
      \--(admin)--> REJECTED (with reason)
```

Course content stays locked until the student is `ALLOCATED` or `ACTIVE`.

## Project layout

```
app/                    expo-router routes
  (auth)/               login, registration wizard
  (student)/(tabs)/     home, my course, batch, profile
  (student)/module/     module detail + content viewer
  (teacher)/(tabs)/     overview, students, content
  (admin)/(tabs)/       dashboard, students, courses, batches
  (admin)/student|course|batch/[id]
src/
  components/           Card, StatTile, StatusChip, StatusTimeline, BatchCard, ...
  context/              AuthContext (session) + DataContext (tables & actions)
  data/db.ts            in-memory tables seeded from data/*.json
  services/api.ts       async API facade (swap this for real HTTP calls)
  theme/                MD3 light & dark themes, spacing/radius tokens
  types/                shared domain types
data/                   JSON seed data — see data/README.md
```

## Not wired up yet

- Real API / database — replace `src/services/api.ts`.
- File storage. Document "uploads" record a mock filename; content URLs are
  placeholders.
- Persistence. State lives in memory and resets on reload.
- Notifications.
