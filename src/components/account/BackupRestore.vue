<script setup>
import { ref } from 'vue'
import { exportAllData, restoreAllData } from '../../utils/storage'
import SettingsSection from '../common/SettingsSection.vue'

const APP_TAG = 'pr-tracker'
const BACKUP_VERSION = 1

const fileInput = ref(null)
const status = ref(null) // null | { type: 'error' | 'success', message }

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function exportBackup() {
  const backup = {
    app: APP_TAG,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: exportAllData(),
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pr-tracker-backup-${todayStamp()}.json`
  a.click()
  URL.revokeObjectURL(url)

  status.value = { type: 'success', message: 'Backup downloaded.' }
}

function pickRestoreFile() {
  status.value = null
  fileInput.value?.click()
}

async function handleFileChosen(e) {
  const file = e.target.files?.[0]
  e.target.value = '' // allow re-selecting the same file next time
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    if (parsed?.app !== APP_TAG || !parsed?.data) {
      status.value = { type: 'error', message: "That doesn't look like a PR Tracker backup file." }
      return
    }

    const keyCount = Object.keys(parsed.data).length
    const confirmed = confirm(
      `Restore this backup from ${parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString() : 'an unknown date'}?\n\n` +
      `This will overwrite EVERYTHING, your current people, PRs, history, workouts, and settings on this device (${keyCount} item${keyCount === 1 ? '' : 's'}). This can't be undone.`
    )
    if (!confirmed) return

    await restoreAllData(parsed.data)

    // Every store initialized its reactive state from storage at app boot —
    // just writing to storage won't update those refs already in memory,
    // so a reload is the simplest reliable way to bring everything in
    // sync with the restored data. restoreAllData() above is awaited, so
    // the underlying IndexedDB writes are guaranteed to have landed before
    // we reload — otherwise the reload could race ahead of the writes and
    // the restore would silently under-apply.
    window.location.reload()
  } catch (err) {
    console.error('[backup] Restore failed:', err)
    status.value = { type: 'error', message: "Couldn't read that file — is it a valid backup?" }
  }
}
</script>

<template>
  <SettingsSection title="Backup & Restore">
    <p class="section-note">
      Save a full copy of your people, PRs, workouts, and settings — or restore from a previous backup.
    </p>

    <div class="backup-row">
      <button class="export-btn" @click="exportBackup">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export Backup
      </button>

      <button class="export-btn restore-btn" @click="pickRestoreFile">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 9v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4" />
          <polyline points="7 14 12 9 17 14" />
          <line x1="12" y1="9" x2="12" y2="21" />
        </svg>
        Restore from File
      </button>
      <input ref="fileInput" type="file" accept="application/json,.json" class="file-input" @change="handleFileChosen" />
    </div>

    <p v-if="status" class="status-note" :class="status.type">
      {{ status.message }}
    </p>
  </SettingsSection>
</template>

<style scoped>
.section-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin: 0 0 14px;
  line-height: 1.5;
}

.backup-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--color-text);
  font-size: 14px;
  font-family: var(--font-body);
  font-weight: 500;
  text-align: left;
  transition: border-color 0.15s ease;
}

.export-btn:hover {
  border-color: var(--color-accent);
}

.restore-btn:hover {
  border-color: var(--color-danger);
}

.file-input {
  display: none;
}

.status-note {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
}

.status-note.success {
  color: var(--color-green);
}

.status-note.error {
  color: var(--color-danger);
}
</style>