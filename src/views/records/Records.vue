<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecordsStore } from '../../stores/records'
import PersonSelector from '../../components/common/PersonSelector.vue'
import PRCard from '../../components/records/PRCard.vue'
import PRSearchForm from '../../components/records/PRSearchForm.vue'
import PRShareSheet from '../../components/records/PRShareSheet.vue'
import { useCurrentUser } from "../../composables/useCurrentUser.js"
import { usePrCelebration } from '../../composables/usePrCelebration'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const incomingCode = ref(null)

onMounted(() => {
  if (route.query.d) {
    incomingCode.value = route.query.d
    importSheetOpen.value = true
    // strip the query so a refresh doesn't re-trigger the import dialog
    router.replace({ path: route.path })
  }
})

const recordsStore = useRecordsStore()
const { userId } = useCurrentUser()
const { celebrateNewPr } = usePrCelebration()
const formOpen = ref(false)
const importSheetOpen = ref(false)

const sortBy = ref('date')

const bests = computed(() =>
  userId ? recordsStore.bestsForPerson(userId.value) : []
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
  const { entry, isNewBest } = recordsStore.addEntry({ personId: userId.value, ...payload })
  if (isNewBest) celebrateNewPr(entry)
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Personal Records</h1>
      <button class="import-btn" @click="importSheetOpen = true">Import PR</button>
    </header>

    <PersonSelector />

    <div v-if="!userId" class="empty-state">
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
          <PRCard v-for="b in sortedBests" :key="b.exerciseId" :person-id="userId" :exercise-id="b.exerciseId"
            :best="b.best" />
        </div>
      </template>

      <button class="btn btn-accent fab" @click="formOpen = true">+ Log a PR</button>
    </template>

    <!-- search the library for a new PR -->
    <PRSearchForm v-model="formOpen" :person-id="userId" @saved="handleSaved" />

    <!-- import a PR shared from another device -->
    <PRShareSheet v-model="importSheetOpen" :incoming-code="incomingCode" @imported="incomingCode = null" />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.import-btn {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 8px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: var(--radius);
  white-space: nowrap;
}

.import-btn:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
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
</style>
