<script setup>
defineProps({
  weight: { type: [Number, String], required: true },
  unit: { type: String, default: 'lb' },
  size: { type: Number, default: 64 }
})
</script>

<template>
  <div class="plate" :style="{ width: size + 'px', height: size + 'px' }">
    <span class="plate-weight">{{ weight }}</span>
    <span class="plate-unit">{{ unit }}</span>
  </div>
</template>

<style scoped>
.plate {
  border-radius: 50%;
  border: 3px solid var(--color-accent);
  background: radial-gradient(circle at 35% 30%, var(--color-surface-2), var(--color-surface));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plate-weight {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 18px;
  color: var(--color-text);
  line-height: 1;
}

.plate-unit {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-dim);
  text-transform: uppercase;
}
</style>
