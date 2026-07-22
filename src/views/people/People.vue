<script setup>
import { ref, computed } from 'vue'
import { usePeopleStore } from '../../stores/people'
import { useContactsStore } from '../../stores/contacts'
import { useRecordsStore } from '../../stores/records'

const peopleStore = usePeopleStore()
const contactsStore = useContactsStore()
const recordsStore = useRecordsStore()

// Inline add state
const isAdding = ref(false)
const newName = ref('')

// Inline edit state — only one person editable at a time
const editingId = ref(null)
const editNameDraft = ref('')
const editShareDraft = ref('')

function startAdd() {
  isAdding.value = true
  newName.value = ''
}

function saveNewPerson() {
  if (newName.value.trim()) {
    peopleStore.addPerson(newName.value.trim())
  }
  cancelAdd()
}

function cancelAdd() {
  isAdding.value = false
  newName.value = ''
}

function startEdit(person) {
  editingId.value = person.id
  editNameDraft.value = person.name
  editShareDraft.value = person.shareId || ''
}

function saveEdit(id) {
  peopleStore.renamePerson(id, editNameDraft.value)
  if (editShareDraft.value) {
    peopleStore.setShareId(id, editShareDraft.value)
  }
  cancelEdit()
}

function cancelEdit() {
  editingId.value = null
  editNameDraft.value = ''
  editShareDraft.value = ''
}

// ── Linked codes (contacts mappings) ────────────────────────────────────
// mappings.value is remoteShareId -> localPersonId. Surface it as a list so
// a bad mapping (e.g. accidentally importing someone's PR onto the wrong
// local person) can be found and corrected.
const linkedCodes = computed(() =>
  Object.entries(contactsStore.mappings).map(([shareId, personId]) => ({
    shareId,
    personId,
    personName: peopleStore.people.find(p => p.id === personId)?.name ?? 'Unknown person',
  }))
)

const reassigningShareId = ref(null)
const reassignTarget = ref('')

function startReassign(shareId) {
  reassigningShareId.value = shareId
  reassignTarget.value = ''
}

function cancelReassign() {
  reassigningShareId.value = null
  reassignTarget.value = ''
}

function confirmReassign(shareId, fromPersonId) {
  const toPersonId = reassignTarget.value
  if (!toPersonId || toPersonId === fromPersonId) {
    cancelReassign()
    return
  }
  // Move any PR entries that came from this shareId off the wrong person
  // and onto the right one, then point the mapping at the right one too.
  recordsStore.reassignImportedEntries(shareId, fromPersonId, toPersonId)
  contactsStore.setMapping(shareId, toPersonId)
  cancelReassign()
}

function unlinkCode(shareId) {
  contactsStore.removeMapping(shareId)
  cancelReassign()
}

// Collapsed by default — this is a repair/debug tool, not something most
// people need to see on every visit.
const linkedCodesExpanded = ref(false)

// ── Delete confirmation ─────────────────────────────────────────────────
const deleteTarget = ref(null) // the person pending confirmation, or null

function requestDelete(person) {
  deleteTarget.value = person
}

function cancelDelete() {
  deleteTarget.value = null
}

function confirmDelete() {
  if (!deleteTarget.value) return
  peopleStore.removePerson(deleteTarget.value.id)
  deleteTarget.value = null
}

