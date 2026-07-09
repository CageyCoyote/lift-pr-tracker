<script setup>
import { onMounted } from 'vue'
import AppNav from './components/common/AppNav.vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

// Apply the saved theme before first render
onMounted(() => settingsStore.applyTheme())
</script>

<template>
  <button
    class="account-btn"
    :style="{ color: settingsStore.iconColor }"
    aria-label="Account & Settings"
    @click="router.push('/account')"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </button>

  <router-view />
  <AppNav />
</template>

<style scoped>
.account-btn {
  position: fixed;
  top: 14px;
  right: 16px;
  z-index: 10;
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}

.account-btn:hover {
  opacity: 0.75;
}
</style>