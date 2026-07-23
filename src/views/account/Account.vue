<script setup>
import { useRouter } from 'vue-router'
import AccountSection from '../../components/account/AccountSection.vue'
import ThemePicker from '../../components/account/ThemePicker.vue'
import IconColorPicker from '../../components/account/IconColorPicker.vue'
import InstallSection from '../../components/account/InstallSection.vue'
import DataExport from '../../components/account/DataExport.vue'
import BackupRestore from '../../components/account/BackupRestore.vue'

const router = useRouter()
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Back</button>

    <header class="page-header">
      <h1>Preferences</h1>
    </header>

    <AccountSection />
    <ThemePicker />
    <IconColorPicker />
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