// How many PRs would be lost — shown in the confirmation so the person
// knows exactly what they're agreeing to before they tap Delete.
const deleteTargetPrCount = computed(() =>
  deleteTarget.value ? recordsStore.entries.filter(e => e.personId === deleteTarget.value.id).length : 0
)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>People</h1>
    </header>

    <div class="add-section">
      <button 
        v-if="!isAdding" 
        class="btn btn-accent add-btn" 
        @click="startAdd"
      >
        + New Person
      </button>

      <form 
        v-else 
        class="add-form" 
        @submit.prevent="saveNewPerson"
      >
        <input 
          v-model="newName" 
          type="text" 
          placeholder="Enter name" 
          class="add-input" 
          autofocus 
          required 
        />
        <button type="submit" class="save-btn">Save</button>
        <button class="icon-btn danger"  @click="cancelAdd" aria-label="Cancel">×</button>
        
      </form>
    </div>

    <div v-if="peopleStore.people.length === 0" class="empty-state">
      No one added yet. Tap "+ New Person" above to start tracking PRs.
    </div>

    <ul v-else class="people-list">
      <li v-for="p in peopleStore.people" :key="p.id" class="person-row">

        <form v-if="editingId === p.id" class="edit-form" @submit.prevent="saveEdit(p.id)">
          <div class="edit-fields">
            <!-- Name -->
            <div class="edit-field">
              <span class="edit-label">Name</span>
              <input v-model="editNameDraft" type="text" class="edit-input" autofocus required />
            </div>
            <!-- Share Code (optional) -->
            <div class="edit-field">
              <span class="edit-label">{{p.isPrimary ? "Change your share code in Account preferences" :"Share Code: copy/paste a users share code here"}}</span>
              <input v-model="editShareDraft" :readonly="p.isPrimary" type="text" class="edit-input mono" placeholder="e.g. swift_penguin_492" />
            </div>
          </div>
          <div class="edit-actions">
            <button type="submit" class="save-btn outline-btn">Save</button>
            <button class="icon-btn danger" @click="cancelEdit" aria-label="Cancel">×</button>
          </div>
        </form>

        <template v-else>
          <div class="person-header">
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
              <!-- Share edit button removed -->
              <button
                class="icon-btn danger"
                :disabled="p.isPrimary || peopleStore.people.length <= 1"
                :title="p.isPrimary ? 'Cannot remove the primary account' : peopleStore.people.length <= 1 ? 'Cannot remove the last person' : 'Remove'"
                aria-label="Remove"
                @click="requestDelete(p)"
              >×</button>
            </div>
          </div>
        </template>

      </li>
    </ul>

    <!-- Linked Codes — repair a mis-imported PR mapping -->
    <section v-if="linkedCodes.length" class="linked-section">
      <button class="linked-title" @click="linkedCodesExpanded = !linkedCodesExpanded">
        Linked Codes
        <span class="linked-count">({{ linkedCodes.length }})</span>
        <svg class="linked-chevron" :class="{ open: linkedCodesExpanded }" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <template v-if="linkedCodesExpanded">
        <p class="linked-note">
          Each share code you've imported is linked to one person below. If a PR ever gets
          imported onto the wrong person, fix it here.
        </p>
        <ul class="linked-list">
          <li v-for="lc in linkedCodes" :key="lc.shareId" class="linked-row">
            <div v-if="reassigningShareId !== lc.shareId" class="linked-info">
              <span class="linked-code">{{ lc.shareId }}</span>
              <span class="linked-arrow">→</span>
              <span class="linked-person">{{ lc.personName }}</span>
            </div>
            <div v-if="reassigningShareId !== lc.shareId" class="linked-actions">
              <button class="btn outline-btn small" @click="startReassign(lc.shareId)">Reassign</button>
              <button class="icon-btn danger" @click="unlinkCode(lc.shareId)" aria-label="Unlink">×</button>
            </div>

            <form v-else class="reassign-form" @submit.prevent="confirmReassign(lc.shareId, lc.personId)">
              <span class="linked-code">{{ lc.shareId }}</span>
              <select v-model="reassignTarget" class="reassign-select" required>
                <option value="" disabled>Move to…</option>
                <option v-for="p in peopleStore.people" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
              <button type="submit" class="save-btn outline-btn small">Move</button>
              <button class="icon-btn danger" @click="cancelReassign" aria-label="Cancel">×</button>
            </form>
          </li>
        </ul>
      </template>
    </section>

    <!-- Delete confirmation -->
    <div v-if="deleteTarget" class="overlay" @click.self="cancelDelete">
      <div class="sheet">
        <header class="sheet-header">
          <h3>Remove {{ deleteTarget.name }}?</h3>
          <button class="close-btn" @click="cancelDelete" aria-label="Close">×</button>
        </header>
        <p class="delete-warning">
          This permanently deletes <strong>{{ deleteTarget.name }}</strong> and
          <strong>{{ deleteTargetPrCount }}</strong> logged PR{{ deleteTargetPrCount === 1 ? '' : 's' }},
          along with any linked share code and icon color. This can't be undone.
        </p>
        <div class="delete-actions">
          <button class="btn" @click="cancelDelete">Cancel</button>
          <button class="btn btn-danger" @click="confirmDelete">Delete {{ deleteTarget.name }}</button>
        </div>
      </div>
    </div>
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

.add-section {
  margin-bottom: 16px;
}

.add-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-input {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.save-btn {
  background: var(--color-accent);
  color: #1a1500;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.save-btn:hover {
  background: var(--color-accent-light);
}

.cancel-btn {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-btn:hover {
  background: color-mix(in srgb, var(--color-danger) 80%, black);
}

.add-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
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
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  gap: 8px;
}

/* ── Normal mode ── */
.person-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

/* ── Edit mode ── (expanded row) */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.edit-input {
  font-size: 15px;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.edit-input.mono {
  font-family: var(--font-mono);
  font-size: 14px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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

.outline-btn {
  background-color: var(--color-surface);
  color: var(--color-accent);
  border: 1px solid;
  border-color: var(--color-accent);
}

.outline-btn:hover {
  color: var(--color-text);
  border-color: var(--color-text-dim);
}

/* ── Linked Codes ── */
.linked-section {
  margin-top: 28px;
}

.linked-title {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-dim);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  text-align: left;
}

.linked-title:hover {
  color: var(--color-text);
}

.linked-count {
  opacity: 0.6;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.linked-chevron {
  margin-left: auto;
  transition: transform 0.15s ease;
}

.linked-chevron.open {
  transform: rotate(180deg);
}

.linked-note {
  font-size: 12px;
  color: var(--color-text-dim);
  margin: 0 0 12px;
  line-height: 1.5;
}

.linked-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.linked-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  flex-wrap: wrap;
}

.linked-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  min-width: 0;
}

.linked-code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--color-surface-2);
  padding: 2px 8px;
  border-radius: 4px;
}

.linked-arrow {
  color: var(--color-text-dim);
}

.linked-person {
  font-weight: 600;
}

.linked-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.reassign-form {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
}

.reassign-select {
  flex: 1;
  min-width: 120px;
  font-size: 13px;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.btn.small,
.save-btn.small {
  padding: 6px 10px;
  font-size: 12px;
}

/* ── Delete confirmation ── */
.delete-warning {
  font-size: 14px;
  color: var(--color-text-dim);
  line-height: 1.5;
  margin: 0;
}

.delete-warning strong {
  color: var(--color-text);
}

.delete-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.delete-actions .btn {
  flex: 1;
}
</style>