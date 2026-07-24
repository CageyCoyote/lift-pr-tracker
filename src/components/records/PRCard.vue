<script setup>
import { ref, reactive, computed } from 'vue'
import PlateBadge from '../common/PlateBadge.vue'
import { useRecordsStore } from '../../stores/records'
import { useExercisesStore } from '../../stores/exercises'
import PRForm from './PRForm.vue'
import PREditForm from './PREditForm.vue'
import PRNewForm from './PRNewForm.vue'
import PRShareSheet from './PRShareSheet.vue'
import PRChart from './PRChart.vue'
import { usePrCelebration } from '../../composables/usePrCelebration'
import { useUndoToast } from '../../composables/useUndoToast'
import { estimateOneRepMax } from '../../utils/oneRepMax'

const props = defineProps({
  personId: { type: String, required: true },
  exerciseId: { type: String, required: true },
  best: { type: Object, required: true }
})

const recordsStore = useRecordsStore()
const exercisesStore = useExercisesStore()
const { celebrateNewPr } = usePrCelebration()
const { showUndoToast } = useUndoToast()
const expanded = ref(false)
const viewMode = ref('chart') // 'log' | 'chart'

const bestOneRm = computed(() =>
  estimateOneRepMax(props.best.weight, props.best.reps, props.best.unit)
)

// New PR form state
const formOpen = ref(false)
const logExercise = ref(null)

// Edit form state
const editFormOpen = ref(false)
const editEntry = ref(null)
const editExercise = ref(null)

// Share sheet state
const shareSheetOpen = ref(false)
const shareEntry = ref(null)

function history() {
  return recordsStore.historyFor(props.personId, props.exerciseId)
}

function remove(id) {
  const entry = recordsStore.entries.find((e) => e.id === id)
  recordsStore.removeEntry(id)
  if (!entry) return

  const summary = entry.unit === 'bodyweight'
    ? `${entry.reps} reps (bodyweight)`
    : `${entry.weight}${entry.unit} × ${entry.reps}`
  showUndoToast(`Deleted ${entry.exerciseName} — ${summary}`, () => recordsStore.restoreEntry(entry))
}

function openLog() {
  logExercise.value = exercisesStore.getById(props.exerciseId)
  formOpen.value = true
}

function openEdit(entry) {
  editEntry.value = entry
  editExercise.value = exercisesStore.getById(props.exerciseId)
  editFormOpen.value = true
}

function handleSaved(payload) {
  const { entry, isNewBest } = recordsStore.addEntry({ personId: props.personId, ...payload })
  if (isNewBest) celebrateNewPr(entry)
}

function handleUpdated(payload) {
  recordsStore.updateEntry(payload.id, payload)
}

function openShare(entry) {
  shareEntry.value = entry
  shareSheetOpen.value = true
}

// ── Long-press the badge to share the PR shown on it ───────────────────────
const LONG_PRESS_MS = 550
const MOVE_CANCEL_PX = 10
const badgePressing = ref(false)

let longPressTimer = null
let longPressFired = false
let pressStart = null

function startLongPress(e) {
  if (!props.personId) return
  longPressFired = false
  badgePressing.value = true
  pressStart = { x: e.clientX, y: e.clientY }

  clearTimeout(longPressTimer)
  longPressTimer = setTimeout(() => {
    longPressFired = true
    badgePressing.value = false
    if (navigator.vibrate) navigator.vibrate(15)
    openShare(props.best)
  }, LONG_PRESS_MS)
}

function moveDuringPress(e) {
  if (!pressStart) return
  const dx = e.clientX - pressStart.x
  const dy = e.clientY - pressStart.y
  if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) cancelLongPress()
}

function cancelLongPress() {
  clearTimeout(longPressTimer)
  badgePressing.value = false
  pressStart = null
}

// The card-top button still needs its normal expand/collapse click — but
// not immediately after a long-press fired, or the share sheet would open
// and the card would expand underneath it in the same gesture.
function handleCardTopClick() {
  if (longPressFired) {
    longPressFired = false
    return
  }
  expanded.value = !expanded.value
}

// ── Swipe left→right on a history row to open the edit sheet ───────────────
const SWIPE_THRESHOLD_PX = 70
const SWIPE_MAX_PX = 96

// Keyed by entry id: { dx, dragging }
const swipeState = reactive({})

let swipeStart = null
let activeSwipeId = null

function swipeStyle(id) {
  const s = swipeState[id]
  const dx = s ? s.dx : 0
  return {
    transform: `translateX(${dx}px)`,
    transition: s && s.dragging ? 'none' : 'transform 0.2s ease'
  }
}

function swipeHintOpacity(id) {
  const s = swipeState[id]
  if (!s) return 0
  return Math.min(s.dx / SWIPE_THRESHOLD_PX, 1)
}

function startSwipe(e, entry) {
  swipeStart = { x: e.clientX, y: e.clientY }
  activeSwipeId = entry.id
  swipeState[entry.id] = { dx: 0, dragging: true }
}

function moveSwipe(e) {
  if (!swipeStart || activeSwipeId == null) return
  const dx = e.clientX - swipeStart.x
  const dy = e.clientY - swipeStart.y

  // A more-vertical drag is a scroll gesture, not a swipe — bail out.
  if (Math.abs(dy) > Math.abs(dx) + 8) {
    resetSwipe()
    return
  }

  const state = swipeState[activeSwipeId]
  if (!state) return
  // Only track left-to-right movement; ignore right-to-left drags.
  state.dx = dx > 0 ? Math.min(dx, SWIPE_MAX_PX) : 0
}

