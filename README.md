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

- **Members** — add and remove players.
- **Events** — schedule rounds with a title, date, and optional location.
- **Attendance** — select an event and mark each member's status. Live counts
  show how many are present, maybe, absent, or yet to respond.
- **Persistence** — everything is saved to the browser automatically.

## Project structure

```
src/
  components/
    Members.tsx      # add / list / remove members
    Events.tsx       # add / list / select / remove events
    Attendance.tsx   # mark attendance for the selected event
  types.ts           # shared data model
  storage.ts         # localStorage load/save helpers
  useAppState.ts     # state hook wiring it all together
  App.tsx            # layout and composition
  main.tsx           # entry point
```

## Ideas for next steps

- Export/import data as JSON or CSV.
- Group members into teams or handicap tiers.
- Add a backend + auth to share across devices.
- Attendance history and per-member stats.
