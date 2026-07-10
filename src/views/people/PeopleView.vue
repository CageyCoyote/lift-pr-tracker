<script setup>
import { ref } from 'vue'
import { usePeopleStore } from '../../stores/people'

const peopleStore = usePeopleStore()
const name = ref('')

// Inline edit state — only one person editable at a time
const editingId = ref(null)
const editDraft = ref('')

function submit() {
  peopleStore.addPerson(name.value)
  name.value = ''
}

function startEdit(person) {
  editingId.value = person.id
  editDraft.value = person.name
}

function saveEdit(id) {
  peopleStore.renamePerson(id, editDraft.value)
  cancelEdit()
}

function cancelEdit() {
  editingId.value = null
  editDraft.value = ''
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>People</h1>
    </header>
    <div class="empty-state">
      {{ peopleStore.people.length === 1 ? "Add a person to track" : "Tap to switch the active lifter" }}.
    </div>
    <form class="add-form" @submit.prevent="submit">
      <input v-model="name" type="text" placeholder="Name" required />
      <button type="submit" class="btn btn-accent">Add</button>
    </form>

    <div v-if="peopleStore.people.length === 0" class="empty-state">
      No one added yet. Add a name above to start tracking their PRs.
    </div>

    <ul v-else class="people-list">
      <li v-for="p in peopleStore.people" :key="p.id" class="person-row">

        <!-- Edit mode -->
        <form v-if="editingId === p.id" class="edit-form" @submit.prevent="saveEdit(p.id)">
          <input v-model="editDraft" type="text" class="edit-input" autofocus required />
          <button type="submit" class="icon-btn save">✓</button>
          <button type="button" class="icon-btn" @click="cancelEdit">×</button>
        </form>

        <!-- Normal mode -->
        <template v-else>
          <button class="person-name" @click="peopleStore.setActivePerson(p.id)">
            <span class="dot" :class="{ active: p.id === peopleStore.activePersonId }" />
            {{ p.name }}
          </button>
          <div class="row-actions">
            <button class="icon-btn edit" @click="startEdit(p)" aria-label="Edit name">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button class="icon-btn danger" :disabled="peopleStore.people.length <= 1"
              :title="peopleStore.people.length <= 1 ? 'Cannot remove the last person' : 'Remove'" aria-label="Remove"
              @click="peopleStore.removePerson(p.id)">×</button>
          </div>
        </template>

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
  min-height: 52px;
}

/* ── Normal mode ── */
.person-name {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: var(--color-text);
  font-weight: 600;
  font-size: 15px;
  flex: 1;
  text-align: left;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
}

.dot.active {
  background: var(--color-accent);
}

.row-actions {
  display: flex;
  gap: 6px;
}

/* ── Edit mode ── */
.edit-form {
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;
}

.edit-input {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 10px;
}

/* ── Shared icon button ── */
.icon-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-btn.danger {
  color: var(--color-danger);
}

.icon-btn.danger:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.icon-btn.edit {
  text-decoration: none;
  border: none;
  background: var(--color-surface);
  color: var(--color-steel);
}

.icon-btn.save {
  color: var(--color-green);
  border-color: var(--color-green);
}
</style>