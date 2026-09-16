# Golf Attendance

A simple starter web app for tracking who's playing each round of golf. Add
members, schedule events, and mark each member as **Present**, **Maybe**, or
**Absent** per event. All data is stored locally in your browser via
`localStorage` — no backend required.

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 5](https://vite.dev/) for dev server and bundling
- `localStorage` for persistence

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload     |
| `npm run build`   | Type-check and build for production       |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Type-check without emitting output       |

## Features

- **Grape progress** — every member grows their own code-drawn SVG grape
  cluster of 20 berries. Each logged practice fills one more berry from an
  empty outline to rich purple.
- **+1 / −1 practice tracking** — tap **+1 practice** to log a session (adds a
  timestamped entry) or **−1** to undo the most recent one (disabled at 0).
  A `7 / 20` counter shows current progress.
- **Completion celebration** — when a member fills all 20 berries the cluster
  glows and a modal pops up once with an inspirational quote and a code-drawn
  SVG trophy. Practices past 20 keep counting toward the ranking; the grape
  stays full.
- **Monthly leaderboard** — a ranked chart of members by practice count within
  the current calendar month, labelled with the month and year.
- **Members** — add and remove players.
- **Events** — schedule rounds with a title, date, and optional location.
- **Attendance** — select an event and mark each member's status. Live counts
  show how many are present, maybe, absent, or yet to respond.
- **Persistence** — everything (including practices) is saved to the browser
  automatically in `localStorage` under the `golf-attendance:v2` key.

## Project structure

```
src/
  components/
    Members.tsx          # add / list / remove members
    Events.tsx           # add / list / select / remove events
    Attendance.tsx       # mark attendance for the selected event
    GrapeCluster.tsx     # code-drawn SVG grape cluster (20 berries)
    MemberGrapes.tsx     # per-member grape card grid with +1 / -1 controls
    CelebrationModal.tsx # SVG trophy + quote modal shown at 20 berries
    Leaderboard.tsx      # monthly practice ranking chart
  types.ts               # shared data model
  stats.ts               # pure grape/leaderboard helpers
  storage.ts             # localStorage load/save helpers
  useAppState.ts         # state hook wiring it all together
  App.tsx                # layout and composition
  main.tsx               # entry point
```

## Ideas for next steps

- Export/import data as JSON or CSV.
- Group members into teams or handicap tiers.
- Add a backend + auth to share across devices.
- Attendance history and per-member stats.
