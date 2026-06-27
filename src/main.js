import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initDB } from './utils/storage'
import './style.css'

// Initialise IndexedDB and migrate localStorage data before
// any store boots — stores call load() synchronously so the
// cache must be warm before createApp() runs.
initDB().finally(() => {
  createApp(App).use(createPinia()).use(router).mount('#app')
})