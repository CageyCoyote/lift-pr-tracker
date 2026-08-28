<script setup>
import { useSettingsStore } from '../../stores/settings'
import SettingsSection from '../common/SettingsSection.vue'

const settingsStore = useSettingsStore()
</script>

<template>
  <SettingsSection title="Sound">
    <label class="toggle-row">
      <div class="toggle-copy">
        <span class="toggle-label">Celebration sounds</span>
        <span class="toggle-note">Plays a fanfare for new PRs and goals reached.</span>
      </div>
      <span
        class="switch"
        role="switch"
        :aria-checked="settingsStore.soundEnabled"
      >
        <input
          type="checkbox"
          :checked="settingsStore.soundEnabled"
          @change="settingsStore.setSoundEnabled($event.target.checked)"
        />
        <span class="switch-track">
          <span class="switch-thumb" />
        </span>
      </span>
    </label>
  </SettingsSection>
</template>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.toggle-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.toggle-label {
  font-size: 14px;
  color: var(--color-text);
}

.toggle-note {
  font-size: 12px;
  color: var(--color-text-dim);
}

.switch {
  position: relative;
  flex-shrink: 0;
  display: inline-block;
  width: 44px;
  height: 26px;
}

.switch input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}

.switch-track {
  position: absolute;
  inset: 0;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-text-dim);
  transition: transform 0.15s ease, background 0.15s ease;
}

.switch input:checked ~ .switch-track {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.switch input:checked ~ .switch-track .switch-thumb {
  transform: translateX(18px);
  background: var(--color-surface);
}

.switch input:focus-visible ~ .switch-track {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>