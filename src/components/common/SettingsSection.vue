<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <section class="section">
    <h2 class="section-title">
      {{ title }}
      <span v-if="$slots.subtitle" class="section-person">
        — <slot name="subtitle" />
      </span>
    </h2>
    <slot />
  </section>
</template>

<style scoped>
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-dim);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
}

.section-person {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-dim);
}

.section-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin: 0 0 14px;
  line-height: 1.5;
}
</style>
