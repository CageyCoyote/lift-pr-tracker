<script setup>
import { useSettingsStore } from '../../stores/settings'
import SettingsSection from '../common/SettingsSection.vue'

const settingsStore = useSettingsStore()
</script>

<template>
  <SettingsSection title="Theme">
    <div class="theme-toggle">
      <button class="theme-btn" :class="{ active: settingsStore.theme === 'dark' }"
        @click="settingsStore.setTheme('dark')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        Dark
      </button>
      <button class="theme-btn" :class="{ active: settingsStore.theme === 'light' }"
        @click="settingsStore.setTheme('light')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        Light
      </button>
      <button class="theme-btn" :class="{ active: settingsStore.theme === 'steel' }"
        @click="settingsStore.setTheme('steel')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
        Steel
      </button>
    </div>
  </SettingsSection>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  gap: 8px;
  background: var(--color-surface-2);
  border-radius: var(--radius);
  padding: 4px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: none;
  border: none;
  border-radius: 7px;
  padding: 10px;
  font-size: 13px;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-dim);
  transition: background 0.15s ease, color 0.15s ease;
}

.theme-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
