import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const ICON_COLORS = [
  { label: 'Energy',   hex: '#c9a227' },
  { label: 'Steel',    hex: '#5b7a8c' },
  { label: 'Stealth',  hex: '#383838' },
  { label: 'Pump',     hex: '#c1443c' },
  { label: 'Recovery', hex: '#4a9e6b' },
  { label: 'Chalk',    hex: '#ece9e2' },
]

export const useSettingsStore = defineStore('settings', () => {
  const iconColor = ref(load('settings.iconColor', '#c9a227'))
  const theme = ref(load('settings.theme', 'dark'))

  watch(iconColor, (v) => save('settings.iconColor', v))
  watch(theme, (v) => {
    save('settings.theme', v)
    document.documentElement.setAttribute('data-theme', v)
  })

  function setIconColor(hex) {
    iconColor.value = hex
  }

  function setTheme(t) {
    theme.value = t
  }

  // Apply persisted theme immediately on store init
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return { iconColor, theme, setIconColor, setTheme, applyTheme }
})