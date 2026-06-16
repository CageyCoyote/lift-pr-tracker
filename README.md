# PR Tracker

Vue 3 + Vite PWA for tracking personal records across multiple lifters and exercises, plus simple workout planning.

## Stack
- Vue 3 (Composition API, `<script setup>`)
- Pinia (state, persisted to `localStorage`)
- Vue Router
- vite-plugin-pwa (offline support, installable)

## Run it
```bash
npm install
npm run dev
```
Build for production:
```bash
npm run build
npm run preview
```

## Data
- `src/data/exercises.json` — exercise library, in the format you provided (name, equipment, primaryMuscles, etc). **Replace this file with your full dataset** — same shape, same path, no code changes needed.
- Everything else (people, PRs, planned workouts) is stored in the browser's `localStorage`, keyed under `pr-tracker:*`. No backend.

## Structure
- `src/stores/` — Pinia stores: `people`, `exercises`, `records` (the PRs), `workouts` (saved workout templates)
- `src/views/` — `RecordsView` (PRs, the priority feature), `WorkoutsListView` (`/plan` — titles + targeted muscles), `PlanWorkoutView` (`/plan/:id` — edit one workout's exercise list), `PeopleView`
- `src/components/` — `PRForm` (log a lift), `PRCard`, `WorkoutCard`, `ExercisePicker`, `PersonSelector`, `PlateBadge`, `AppNav`

## Notes
- "PR" per person/exercise = the entry with the highest weight (ties broken by reps). Full history is kept and viewable by expanding a PR card; you can delete individual entries.
- Workouts are named templates (e.g. "Push Day"). Tapping one in the list opens its editor where you add/reorder/remove exercises, rename, or delete the whole workout. The targeted-muscles chips on each list card are derived automatically from the primary muscles of its exercises.
- The editor's "Log" button opens the PR form pre-filled with that exercise, for the currently selected person.
- Icons are a single SVG (`public/icons/icon.svg`), referenced as `any maskable` in the manifest — swap in real app icons before shipping if you want raster PNGs.
