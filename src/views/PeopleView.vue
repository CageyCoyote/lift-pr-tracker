<script setup>
import { ref } from 'vue'
import { usePeopleStore } from '../stores/people'

const peopleStore = usePeopleStore()
const name = ref('')

function submit() {
  peopleStore.addPerson(name.value)
  name.value = ''
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>People</h1>
    </header>

    <form class="add-form" @submit.prevent="submit">
      <input v-model="name" type="text" placeholder="Name" required />
      <button type="submit" class="btn btn-accent">Add</button>
    </form>

    <div v-if="peopleStore.people.length === 0" class="empty-state">
      No one added yet. Add a name above to start tracking their PRs.
    </div>

    <ul v-else class="people-list">
      <li v-for="p in peopleStore.people" :key="p.id" class="person-row">
        <button class="person-name" @click="peopleStore.setActivePerson(p.id)">
          <span class="dot" :class="{ active: p.id === peopleStore.activePersonId }" />
          {{ p.name }}
        </button>
        <button class="icon-btn danger" @click="peopleStore.removePerson(p.id)" aria-label="Remove">×</button>
      </li>
    </ul>
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

.add-form {
  display: flex;
  gap: 8px;
}

.add-form input {
  flex: 1;
}

.empty-state {
  margin-top: 24px;
  color: var(--color-text-dim);
  font-size: 14px;
  line-height: 1.5;
}

.people-list {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.person-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
}

.person-name {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: var(--color-text);
  font-weight: 600;
  font-size: 15px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
}

.dot.active {
  background: var(--color-accent);
}

.icon-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 14px;
}

.icon-btn.danger {
  color: var(--color-danger);
}
</style>
