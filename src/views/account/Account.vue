<script setup>
import { useRouter } from 'vue-router'
import AccountSection from '../../components/account/AccountSection.vue'
import ThemePicker from '../../components/account/ThemePicker.vue'
import IconColorPicker from '../../components/account/IconColorPicker.vue'
import SoundSettings from '../../components/account/SoundSettings.vue'
import InstallSection from '../../components/account/InstallSection.vue'
import DataExport from '../../components/account/DataExport.vue'
import BackupRestore from '../../components/account/BackupRestore.vue'
import { useCurrentUser } from '../../composables/useCurrentUser.js'

const router = useRouter()
const { userId, activeUser } = useCurrentUser()
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Back</button>

    <header class="page-header">
      <h1>Preferences</h1>
    </header>

    <AccountSection v-if="activeUser" />
    <!-- <InactiveSection heading="" message="" v-else /> -->
    <ThemePicker />
    <IconColorPicker v-if="activeUser" />
    <!-- <InactiveSection heading="" message="" v-else /> -->
    <SoundSettings />
    <InstallSection />
    <DataExport />
    <BackupRestore />
  </div>
</template>

<style scoped>
.back-link {
  margin-bottom: 14px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}
</style>