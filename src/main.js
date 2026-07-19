import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initDB } from './utils/storage'
import './style.css'

// Register the install prompt listener FIRST — before anything else loads.
// beforeinstallprompt fires early; if we wait until a component mounts we miss it.
import { initInstallPrompt } from './composables/useInstallPrompt'
initInstallPrompt()

initDB().finally(() => {
  createApp(App).use(createPinia()).use(router).mount('#app')
})