function endSwipe(entry) {
  const state = swipeState[entry.id]
  if (state && state.dx > SWIPE_THRESHOLD_PX) {
    if (navigator.vibrate) navigator.vibrate(10)
    openEdit(entry)
  }
  resetSwipe(entry.id)
}

function resetSwipe(id = activeSwipeId) {
  if (id != null && swipeState[id]) {
    swipeState[id].dragging = false
    swipeState[id].dx = 0
  }
  swipeStart = null
  activeSwipeId = null
}
</script>

<template>
  <div class="card">
    <button
      class="card-top"
      :class="{ pressing: badgePressing }"
      @click="handleCardTopClick"
      @pointerdown="startLongPress"
      @pointermove="moveDuringPress"
      @pointerup="cancelLongPress"
      @pointerleave="cancelLongPress"
      @pointercancel="cancelLongPress"
      @contextmenu.prevent
    >
      <div class="card-top-row">
        <PlateBadge v-if="best.unit === 'bodyweight'" :weight="best.reps" unit="reps" />
        <PlateBadge v-else :weight="best.weight" :unit="best.unit" />
        <div class="card-info">
          <span class="card-name">{{ best.exerciseName }}</span>
          <span class="card-meta">
            <template v-if="best.unit === 'bodyweight'">Bodyweight · {{ best.date }}</template>
            <template v-else>{{ best.reps }} rep{{ best.reps > 1 ? 's' : '' }} · {{ best.date }}</template>
          </span>
        </div>
        <span class="chevron" :class="{ open: expanded }">⌄</span>
      </div>
      <div v-if="bestOneRm" class="card-1rm-line">Estimated Max: {{ bestOneRm }}{{ best.unit }}</div>
    </button>

    <div v-if="expanded" class="history">
      <div class="log-row">
        <button v-if="props.personId" class="btn log-btn" @click="openLog()">+ New PR</button>

        <div class="view-toggle" role="tablist" aria-label="View mode">
          <button
            class="toggle-btn"
            role="tab"
            :aria-selected="viewMode === 'log'"
            :class="{ active: viewMode === 'log' }"
            @click="viewMode = 'log'"
          >Log</button>
          <button
            class="toggle-btn"
            role="tab"
            :aria-selected="viewMode === 'chart'"
            :class="{ active: viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >Chart</button>
        </div>

        <button v-if="viewMode === 'log' && props.personId && history().length" class="action-btn edit-btn"
          @click="openEdit(history()[0])" aria-label="Edit most recent entry">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      <PRChart v-if="viewMode === 'chart'" :history="history()" />

      <template v-else>
        <div v-for="h in history()" :key="h.id" class="history-row-wrap">
          <div class="swipe-hint" :style="{ opacity: swipeHintOpacity(h.id) }" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div
            class="history-row"
            :style="swipeStyle(h.id)"
            @pointerdown="startSwipe($event, h)"
            @pointermove="moveSwipe"
            @pointerup="endSwipe(h)"
            @pointerleave="resetSwipe(h.id)"
            @pointercancel="resetSwipe(h.id)"
          >
            <span class="history-text">
              <template v-if="h.unit === 'bodyweight'">{{ h.reps }} reps (bodyweight) — {{ h.date }}</template>
              <template v-else>
                {{ h.weight }}{{ h.unit }} × {{ h.reps }} — {{ h.date }}
                <span v-if="estimateOneRepMax(h.weight, h.reps, h.unit)" class="est-1rm">
                  ~{{ estimateOneRepMax(h.weight, h.reps, h.unit) }}{{ h.unit }} 1RM
                </span>
              </template>
            </span>

            <button class="action-btn share-btn" @click="openShare(h)" aria-label="Share this PR">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <button class="action-btn remove-btn" @click="remove(h.id)" aria-label="Delete entry">×</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Add a New PR for this Exercise -->
    <PRNewForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />

    <!-- Edit the Most Recent PR -->
    <PREditForm v-model="editFormOpen" :initial-exercise="editExercise" :edit-entry="editEntry"
      @updated="handleUpdated" />

    <!-- Share this PR -->
    <PRShareSheet v-model="shareSheetOpen" :entry="shareEntry" :person-id="props.personId" />
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-top {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: none;
  border: none;
  color: var(--color-text);
  text-align: left;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: background 0.15s ease;
}

.card-top-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.card-top.pressing {
  background: var(--color-surface-2);
}

.card-1rm-line {
  width: 100%;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
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

.chevron {
  color: var(--color-text-dim);
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.history {
  border-top: 1px solid var(--color-border);
  padding: 6px 12px 10px;
}

.history-row-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}

.swipe-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: var(--color-accent);
  background: var(--color-surface-2);
  border-radius: 6px;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-dim);
  background: var(--color-surface);
  touch-action: pan-y;
  will-change: transform;
}

.history-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.est-1rm {
  color: var(--color-text-dim);
  opacity: 0.7;
  margin-left: 4px;
}

.action-btn {
  background: none;
  border: none;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: var(--color-steel);
}

.edit-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.remove-btn {
  color: var(--color-danger);
  font-size: 18px;
}

.share-btn {
  color: var(--color-steel);
}

.share-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.log-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 3px 0 9px 0;
  border-bottom: 1px solid var(--color-border);
}

.log-btn {
  padding: 5px 10px;
  font-size: 12px;
  background: var(--color-steel);
  color: #fff;
  border: none;
}

.log-btn {
  grid-column: 1;
  justify-self: start;
}

.view-toggle {
  grid-column: 2;
  justify-self: center;
  display: flex;
  background: var(--color-surface-2);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.edit-btn {
  grid-column: 3;
  justify-self: end;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 4px 10px;
  font-size: 11px;
  font-family: var(--font-display);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  border-radius: 6px;
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--color-surface);
  color: var(--color-accent);
}
</style>