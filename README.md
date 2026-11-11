# PR Tracker

Vue 3 + Vite PWA for tracking personal records (PRs) across multiple lifters and exercises, setting goals, planning workouts, and sharing PRs/workouts between devices. Fully offline, local-first, with no backend.

**Current version:** 0.8.0 (see `package.json` and `src/version.js`)

## Features

- **Records** – log PRs per person/exercise, view history and a timeline chart, edit/delete with undo
- **Goals** – one target per person/exercise (weight or reps), with a distinct celebration when a goal is crossed
- **Plans** – build ordered workouts from the exercise library; see targeted muscles
- **People** – track multiple lifters (e.g. a coach and athletes) with a person switcher
- **Exercise Library** – 873 exercises with filters, favourites, and detail pages
- **Calculators** – 1RM, plate math, lb/kg converter, working-load table
- **Sharing** – share a PR via link/text/QR, share a workout via QR; scan/paste to import
- **Account** – themes, icon colours, sound toggle, backup/restore, data export, PWA install

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Pinia (setup-style stores, persisted to IndexedDB)
- Vue Router 5
- Vite 8 + `vite-plugin-pwa` (offline support, installable)
- `qrcode` (QR generation), `@zxing/browser` + `@zxing/library` (QR scanning)
- `unique-names-generator` (share IDs)

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (service worker enabled in dev)
npm run dev-host     # dev server exposed on your LAN (test on a phone)
npm run build        # production build to dist/
npm run preview      # serve the production build locally
npm run deploy       # publish dist/ to GitHub Pages (gh-pages)
npm run build-deploy # build, then publish
```

### Environment

Copy `.env.example` to `.env` if you need a non-root base path. Vite reads `VITE_BASE_URL` for the build base, router base, and PWA `start_url`/`scope`.

```
VITE_BASE_URL = '/'
```

For GitHub Pages, set it to the repo path, e.g. `/lift-pr-tracker/`. (`.env.example` also contains a legacy `VUE_APP_BASE_URL` line that Vite ignores.)

## Directory Structure

```
pr_tracker/
├── vite.config.js             # Vite + PWA manifest/workbox config
├── public/
│   ├── robots.txt
│   └── icons/                 # PWA, maskable, apple-touch, favicon
└── src/
    ├── version.js             # APP_VERSION
    ├── router/                # routes + first-launch guard
    ├── stores/                # Pinia stores (see Data Model)
    ├── views/
    │   ├── records/           # Records, PRTimeline
    │   ├── workouts/          # WorkoutsList, WorkoutDetail, WorkoutEdit
    │   ├── people/            # People
    │   ├── library/           # ExerciseLibrary, ExerciseDetail
    │   ├── calculators/       # SelectCalc, OneRepMax, PlateMath, Converter, WorkingLoadTable
    │   └── account/           # Account, Welcome (first-launch onboarding)
    ├── components/
    │   ├── records/           # PRCard, PRForm/New/Edit/Search, PRChart, PRShareSheet, GoalForm/GoalNewForm
    │   ├── workouts/          # WorkoutCard, WorkoutQRSheet (share + scan)
    │   ├── exercises/         # ExerciseCard, ExercisePicker
    │   ├── account/           # BackupRestore, DataExport, ThemePicker, IconColorPicker,
    │   │                      # SoundSettings, InstallSection, AccountSection
    │   └── common/            # AppNav, PersonSelector, FavoriteStar, UndoToast, InstallBanner,
    │                          # PrCelebration, GoalCelebration, PlateCelebrationAnimation,
    │                          # PlateBadge, SvgPlate, SettingsSection
    ├── composables/
    │   ├── useCurrentUser.js        # primary vs. active person (auth seam)
    │   ├── useSharePR.js            # encode/share PR payloads
    │   ├── useImportPR.js           # decode/import PR payloads
    │   ├── usePrCelebration.js
    │   ├── useGoalCelebration.js
    │   ├── useUndoToast.js
    │   └── useInstallPrompt.js
    ├── utils/
    │   ├── storage.js               # IndexedDB layer + sync cache, backup/restore
    │   ├── oneRepMax.js             # 1RM estimation
    │   └── exerciseIdMigration.js   # legacy slug ID → ex_### mapping
    └── data/
        ├── new-exercises.json       # ACTIVE exercise library (ex_### IDs)
        └── exercises.json           # original upstream library (slug IDs), not imported by the app
