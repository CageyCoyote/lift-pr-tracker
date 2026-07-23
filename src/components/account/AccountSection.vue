<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { usePeopleStore } from '../../stores/people'
import { useCurrentUser } from '../../composables/useCurrentUser'
import SettingsSection from '../common/SettingsSection.vue'

const settingsStore = useSettingsStore()
const peopleStore = usePeopleStore()
const { userId, activeUser } = useCurrentUser()

const switcherOpen = ref(false)

const shareCodeCopyStatus = ref(null) // null | 'copied' | 'failed'

async function copyShareCode() {
  if (!activeUser.value?.shareId) return
  try {
    await navigator.clipboard.writeText(activeUser.value.shareId)
    shareCodeCopyStatus.value = 'copied'
  } catch (e) {
    console.error('Clipboard failed:', e)
    shareCodeCopyStatus.value = 'failed'
  }
  setTimeout(() => (shareCodeCopyStatus.value = null), 1500)
}

// Regenerate is locked by default — requires an explicit unlock tap first
// so an accidental touch on "Generate" doesn't silently change the share
// code out from under someone who already gave it out.
const shareCodeLocked = ref(true)

function toggleShareCodeLock() {
  shareCodeLocked.value = !shareCodeLocked.value
}

function generateShareCode(userId) {
  peopleStore.setShareId(userId)
  // Re-lock immediately after use — each regeneration needs its own
  // deliberate unlock, rather than the sheet staying open indefinitely.
  shareCodeLocked.value = true
}
</script>

<template>
  <SettingsSection title="Account">
    <button v-if="activeUser" class="active-person" @click="switcherOpen = true">
      <div class="person-avatar" :style="{ background: settingsStore.effectiveIconColor(userId) }">
        {{ activeUser.name.charAt(0).toUpperCase() }}
      </div>
      <div class="person-info">
        <span class="eyebrow">Active lifter</span>
        <span class="person-name">{{ activeUser.name }}</span>
      </div>
      <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
    <div v-else class="no-person-note">
      No active person selected. <router-link to="/people">Add one →</router-link>
    </div>

    <!-- share code (display only, outside clickable area) -->
    <div v-if="activeUser && activeUser.shareId" class="share-code-display">
      <span class="share-label">Share Code:</span>
      <span class="share-id">{{ activeUser.shareId }}</span>
      <button
        class="share-copy"
        :class="{ copied: shareCodeCopyStatus === 'copied', failed: shareCodeCopyStatus === 'failed' }"
        @click="copyShareCode"
        :aria-label="shareCodeCopyStatus === 'copied' ? 'Copied' : 'Copy share code'"
        :title="shareCodeCopyStatus === 'copied' ? 'Copied!' : 'Copy share code'"
      >
        <svg v-if="shareCodeCopyStatus === 'copied'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </div>
    <div v-else class="share-code-display">
      <span class="share-label" @click="generateShareCode(userId)">
        <span class="color-accent bold-link" @click="generateShareCode(userId)">Generate</span> a share code to share {{
          activeUser.name + "'s"}} personal records
      </span>
    </div>

    <!-- Regenerate — locked by default so an accidental tap can't change
         a code that may already be shared with other people. -->
    <div v-if="activeUser && activeUser.shareId" class="regen-row">
      <button
        class="lock-toggle"
        :class="{ unlocked: !shareCodeLocked }"
        @click="toggleShareCodeLock"
        :aria-label="shareCodeLocked ? 'Unlock to regenerate share code' : 'Lock regeneration'"
        :title="shareCodeLocked ? 'Unlock to regenerate share code' : 'Lock regeneration'"
      >
        <svg v-if="shareCodeLocked" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 9.5-2.5" />
        </svg>
      </button>

      <p v-if="shareCodeLocked" class="no-person-note lock-hint">
        Locked — tap the icon to unlock regeneration.
      </p>
      <p v-else class="no-person-note lock-hint">
        click <span class="color-accent bold-link" @click="generateShareCode(userId)">here</span> to generate a new share code.
        <!-- (I) <- add info icon - tap/click shows a tooltip warning users that share codes are unique and changing them requires anyone you shared PRs with to update their share code.  -->
      </p>
    </div>

    <!-- Person switcher sheet -->
    <div v-if="switcherOpen" class="overlay" @click.self="switcherOpen = false">
      <div class="sheet">
        <header class="sheet-header">
          <h3>Switch Lifter</h3>
          <button class="close-btn" @click="switcherOpen = false" aria-label="Close">×</button>
        </header>
        <ul class="switcher-list">
          <li v-for="p in peopleStore.people" :key="p.id">
            <button class="switcher-row" :class="{ active: p.id === userId }"
              @click="peopleStore.setActivePerson(p.id); switcherOpen = false">
              <div class="switcher-avatar" :style="{ background: settingsStore.effectiveIconColor(p.id) }">
                {{ p.name.charAt(0).toUpperCase() }}
              </div>
              <span class="switcher-name">{{ p.name }}</span>
              <svg v-if="p.id === userId" width="16" height="16" viewBox="0 0 24 24" fill="none"
                :stroke="settingsStore.effectiveIconColor(p.id)" stroke-width="2.5" stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </li>
        </ul>
        <router-link to="/people" class="manage-link" @click="switcherOpen = false">
          Manage people →
        </router-link>
      </div>
    </div>
  </SettingsSection>
</template>

<style scoped>
.active-person {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 28px;
  width: 100%;
  text-align: left;
  transition: border-color 0.15s ease;
}

.active-person:hover {
  border-color: var(--color-text-dim);
}

.chevron-icon {
  color: var(--color-text-dim);
  flex-shrink: 0;
  margin-left: auto;
}

/* ── Switcher sheet ── */
.sheet {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.switcher-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.switcher-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--color-text);
  transition: border-color 0.15s ease;
}

.switcher-row.active {
  border-color: var(--color-accent);
}

.switcher-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 17px;
  color: #fff;
  flex-shrink: 0;
}

.switcher-name {
  font-family: var(--font-display);
  font-size: 16px;
  flex: 1;
  text-align: left;
}

.manage-link {
  font-size: 13px;
  color: var(--color-text-dim);
  text-decoration: none;
  text-align: center;
  padding-top: 4px;
}

.manage-link:hover {
  color: var(--color-accent);
}

.person-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
  mix-blend-mode: normal;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.person-name {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text)
}

/* Share code in Account */
.share-code-display {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.share-label {
  opacity: 0.7;
}

.share-id {
  background: var(--color-surface-2);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.share-copy {
  margin-left: auto;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-dim);
}

.share-copy:hover {
  color: var(--color-text);
  border-color: var(--color-text-dim);
}

.share-copy.copied {
  color: var(--color-green);
  border-color: var(--color-green);
}

.share-copy.failed {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.no-person-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin-bottom: 28px;
}

.no-person-note a {
  color: var(--color-accent);
  text-decoration: none;
}

.regen-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.lock-toggle {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-dim);
}

.lock-toggle.unlocked {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.lock-hint {
  margin: 0;
}

.bold-link {
  font-weight: 800;
}
</style>
