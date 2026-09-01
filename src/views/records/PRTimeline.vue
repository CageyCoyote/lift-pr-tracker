<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordsStore } from '../../stores/records'
import { useExercisesStore } from '../../stores/exercises'
import { useGoalsStore } from '../../stores/goals'
import { useCurrentUser } from '../../composables/useCurrentUser.js'
import { useUndoToast } from '../../composables/useUndoToast'
import PRChart from '../../components/records/PRChart.vue'
import PREditForm from '../../components/records/PREditForm.vue'

const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()
const exercisesStore = useExercisesStore()
const goalsStore = useGoalsStore()
const { userId } = useCurrentUser()
const { showUndoToast } = useUndoToast()

const exerciseId = computed(() => route.params.exerciseId)

const history = computed(() =>
  userId.value ? recordsStore.historyFor(userId.value, exerciseId.value) : []
)

const exerciseName = computed(() => history.value[0]?.exerciseName || '')

const goal = computed(() =>
  userId.value ? goalsStore.getGoal(userId.value, exerciseId.value) : null
)
const goalTarget = computed(() => (goal.value ? goalsStore.targetMetric(goal.value) : null))

// ── Edit ─────────────────────────────────────────────────────────────────
const editFormOpen = ref(false)
const editEntry = ref(null)
const editExercise = ref(null)

function openEdit(entry) {
  editEntry.value = entry
  editExercise.value = exercisesStore.getById(exerciseId.value)
  editFormOpen.value = true
}

function handleUpdated(payload) {
  recordsStore.updateEntry(payload.id, payload)
}

// ── Delete ───────────────────────────────────────────────────────────────
function remove(id) {
  const entry = recordsStore.entries.find((e) => e.id === id)
  recordsStore.removeEntry(id)
  if (!entry) return

  // If that was the last entry for this exercise, the goal tied to it is
  // now orphaned — same cleanup PRCard does, kept in sync here since this
  // page can also delete the last remaining entry.
  const orphanedGoal = history.value.length === 0 ? goal.value : null
  if (orphanedGoal) goalsStore.removeGoal(userId.value, exerciseId.value)

  const summary = entry.unit === 'bodyweight'
    ? `${entry.reps} reps (bodyweight)`
    : `${entry.weight}${entry.unit} × ${entry.reps}`
  showUndoToast(`Deleted ${entry.exerciseName} — ${summary}`, () => {
    recordsStore.restoreEntry(entry)
    if (orphanedGoal) goalsStore.setGoal({ personId: userId.value, exerciseId: exerciseId.value, ...orphanedGoal })
  })

  // No entries left at all — nothing more to show on this page.
  if (history.value.length === 0) router.back()
}
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Records</button>

    <header class="page-header">
      <h1>{{ exerciseName || 'Full Timeline' }}</h1>
      <p v-if="history.length" class="entry-count">{{ history.length }} entries logged</p>
    </header>

    <div v-if="history.length === 0" class="empty-state">
      No history found for this exercise.
    </div>
    <template v-else>
      <div class="chart-panel">
        <PRChart :history="history" :goal-target="goalTarget" :height="280" />
      </div>

      <h2 class="log-heading">Full Log</h2>
      <div class="log-list">
        <div v-for="h in history" :key="h.id" class="log-row" :class="{ 'goal-met': h.goalMetTarget != null }">
          <span class="log-text">
            <template v-if="h.unit === 'bodyweight'">{{ h.reps }} reps (bodyweight)</template>
            <template v-else>{{ h.weight }}{{ h.unit }} × {{ h.reps }}</template>
          </span>
          <span class="log-date">{{ h.date }}</span>
          <span v-if="h.goalMetTarget != null" class="goal-met-badge">Goal met</span>

          <button class="row-action-btn edit-btn" @click="openEdit(h)" aria-label="Edit entry">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button class="row-action-btn remove-btn" @click="remove(h.id)" aria-label="Delete entry">×</button>
        </div>
      </div>
    </template>

    <!-- Edit an entry from the full log -->
    <PREditForm v-model="editFormOpen" :person-id="userId" :initial-exercise="editExercise" :edit-entry="editEntry"
      @updated="handleUpdated" />
  </div>
</template>

<style scoped>
.back-link {
  margin-bottom: 14px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 26px;
  margin-top: 2px;
}

.entry-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
  margin-top: 4px;
}

.chart-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px 12px;
}

.log-heading {
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-dim);
  margin: 24px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
}

.log-row.goal-met {
  border-color: var(--color-green);
}

.log-text {
  color: var(--color-text);
  flex: 1;
}

.log-date {
  color: var(--color-text-dim);
  font-size: 12px;
}

.goal-met-badge {
  font-size: 11px;
  color: var(--color-green);
  border: 1px solid var(--color-green);
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}

.row-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  color: var(--color-text-dim);
  background: none;
  border: none;
  cursor: pointer;
}

.row-action-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.row-action-btn.remove-btn {
  font-size: 18px;
  line-height: 1;
}

.row-action-btn.remove-btn:hover {
  color: var(--color-danger, #c0392b);
}

/* Landscape / wide viewports — give the chart a bit more breathing room
   and let the log sit alongside it rather than stacking under a huge gap */
@media (min-width: 720px) and (orientation: landscape) {
  .page {
    max-width: 900px;
    margin: 0 auto;
  }
}
</style>