```

### Routes

| Path | Name | View |
| --- | --- | --- |
| `/welcome` | `welcome` | First-launch onboarding |
| `/` | `records` | Records |
| `/records/:exerciseId/timeline` | `pr-timeline` | PR timeline/chart |
| `/plans` | `workouts` | Workout list |
| `/plans/:id` | `plan-detail` | Workout detail |
| `/plans/:id/edit` | `edit-plan` | Workout editor |
| `/people` | `people` | People manager |
| `/calculators` | `calcs` | Calculator picker |
| `/calculators/1repmax` · `/platemath` · `/lbsconverter` · `/workingloadtable` | — | Individual calculators |
| `/library` | `library` | Exercise library |
| `/library/:id` | `exercise-detail` | Exercise detail |
| `/account` | `account` | Settings, backup, install |

A router guard redirects to `/welcome` when no people exist yet. Routes marked `skipGuard` (welcome, people, calculators, library) and `/account` are exempt.

## Data Model Reference

### Storage

All user data lives in the browser's IndexedDB (database `pr-tracker`, object store `kv`). Each store persists to a key prefixed with `pr-tracker:`.

`src/utils/storage.js` keeps an in-memory cache so stores can call `load(key, fallback)` synchronously. `initDB()` must finish before the app mounts (handled in `main.js`). `save(key, value)` updates the cache immediately and writes asynchronously, returning a promise. If IndexedDB is unavailable it falls back to `localStorage`. A one-time `localStorage` → IndexedDB migration runs on first boot.

| Storage key | Store | Shape |
| --- | --- | --- |
| `people` | people | `Person[]` |
| `activePersonId` | people | `string \| null` |
| `entries` | records | `Entry[]` |
| `goals` | goals | `Goal[]` |
| `workouts` | workouts | `Workout[]` |
| `favourites` | favourites | `string[]` (exercise IDs) |
| `contacts` | contacts | `{ [remoteShareId]: localPersonId }` |
| `settings.personIconColors` | settings | `{ [personId]: hex }` |
| `settings.theme` | settings | `string` (default `'steel'`) |
| `settings.soundEnabled` | settings | `boolean` (default `true`) |

> **Note:** `settings.soundEnabled` is persisted but is **not** in `ALL_KEYS` in `storage.js`, so it is currently excluded from backup/restore and from the initial cache warm-up. `settings.iconColor` is in `ALL_KEYS` but is a legacy key no store writes to anymore.

### Person (`people`)

```js
{
  id: string,          // crypto.randomUUID()
  name: string,
  isPrimary: boolean,  // the account owner; exactly one; cannot be deleted
  shareId: string|null // e.g. "brave_otter_042"; auto-generated for primary,
                       // generated on first share or set on import for others
}
```

- The primary person is flagged at first launch (existing installs are migrated: the first person becomes primary).
- A person cannot be deleted if they are primary or the last remaining person.
- Deleting a person cascades: removes their entries, goals, contact mappings, and icon colour.

### Entry (`entries`) – one logged lift

```js
{
  id: string,
  personId: string,        // → Person.id
  exerciseId: string,      // → Exercise.id (ex_###)
  exerciseName: string,    // denormalised so imports/unknown IDs still display
  weight: number,
  reps: number,            // defaults to 1; 0 allowed
  unit: 'lb' | 'kg' | 'bodyweight',
  date: 'YYYY-MM-DD',
  importedFrom?: string,   // sender's shareId; only on imported entries
  goalMetTarget?: number   // set on the single entry that crossed a goal
}
```

- **Best-entry metric:** `reps` for `bodyweight`, otherwise `weight`; ties broken by higher reps.
- `addEntry` returns `{ entry, isNewBest, previousBest, goalJustMet }` to drive celebrations.
- `goalMetTarget` is stamped on the entry because goals are not versioned. It lets the chart permanently mark the lift that hit the target, even after the goal changes or is removed.
- `restoreEntry` (used by undo) re-inserts an entry as-is without re-running PR detection.

### Goal (`goals`) – one target per person/exercise

```js
{
  id: string,
  personId: string,
  exerciseId: string,
  unit: 'lb' | 'kg' | 'bodyweight',
  targetWeight: number|null,  // weighted exercises
  targetReps: number|null     // bodyweight exercises
}
```

Only one goal exists per `(personId, exerciseId)`; setting a new one replaces it.

### Workout (`workouts`)

```js
{
  id: string,
  title: string,
  items: [
    { id: string, exerciseId: string, exerciseName: string }  // ordered
  ],
  // Present on imported workouts only:
  shareId?: null,
  createdAt?: ISOString,
  updatedAt?: ISOString
}
```

`items` order is the exercise sequence. Reordering uses `moveUp`/`moveDown`, and `restoreItem`/`restoreWorkout` re-insert at the original index for undo.

### Exercise (static, `src/data/new-exercises.json`)

Read-only library (873 entries) loaded by the exercises store; not persisted per user. Derived from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db).

```js
{
  id: 'ex_000',            // current stable ID used everywhere in user data
  oldExId: '3_4_Sit-Up',   // legacy slug ID, used for migration
  name: string,
  aka?: string[],
  category: string,
  equipment: string|null,
  force: string|null,
  level: string,
  mechanic: string|null,
  primaryMuscles: string[],
  secondaryMuscles: string[],
  instructions: string[],
  images: string[]         // relative paths; loaded from the free-exercise-db raw GitHub URL
}
```

Exercise images are **not bundled**. They are fetched at runtime from `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`.

### Legacy exercise ID migration

Entries, goals, and workout items created before the `ex_###` scheme may carry slug IDs. On each boot, stores remap any ID found in the `oldExId → id` map (built from `new-exercises.json`) and persist the result. This is safe to repeat; it only touches legacy IDs.

