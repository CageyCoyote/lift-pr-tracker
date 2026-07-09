<script setup>
import AppNav from './components/common/AppNav.vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()
</script>

<template>
  <div class="profile-row">
    <button
      class="account-btn"
      :style="{ color: settingsStore.iconColor }"
      aria-label="Account & Settings"
      @click="router.push('/account')"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
  </div>
  <router-view />
  <AppNav />
</template>

<style scoped>
.profile-row {
  max-width: 640px;
  margin: 0 auto;
}
.account-btn {
  position: sticky;
  /* top: 130px; */
  /* bottom: 130px; */
  left: 95%;
  /* right: 150px; */
  z-index: 10;
  background: var(--color-bg);
  border: none;
  padding: 14px 4px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}

.account-btn:hover {
  opacity: 0.75;
}
</style>