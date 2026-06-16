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


## Data
- `src/data/exercises.json` — [https://github.com/yuhonas/free-exercise-db] pulled exercise library.
- Everything else (people, PRs, planned workouts) is stored in the browser's `localStorage`, keyed under `pr-tracker:*`. No backend.

## Structure
- `src/stores/` — Pinia stores: `people`, `exercises`, `records` (the PRs), `workouts` (saved workout templates)
- `src/views/` — `RecordsView` (PRs, the priority feature), `WorkoutsListView` (`/plan` — titles + targeted muscles), `PlanWorkoutView` (`/plan/:id` — edit one workout's exercise list), `PeopleView`
- `src/components/` — `PRForm` (log a lift), `PRCard`, `WorkoutCard`, `ExercisePicker`, `PersonSelector`, `PlateBadge`, `AppNav`
