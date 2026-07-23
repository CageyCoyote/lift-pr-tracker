<script setup>
import { useInstallPrompt } from '../../composables/useInstallPrompt'
import SettingsSection from '../common/SettingsSection.vue'

const { canInstall, isIOS, isInstalled, promptInstall } = useInstallPrompt()
</script>

<template>
  <SettingsSection title="App">
    <!-- Already installed as PWA -->
    <div v-if="isInstalled" class="install-row installed">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>Installed on this device</span>
    </div>

    <!-- Android / Chrome — native prompt available -->
    <div v-else-if="canInstall" class="install-row">
      <div class="install-text">
        <span class="install-label">Add to Home Screen</span>
        <span class="install-sub">Install for the best offline experience</span>
      </div>
      <button class="btn btn-accent install-btn" @click="promptInstall">Install</button>
    </div>

    <!-- iOS Safari — manual steps -->
    <div v-else-if="isIOS" class="install-row">
      <div class="install-text">
        <span class="install-label">Add to Home Screen</span>
        <span class="install-sub">
          Tap
          <svg class="share-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          then "Add to Home Screen"
        </span>
      </div>
    </div>

    <!-- Not installable — unsupported browser or prompt already dismissed -->
    <div v-else class="install-row muted">
      <span class="install-sub">Open in Chrome/Edge/Brave to install on desktop, or Safari on iOS</span>
    </div>
  </SettingsSection>
</template>

<style scoped>
.install-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
}

.install-row.installed {
  color: var(--color-green);
  font-size: 14px;
  gap: 10px;
  justify-content: flex-start;
}

.install-row.muted {
  justify-content: flex-start;
}

.install-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.install-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.install-sub {
  font-size: 12px;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.install-btn {
  padding: 9px 16px;
  font-size: 13px;
  flex-shrink: 0;
}

.share-icon-inline {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--color-steel);
}
</style>
