<script setup>
import { onMounted } from 'vue'
import AppNav from './components/common/AppNav.vue'
import InstallBanner from './components/common/InstallBanner.vue'
import PrCelebration from './components/common/PrCelebration.vue'
import UndoToast from './components/common/UndoToast.vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import { useCurrentUser } from "./composables/useCurrentUser.js";

const router = useRouter()
const settingsStore = useSettingsStore()
const {userId} = useCurrentUser()

onMounted(() => {
  settingsStore.applyTheme()

  // Trigger the .btn-accent pulse via JS instead of :active, since :active
  // is unreliable on mobile taps (often skipped, or cut short when the
  // finger lifts before the animation finishes).
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-accent')
    if (!btn) return
    btn.classList.remove('btn-pulse')
    // Force reflow so the animation restarts if clicked again quickly
    void btn.offsetWidth
    btn.classList.add('btn-pulse')
    btn.addEventListener('animationend', () => btn.classList.remove('btn-pulse'), { once: true })
  })
})
</script>

<template>
  <button
    class="account-btn"
    :style="{ color: settingsStore.effectiveIconColor(userId) }"
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
  <InstallBanner />
  <PrCelebration />
  <UndoToast />
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