// storage.js — IndexedDB-backed store with a synchronous-read cache.
// Stores call load() synchronously (same API as before).
// initDB() must be awaited in main.js before createApp() so the cache is warm.

const PREFIX = 'pr-tracker:'
const DB_NAME = 'pr-tracker'
const DB_VERSION = 1
const STORE_NAME = 'kv'

// Keys that live in this app's storage
export const ALL_KEYS = ['people', 'activePersonId', 'entries', 'workouts', 'settings.iconColor', 'settings.theme', 'settings.personIconColors', 'favourites', 'contacts']

// In-memory cache — populated during initDB(), kept in sync on every save()
const cache = {}

let db = null

// ── IndexedDB helpers ──────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

function idbGet(key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(PREFIX + key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

function idbSet(key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    // JSON round-trip strips Vue's Proxy wrappers — IDB structured clone
    // can't handle reactive proxies and will throw a DataCloneError without this
    const plain = JSON.parse(JSON.stringify(value))
    const req = tx.objectStore(STORE_NAME).put(plain, PREFIX + key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ── One-time localStorage → IndexedDB migration ────────────────────────────

async function migrateFromLocalStorage() {
  const migrated = await idbGet('__migrated__')
  if (migrated) return

  console.info('[storage] Migrating localStorage → IndexedDB…')
  let count = 0
  let failed = 0

  for (const key of ALL_KEYS) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw !== null) {
        await idbSet(key, JSON.parse(raw))
        count++
      }
    } catch (e) {
      failed++
      console.error(`[storage] Failed to migrate key "${key}" — will retry on next launch:`, e)
    }
  }

  if (failed === 0) {
    // Only mark complete when every key succeeded.
    // If any failed, we leave the flag unset so the next app launch retries.
    await idbSet('__migrated__', true)
    console.info(`[storage] Migration complete — ${count} key(s) moved.`)
  } else {
    console.warn(`[storage] Migration partial — ${count} succeeded, ${failed} failed. Will retry on next launch.`)
  }
}

// ── Public init — call once in main.js before createApp() ─────────────────

export async function initDB() {
  try {
    db = await openDB()
    await migrateFromLocalStorage()

    // Warm the synchronous cache
    for (const key of ALL_KEYS) {
      const value = await idbGet(key)
      if (value !== null) cache[key] = value
    }
  } catch (e) {
    console.error('[storage] IndexedDB unavailable, falling back to localStorage:', e)
    db = null // load()/save() will fall back gracefully
  }
}

// ── Store API — same signatures as before ─────────────────────────────────

export function load(key, fallback) {
  if (key in cache) return cache[key]

  // IDB not available — fall back to localStorage
  if (!db) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }

  return fallback
}

export function save(key, value) {
  cache[key] = value // keep cache in sync immediately

  if (db) {
    idbSet(key, value).catch((e) =>
      console.warn(`[storage] Failed to save "${key}":`, e)
    )
  } else {
    // Fallback to localStorage if IDB is unavailable
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // storage full — data stays in memory via cache
    }
  }
}

// ── Full-app backup/restore ────────────────────────────────────────────────
// Used by the Account page's Backup & Restore section. Operates on whatever
// keys are actually present (i.e. have been saved at least once) — a key a
// person never touched (e.g. no favourites yet) is simply omitted rather
// than forced into the backup with a guessed default.

// Returns a plain { [key]: value } snapshot of every known storage key that
// currently has data. Safe to JSON.stringify directly.
export function exportAllData() {
  const data = {}
  for (const key of ALL_KEYS) {
    if (key in cache) {
      data[key] = cache[key]
    }
  }
  return data
}

// Writes every key from a previously-exported snapshot back into storage.
// Unknown keys (e.g. from a newer app version) are ignored rather than
// blindly trusted. Does NOT touch keys missing from the snapshot — callers
// that want a full reset should clear storage themselves first.
// Returns the list of keys actually written.
export function restoreAllData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Backup file is missing its data.')
  }

  const written = []
  for (const key of ALL_KEYS) {
    if (key in data) {
      save(key, data[key])
      written.push(key)
    }
  }
  return written
}