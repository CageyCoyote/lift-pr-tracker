<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExercisesStore } from '../stores/exercises'
import ExercisePicker from '../components/ExercisePicker.vue'

const exercisesStore = useExercisesStore()
const searchExpanded = ref(false)
const exercises = computed(() => exercisesStore.list)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Exercise Library</h1>
    </header>

    <div>
      <!-- <ExerciseSearch  v-if="searchExpanded" />
      <input type="text" v-else @click="searchExpanded = !searchExpanded"> -->
    </div>
  </div>

  <div class="the-list">
    <ul v-for="exercise in exercises" class="exercise-card">
      <!-- <button class="exercise-link" @click="open(exercise.id)">
        <WorkoutCard :title="w.title" :muscles="workoutsStore.targetedMuscles(w.id)" :count="w.items.length" />
      </button> -->
      <div class="card-top  width-100">{{ exercise.name }}</div>
      <div class="card-meta  width-100">
        <span>Primary: </span>
        <span class="primary">{{ exercise.primaryMuscles.join(" ") }}</span>
      </div>
      <div v-if="exercise.secondaryMuscles.length > 0" class="card-meta  width-100">
        <span>Secondary: </span>
        <span class="secodary">{{ exercise.secondaryMuscles.join(" ") }}</span>
      </div>
    </ul>
  </div>
</template>

<style scoped>
.the-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
}

.exercise-card {
  list-style: none;
  margin: 8px;
  padding: 5px 0 0 5px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  width: 180px;
  height: 150px;
}

.card-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: none;
  border: none;
  color: var(--color-text);
  text-align: left;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card-name {
  font-weight: 600;
  font-size: 15px;
}

.card-meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

.width-100 {
  width: 100%;
}

.primary {
  color: var(--color-accent)
}

.secodary {
  color: var(--color-steel)
}

.text-secondary {
  color: var(--color-text-dim);
}
</style>