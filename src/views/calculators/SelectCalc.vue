<script setup>
const calculators = [
  {
    to: '/calculators/1repmax',
    label: 'One Rep Max',
    desc: 'Estimate your max from a set',
    icon: ['<polyline points="3 17 9 11 13 15 21 7"/>', '<polyline points="15 7 21 7 21 13"/>']
  },
  {
    to: '/calculators/platemath',
    label: 'Plate Math',
    desc: 'Add up the plates on the bar',
    icon: ['<circle cx="12" cy="12" r="9"/>', '<circle cx="12" cy="12" r="3.5"/>']
  },
  {
    to: '/calculators/lbsconverter',
    label: 'Lb / Kg',
    desc: 'Convert between pounds and kilos',
    icon: [
      '<polyline points="17 1 21 5 17 9"/>',
      '<path d="M3 11V9a4 4 0 0 1 4-4h14"/>',
      '<polyline points="7 23 3 19 7 15"/>',
      '<path d="M21 13v2a4 4 0 0 1-4 4H3"/>'
    ]
  },
  {
    to: '/calculators/workingloadtable',
    label: 'Load Table',
    desc: 'Working weights as a % of your max',
    icon: [
      '<rect x="3" y="4" width="18" height="16" rx="2"/>',
      '<line x1="3" y1="10" x2="21" y2="10"/>',
      '<line x1="3" y1="15" x2="21" y2="15"/>',
      '<line x1="9" y1="10" x2="9" y2="20"/>'
    ]
  }
]
</script>

<template>
  <div class="page">
    <header class="page-header">
      <span class="eyebrow">Tools</span>
      <h1>Calculators</h1>
    </header>

    <div class="calc-list">
      <router-link v-for="c in calculators" :key="c.to" :to="c.to" class="card">
        <div class="calc-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            v-html="c.icon.join('')"
          />
        </div>
        <div class="card-text">
          <span class="calc-label">{{ c.label }}</span>
          <span class="calc-desc">{{ c.desc }}</span>
        </div>
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.calc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  color: var(--color-text);
  text-decoration: none;
  touch-action: manipulation;
  transition: border-color 0.15s ease, transform 0.12s ease;
}

.card:hover {
  border-color: var(--color-accent);
}

.card:active {
  transform: scale(0.98);
}

.calc-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 38%, transparent);
}

.card-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calc-label {
  font-weight: 600;
  font-size: 15px;
}

.chevron {
  flex-shrink: 0;
  color: var(--color-text-dim);
}

.calc-desc {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-dim);
}
</style>