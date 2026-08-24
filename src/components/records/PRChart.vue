<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Expects entries sorted newest-first, same shape as recordsStore.historyFor()
  history: { type: Array, required: true },
  // Target metric (weight or reps, matching the entries' unit). null = no goal.
  goalTarget: { type: Number, default: null }
})

// Chart wants oldest → newest (left to right)
const points = computed(() => [...props.history].reverse())

const metricLabel = computed(() => {
  if (!points.value.length) return ''
  return points.value[0].unit === 'bodyweight' ? 'reps' : points.value[0].unit
})

function metricFor(entry) {
  return entry.unit === 'bodyweight' ? entry.reps : entry.weight
}

const W = 300
const H = 140
const PAD_X = 8
const PAD_TOP = 16
const PAD_BOTTOM = 24

const values = computed(() => points.value.map(metricFor))
// The goal line needs to fit on the same scale as the plotted values, so a
// goal above the current best (the common case, since that's the point of
// setting one) extends the chart's range rather than getting clipped off.
const goalValues = computed(() => (props.goalTarget != null ? [props.goalTarget] : []))
const minVal = computed(() => Math.min(...values.value, ...goalValues.value))
const maxVal = computed(() => Math.max(...values.value, ...goalValues.value))
// Avoid a flat/zero-height range when every value is identical
const range = computed(() => (maxVal.value - minVal.value) || 1)

const coords = computed(() => {
  const n = points.value.length
  if (n === 0) return []
  const usableW = W - PAD_X * 2
  const usableH = H - PAD_TOP - PAD_BOTTOM
  return points.value.map((entry, i) => {
    const x = n === 1 ? W / 2 : PAD_X + (usableW * i) / (n - 1)
    const v = metricFor(entry)
    const y = PAD_TOP + usableH - ((v - minVal.value) / range.value) * usableH
    return { x, y, entry }
  })
})

const linePath = computed(() =>
  coords.value.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  if (coords.value.length === 0) return ''
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  const baseline = H - PAD_BOTTOM
  return `M${first.x.toFixed(1)},${baseline} ${linePath.value.slice(1)} L${last.x.toFixed(1)},${baseline} Z`
})

// Show short date labels under first, middle-ish, and last point only,
// so the axis doesn't get crowded when there are many entries.
const labeledIndices = computed(() => {
  const n = coords.value.length
  if (n === 0) return []
  if (n <= 2) return [...Array(n).keys()]
  return [0, Math.floor((n - 1) / 2), n - 1]
})

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const goalY = computed(() => {
  if (props.goalTarget == null || coords.value.length === 0) return null
  const usableH = H - PAD_TOP - PAD_BOTTOM
  return PAD_TOP + usableH - ((props.goalTarget - minVal.value) / range.value) * usableH
})

const goalMet = computed(() =>
  props.goalTarget != null && values.value.some((v) => v >= props.goalTarget)
)
</script>

<template>
  <div class="chart-wrap">
    <div v-if="points.length < 2" class="chart-empty">
      Log at least 2 entries to see a trend.
    </div>
    <svg v-else :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="none">
      <path :d="areaPath" class="area" />
      <line
        v-if="goalY !== null"
        :x1="PAD_X" :x2="W - PAD_X" :y1="goalY" :y2="goalY"
        class="goal-line" :class="{ met: goalMet }"
      />
      <path :d="linePath" class="line" />
      <g v-for="(c, i) in coords" :key="i">
        <circle :cx="c.x" :cy="c.y" r="3" class="dot" :class="{ 'dot-best': metricFor(c.entry) === maxVal }" />
      </g>
      <g v-for="i in labeledIndices" :key="'lbl-' + i">
        <text :x="coords[i].x" :y="H - 6" class="axis-label" :text-anchor="i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle'">
          {{ shortDate(coords[i].entry.date) }}
        </text>
      </g>
    </svg>
    <div v-if="points.length >= 2" class="chart-legend">
      <span v-if="goalTarget != null" class="goal-legend" :class="{ met: goalMet }">
        Goal: {{ goalTarget }}{{ metricLabel === 'reps' ? ' reps' : metricLabel }}
      </span>
      <span>{{ minVal }}{{ metricLabel === 'reps' ? ' reps' : metricLabel }} – {{ maxVal }}{{ metricLabel === 'reps' ? ' reps' : metricLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  padding: 4px 0 2px;
}

.chart-empty {
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-dim);
}

.chart-svg {
  width: 100%;
  height: 140px;
  display: block;
}

.area {
  fill: var(--color-accent);
  opacity: 0.12;
  stroke: none;
}

.line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.goal-line {
  stroke: #000;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

.goal-line.met {
  stroke: var(--color-green);
}

.dot {
  fill: var(--color-surface);
  stroke: var(--color-accent);
  stroke-width: 2;
}

.dot-best {
  fill: var(--color-accent);
}

.axis-label {
  font-family: var(--font-mono);
  font-size: 9px;
  fill: var(--color-text-dim);
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
  padding-top: 2px;
}

.goal-legend {
  text-align: left;
}

.goal-legend.met {
  color: var(--color-green);
}
</style>