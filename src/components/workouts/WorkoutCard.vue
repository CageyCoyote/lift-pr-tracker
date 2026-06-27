<script setup>
defineProps({
  title: { type: String, required: true },
  muscles: { type: Object, default: () => { return { primary: [], secondary: [] } } },
  count: { type: Number, default: 0 }
})

</script>

<template>
  <div class="workout-card">
    <div class="workout-top">
      <span class="workout-title">{{ title }}</span>
      <span class="workout-count">{{ count }} exercise{{ count === 1 ? '' : 's' }}</span>
    </div>
    <div class="muscle-row">
      <span v-for="pm in muscles.primary" :key="pm" class="muscle-chip primary">{{ pm }}</span>
      <span v-for="sm in muscles.secondary" :key="sm" class="muscle-chip secondary">{{ sm }}</span>
      <span v-if="muscles.primary.size + muscles.secondary.size === 0" class="muscle-empty">No exercises yet</span>
    </div>
  </div>
</template>

<style scoped>
.workout-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workout-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.workout-title {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 0.01em;
  color: var(--color-text);
}

.workout-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
  white-space: nowrap;
}

.muscle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.muscle-chip {
  font-size: 11px;
  text-transform: capitalize;
  padding: 3px 9px;
  border-radius: 999px;
}

.muscle-chip.primary {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-accent);
}

.muscle-chip.secondary {
  background: color-mix(in srgb, var(--color-steel) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-steel) 70%, transparent);
  color: var(--color-steel);
}

.muscle-empty {
  font-size: 12px;
  color: var(--color-text-dim);
}
</style>
