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

  watch(iconColor, (v) => save('settings.iconColor', v))

  function setIconColor(hex) {
    iconColor.value = hex
  }

  return { iconColor, setIconColor }
})