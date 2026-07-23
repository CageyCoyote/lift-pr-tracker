<script setup>
import { useSettingsStore, ICON_COLORS } from '../../stores/settings'
import { useCurrentUser } from '../../composables/useCurrentUser'
import SettingsSection from '../common/SettingsSection.vue'

const settingsStore = useSettingsStore()
const { userId, activeUser } = useCurrentUser()
</script>

<template>
  <SettingsSection title="Icon Color">
    <template #subtitle v-if="activeUser">{{ activeUser.name }}</template>
    <div class="swatch-grid">
      <button v-for="c in ICON_COLORS" :key="c.hex" class="swatch"
        :class="{ selected: settingsStore.getIconColor(userId) === c.hex }" :style="{ '--swatch': c.hex }"
        :aria-label="c.label" :title="c.label" :disabled="!userId" @click="settingsStore.setIconColor(userId, c.hex)">
        <span class="swatch-dot" />
        <span class="swatch-label">{{ c.label }}</span>
      </button>
    </div>
  </SettingsSection>
</template>

<style scoped>
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.swatch.selected {
  background: var(--swatch);
  border-color: var(--swatch);
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--swatch);
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--swatch) 60%, var(--color-border));
}

/* Hide dot when selected — the whole card is already the colour */
.swatch.selected .swatch-dot {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
}

.swatch-label {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text);
  flex: 1;
  text-align: left;
}

.swatch.selected .swatch-label {
  color: #fff;
}
</style>
