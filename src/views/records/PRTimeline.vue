<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordsStore } from '../../stores/records'
import { useGoalsStore } from '../../stores/goals'
import { useCurrentUser } from '../../composables/useCurrentUser.js'
import PRChart from '../../components/records/PRChart.vue'

const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()
const goalsStore = useGoalsStore()
const { userId } = useCurrentUser()

const exerciseId = computed(() => route.params.exerciseId)

const history = computed(() =>
  userId.value ? recordsStore.historyFor(userId.value, exerciseId.value) : []
)

const exerciseName = computed(() => history.value[0]?.exerciseName || '')

const goal = computed(() =>
  userId.value ? goalsStore.getGoal(userId.value, exerciseId.value) : null
)
const goalTarget = computed(() => (goal.value ? goalsStore.targetMetric(goal.value) : null))
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
        </div>
      </div>
    </template>
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
</style>