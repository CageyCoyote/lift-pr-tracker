# PR Tracker

Vue 3 + Vite PWA for tracking personal records across multiple lifters and exercises, plus simple workout planning.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Pinia (state, persisted to `indexedDB`)
- Vue Router
- vite-plugin-pwa (offline support, installable)

## Run it

```bash
npm install
npm run dev
```

## Data

- `src/data/exercises.json` — [https://github.com/yuhonas/free-exercise-db] pulled exercise library.
- Everything else (people, PRs, planned workouts) is stored in the browser's ` indexedDB`, keyed under `pr-tracker:*`. No backend yet.

## Structure

- `src/stores/` — Pinia stores
- `src/views/` — Main screens (account, library, people, records, workouts)
- `src/components/` — Vue components used by the screens in `views`
- `src/composables/` — Shared composition helpers
- `src/utils/` — IndexedDB storage layer and one-rep-max helpers
- `src/data/` — Exercise library JSON
- `src/router/` — Vue Router routes
