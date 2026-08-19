<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/', label: 'Records' },
  { to: '/plans', label: 'Plans' },
  { to: '/people', label: 'People' },
  { to: '/library', label: 'Library' }
]

function isActive(to) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const activeIndex = computed(() => {
  const i = tabs.findIndex(t => isActive(t.to))
  return i === -1 ? 0 : i
})
</script>

<template>
  <nav class="app-nav">
    <div
      class="nav-indicator"
      :style="{ transform: `translateX(${activeIndex * 100}%)`, width: `${100 / tabs.length}%` }"
    />
    <router-link
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="nav-item"
      :class="{ active: isActive(t.to) }"
    >
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

.nav-indicator {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--color-accent);
  transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
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
  -webkit-tap-highlight-color: transparent;
}

.nav-item:active .nav-label {
  transform: scale(0.92);
}

.nav-label {
  transition: transform 0.15s ease, color 0.15s ease;
}

.nav-mark {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transition: background-color 0.15s ease, transform 0.2s ease;
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item.active .nav-mark {
  background: var(--color-accent);
  animation: nav-mark-pop 0.25s ease-out;
}

@keyframes nav-mark-pop {
  0% {
    transform: scale(0.4);
  }
  60% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}
</style>
