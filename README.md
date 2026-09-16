# Golf Attendance

A simple web app that turns practice into a friendly, visual habit. Pick your
name once and it is remembered in this browser, then grow your own grape
cluster: each practice you log fills one more berry. Fill all 20 and you get a
little celebration. A monthly leaderboard keeps everyone motivated. All data is
stored locally in your browser via `localStorage` — no backend required.

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
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | Type-check without emitting output       |

## Features

- **Pick your name once** — choose who you are from the member list and the app
  remembers it in this browser. A **Switch person** control lets you change who
  is active at any time. Because you only ever see and edit your own grape,
  there is no way to accidentally log a practice for someone else.
- **Your grape** — a single large, illustrated grape cluster of 20 berries,
  drawn entirely as crisp code-drawn SVG (no images). Each logged practice
  fills one more berry from an empty dashed outline to a richly shaded purple.
- **+1 / −1 practice tracking** — tap **+1 practice** to log a session (adds a
  timestamped entry) or **−1** to undo the most recent one (disabled at 0).
  A `7 / 20` counter shows current progress.
- **Completion celebration** — when you fill all 20 berries the cluster glows
  and a modal pops up once with an inspirational quote and a code-drawn SVG
  trophy. Practices past 20 keep counting toward the ranking; the grape stays
  full.
- **Monthly leaderboard** — a ranked chart of everyone by practice count within
  the current calendar month, labelled with the month and year.
- **Members** — add and remove players.
- **Persistence** — everything (including practices) is saved to the browser
  automatically in `localStorage` under the `golf-attendance:v3` key. The name
  you picked is remembered separately under `golf-attendance:current-member`.

## Project structure

```
src/
  components/
    Members.tsx          # add / list / remove members
    MemberPicker.tsx     # pick who you are (remembered per browser)
    GrapeCluster.tsx     # illustrated code-drawn SVG grape cluster (20 berries)
    MyGrape.tsx          # the current user's single large grape + / - controls
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
- Per-member practice history and streaks.
