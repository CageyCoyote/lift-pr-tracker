<script setup>
import { ref, computed } from 'vue'
import { usePeopleStore } from '../stores/people'
import { useRecordsStore } from '../stores/records'
import PersonSelector from '../components/PersonSelector.vue'
import PRCard from '../components/PRCard.vue'
import PRForm from '../components/PRForm.vue'

const peopleStore = usePeopleStore()
const recordsStore = useRecordsStore()
const formOpen = ref(false)

const bests = computed(() =>
  peopleStore.activePersonId ? recordsStore.bestsForPerson(peopleStore.activePersonId) : []
)

function handleSaved(payload) {
  recordsStore.addEntry({ personId: peopleStore.activePersonId, ...payload })
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Personal Records</h1>
    </header>

    <PersonSelector />

    <div v-if="!peopleStore.activePersonId" class="empty-state">
      Add a person on the People tab to start logging PRs.
    </div>

    <template v-else>
      <div v-if="bests.length === 0" class="empty-state">
        No PRs logged yet for this person. Tap "Log a PR" to add the first one.
      </div>
      <div v-else class="card-list">
        <PRCard
          v-for="b in bests"
          :key="b.exerciseId"
          :person-id="peopleStore.activePersonId"
          :exercise-id="b.exerciseId"
          :best="b.best"
        />
      </div>

      <button class="btn btn-accent fab" @click="formOpen = true">+ Log a PR</button>
    </template>

    <PRForm v-model="formOpen" :person-id="peopleStore.activePersonId" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.empty-state {
  margin-top: 24px;
  color: var(--color-text-dim);
  font-size: 14px;
  line-height: 1.5;
}

.fab {
  width: 100%;
  margin-top: 18px;
}
</style>
