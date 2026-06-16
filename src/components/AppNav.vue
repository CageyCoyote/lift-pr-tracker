<script setup>
const tabs = [
  { to: '/', label: 'Records' },
  { to: '/plan', label: 'Plan' },
  { to: '/people', label: 'People' }
]
</script>

<template>
  <nav class="app-nav">
    <router-link v-for="t in tabs" :key="t.to" :to="t.to" class="nav-item" active-class="active">
      <span class="nav-mark" />
      <span class="nav-label">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 10;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  color: var(--color-text-dim);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.nav-mark {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item.active .nav-mark {
  background: var(--color-accent);
}
</style>