### Contacts (`contacts`)

Maps a **remote** person's `shareId` to a **local** `personId`, so repeat imports from the same sender auto-attach to the right person. Mappings are re-keyed when a shareId changes and removed when the person is deleted.

### Settings

- `personIconColors`: per-person icon colour. Options: Energy, Steel, Stealth, Pump, Recovery, Chalk (default Energy `#c9a227`). A few theme/colour combos that would be illegible are overridden at render time.
- `theme`: applied to `<html data-theme="…">`.
- `soundEnabled`: audio only (PR fanfare, goal/plate celebration). Haptics are unaffected.

### Entity relationships

```
Person 1 ──< Entry >── 1 Exercise (static)
Person 1 ──< Goal  >── 1 Exercise
Workout 1 ──< Item  >── 1 Exercise
Person ── iconColor (settings)        Favourites ──> Exercise
Contacts: remote shareId ──> Person
```

## Sharing Formats

Payloads are colon-delimited strings (QR/paste friendly):

| Type | Format |
| --- | --- |
| PR | `PRK:PR:1:<shareId>:<personName>:<exerciseId>:<weight>:<unit>:<reps>:<date>` |
| Workout | `PRK:1:<title>:<exerciseId>,<exerciseId>,…` (max 20 exercises) |

- The PR payload identifies the **owner of the PR** (not necessarily the active user), via their `shareId`.
- On import, a known `shareId` auto-imports to the mapped person. An unknown one prompts the user to pick an existing person or create a new one, and then stores the mapping.
- Imported entries are tagged with `importedFrom`; `reassignImportedEntries` can repair a wrong-person import.
- The share sheet can also build a link (`?d=<payload>`). **The app does not currently read `?d=` on load**, so links are generated but not auto-imported; scan/paste the code instead.

## Backup & Restore

`exportAllData()` returns a `{ key: value }` snapshot of every key in `ALL_KEYS` that has data. `restoreAllData()` writes known keys back and ignores unknown ones. These are used by **Account → Backup & Restore**. See the note above about `settings.soundEnabled`.

## PWA

Configured in `vite.config.js`: auto-updating service worker (also enabled in dev), precached app shell, runtime-cached Google Fonts, installable manifest with maskable icon, portrait/standalone. The workbox precache limit is raised to 4 MB because `@zxing/library` makes the main chunk large.

## Roadmap Notes

- `useCurrentUser` is the single seam for swapping in real authentication later.
- No backend yet; all data is device-local. Use Backup/Restore to move data between devices.