<script setup>
import { ref, computed } from 'vue'
import { usePeopleStore } from '../../stores/people'
import { useRecordsStore } from '../../stores/records'
import PersonSelector from '../../components/common/PersonSelector.vue'
import PRCard from '../../components/records/PRCard.vue'
import PRSearchForm from '../../components/records/PRSearchForm.vue'

const peopleStore = usePeopleStore()
const recordsStore = useRecordsStore()
const formOpen = ref(false)

const sortBy = ref('date')

const bests = computed(() =>
  peopleStore.activePersonId ? recordsStore.bestsForPerson(peopleStore.activePersonId) : []
)

const sortedBests = computed(() => {
  const list = [...bests.value]
  if (sortBy.value === 'date') {
    // Most recent PR date first
    return list.sort((a, b) => b.best.date.localeCompare(a.best.date))
  }
  if (sortBy.value === 'weight') {
    // Highest weight first, tie-broken by reps descending
    return list.sort((a, b) =>
      b.best.weight !== a.best.weight
        ? b.best.weight - a.best.weight
        : b.best.reps - a.best.reps
    )
  }
  if (sortBy.value === 'reps') {
    // Most reps first, tie-broken by weight descending
    return list.sort((a, b) =>
      b.best.reps !== a.best.reps
        ? b.best.reps - a.best.reps
        : b.best.weight - a.best.weight
    )
  }
  return list
})

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
      <template v-else>
        <div class="list-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="date">Sort: Date</option>
            <option value="weight">Sort: Weight</option>
            <option value="reps">Sort: Reps</option>
          </select>
        </div>
        <div class="card-list">
          <PRCard v-for="b in sortedBests" :key="b.exerciseId" :person-id="peopleStore.activePersonId"
            :exercise-id="b.exerciseId" :best="b.best" />
        </div>
      </template>

      <button class="btn btn-accent fab" @click="formOpen = true">+ Log a PR</button>
    </template>

    <!-- search the library for a new PR -->
    <PRSearchForm v-model="formOpen" :person-id="peopleStore.activePersonId" @saved="handleSaved" />
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

.list-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.sort-select {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 6px 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: var(--radius);
  width: auto;
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