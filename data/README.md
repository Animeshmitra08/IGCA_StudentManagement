# Mock data

No API or database is connected yet. These JSON files are the seed data for the whole app.

| File            | Contents                                                              |
| --------------- | --------------------------------------------------------------------- |
| `users.json`    | Login accounts (`ADMIN`, `TEACHER`, `STUDENT`) with plain-text demo passwords |
| `students.json` | Student records across every lifecycle status, with documents + progress |
| `courses.json`  | Course catalogue (title, fee, duration, brand colour, icon)           |
| `modules.json`  | Modules belonging to a course (`courseId`, `order`)                   |
| `content.json`  | Content items inside a module (`VIDEO`, `NOTES`, `ASSIGNMENT`, `IMAGE`) |
| `batches.json`  | Batch schedules (dates, days, timing, capacity, teacher)              |

## How it is wired up

```
data/*.json
    │  seed (deep-cloned at startup)
    ▼
src/data/db.ts        in-memory tables, mutated at runtime
    ▼
src/services/api.ts   async facade with simulated latency
    ▼
src/context/*.tsx     AuthContext + DataContext
    ▼
app/**                screens
```

Runtime changes (approvals, batch allocation, new registrations, lesson completion)
are written to the in-memory tables only — they reset on app reload. The **Reset demo
data** action in `api.reset()` restores the seed on demand.

## Replacing this with a real backend

Rewrite `src/services/api.ts` so each method calls your HTTP endpoints instead of
`db`. Nothing else has to change: every screen reads through `DataContext`, which
only talks to `api`.

## Student lifecycle

```
Registration -> PENDING_APPROVAL -> APPROVED -> ALLOCATED -> ACTIVE
                                 \-> REJECTED
```

Course content is gated: it unlocks only for `ALLOCATED` and `ACTIVE` students.

## Demo logins

| Role    | Email                        | Password     |
| ------- | ---------------------------- | ------------ |
| Admin   | `admin@ams.dev`              | `admin123`   |
| Teacher | `ritu@ams.dev`               | `teacher123` |
| Student | `ananya.sharma@example.com`  | `student123` |

Other student accounts exercise the other statuses:
`kabir.chatterjee@example.com` (ALLOCATED), `arjun.nair@example.com` (PENDING_APPROVAL),
`nikhil.verma@example.com` (REJECTED) — all with password `student123`.
