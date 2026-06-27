<script setup>
import { usePeopleStore } from '../../stores/people'

const peopleStore = usePeopleStore()
</script>

<template>
  <div class="selector">
    <button v-for="p in peopleStore.people" :key="p.id" class="chip"
      :class="{ active: p.id === peopleStore.activePersonId }" @click="peopleStore.setActivePerson(p.id)">
      {{ p.name }}
    </button>
    <router-link v-if="peopleStore.people.length === 0" to="/people" class="chip add-link">
      + Add a person
    </router-link>
  </div>
</template>

<style scoped>
.selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.chip {
  flex-shrink: 0;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
}

.chip.active {
  background: var(--color-accent);
  color: #1a1500;
  border-color: var(--color-accent);
}
</style>
