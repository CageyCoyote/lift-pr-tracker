<script setup>
import { ref, watch, onUnmounted } from 'vue'
import QRCode from 'qrcode'
import { useWorkoutsStore } from '../../stores/workouts'
import { useExercisesStore } from '../../stores/exercises'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workout: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'imported'])

const workoutsStore = useWorkoutsStore()
const exercisesStore = useExercisesStore()

const tab = ref(props.workout ? 'share' : 'scan')
const qrDataUrl = ref(null)
const qrError = ref(null)

const scanError = ref(null)
const scanResult = ref(null)
const scanning = ref(false)
const videoRef = ref(null)

const cameras = ref([])
const cameraIndex = ref(0)
const hasMultipleCameras = ref(false)

// Single source of truth for the active zxing reader.
// Kept module-level so stopScan can always reach it regardless of call site.
let codeReader = null

// Max exercises encodable at QR level L before the code becomes unreliable.
// At ~10 bytes per ID this keeps the payload comfortably under 200 bytes.
const MAX_EXERCISES = 20

// ── Encode / Decode ───────────────────────────────────────────────────────────

function encodePayload(workout) {
  const title = workout.title?.trim() ?? ''
  if (!title) throw new Error('Workout has no title')

  const items = workout.items.slice(0, MAX_EXERCISES)
  const ids = items.map(i => i.exerciseId).join(',')

  // Sanitise: strip characters that could break the colon-delimited format.
  // Colons in titles are fine (we use lastIndexOf), but newlines/nulls are not.
  const safeTitle = title.replace(/[\r\n\x00]/g, ' ')

  return `PRK:1:${safeTitle}:${ids}`
}

function decodePayload(text) {
  const PREFIX = 'PRK:1:'
  if (typeof text !== 'string' || !text.startsWith(PREFIX)) {
    return { error: 'QR code is not a valid PR Tracker workout.' }
  }

  const body = text.slice(PREFIX.length)

  // Split on the LAST colon — IDs live at the end, titles may contain colons.
  const colonIdx = body.lastIndexOf(':')
  if (colonIdx === -1) return { error: 'Malformed workout QR code.' }

  const title = body.slice(0, colonIdx).trim()
  if (!title) return { error: 'Workout QR code has no title.' }

  const idString = body.slice(colonIdx + 1)
  const ids = idString ? idString.split(',').filter(id => id.trim()) : []

  const items = ids.map(id => {
    const clean = id.trim()
    const ex = exercisesStore.getById(clean)
    return {
      exerciseId: clean,
      exerciseName: ex?.name ?? `Unknown exercise (${clean})`
    }
  })

  return { payload: { v: 1, title, items } }
}

// ── Share tab ─────────────────────────────────────────────────────────────────

async function generateQR() {
  if (!props.workout) return
  qrError.value = null
  qrDataUrl.value = null

  try {
    const text = encodePayload(props.workout)
    qrDataUrl.value = await QRCode.toDataURL(text, {
      width: 325,
      margin: 2,
      errorCorrectionLevel: 'L',
      color: { dark: '#000', light: '#fff' }
    })
  } catch (e) {
    qrError.value = e.message ?? 'Failed to generate QR code.'
    console.error('[QR generate]', e)
  }
}

// ── Camera helpers ────────────────────────────────────────────────────────────

async function loadCameraList() {
  try {
    const probe = await navigator.mediaDevices.getUserMedia({ video: true })
    probe.getTracks().forEach(t => t.stop())

    const all = await navigator.mediaDevices.enumerateDevices()
    cameras.value = all
      .filter(d => d.kind === 'videoinput')
      .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 6)}` }))
    hasMultipleCameras.value = cameras.value.length > 1

    const rearIdx = cameras.value.findIndex(d => /back|rear|environment/i.test(d.label))
    cameraIndex.value = rearIdx !== -1 ? rearIdx : cameras.value.length - 1
  } catch {
    hasMultipleCameras.value = false
  }
}

function buildConstraints(deviceId) {
  const videoConstraints = deviceId
    ? { deviceId: { exact: deviceId } }
    : { facingMode: { ideal: 'environment' } }

  return {
    video: {
      ...videoConstraints,
      width:  { ideal: 1280 },
      height: { ideal: 720  },
      advanced: [{ focusMode: 'continuous' }]
    },
    audio: false
  }
}

// ── Scan ──────────────────────────────────────────────────────────────────────

// Stops the camera and zxing reader completely.
// Safe to call multiple times — idempotent.
function stopScan() {
  scanning.value = false

  // Reset zxing first — this stops its internal decode loop and releases
  // the stream it opened via decodeOnceFromConstraints.
  if (codeReader) {
    try { codeReader.reset() } catch { /* ignore */ }
    codeReader = null
  }

  // Null out the video srcObject so the browser releases the camera indicator.
  if (videoRef.value) {
    try {
      videoRef.value.srcObject = null
    } catch { /* ignore */ }
  }
}

async function startScan() {
  // Guard: don't stack streams if called while already scanning
  if (scanning.value) return

  scanError.value = null
  scanResult.value = null
  scanning.value = true

  try {
    if (cameras.value.length === 0) await loadCameraList()

    const deviceId = cameras.value[cameraIndex.value]?.deviceId
    const constraints = buildConstraints(deviceId)

    const { BrowserQRCodeReader } = await import('@zxing/browser')

    // Check we're still supposed to be scanning — user may have cancelled
    // during the async import() above
    if (!scanning.value) return

    codeReader = new BrowserQRCodeReader()

    // decodeOnceFromConstraints manages its own stream internally.
    // We do NOT open a separate getUserMedia stream — doing both causes
    // duplicate streams and makes stopScan unreliable.
    const result = await codeReader.decodeOnceFromConstraints(constraints, videoRef.value)

    // Guard: result could arrive after user cancelled
    if (!scanning.value) return

    handleScanResult(result.getText())
  } catch (e) {
    // NotFoundException = no QR in frame, fired on decode timeout — not an error
    if (e?.name === 'NotFoundException') {
      scanning.value = false
      return
    }
    if (e?.name === 'NotAllowedError') {
      scanError.value = 'Camera permission denied. Allow camera access and try again.'
    } else if (e?.name === 'NotFoundError') {
      scanError.value = 'No camera found on this device.'
    } else {
      // Anything else — stop cleanly and show a message
      scanError.value = 'Camera unavailable. Check permissions and try again.'
      console.error('[QR scan]', e)
    }
    stopScan()
  }
}

async function switchCamera() {
  if (!hasMultipleCameras.value || !scanning.value) return
  stopScan()
  cameraIndex.value = (cameraIndex.value + 1) % cameras.value.length
  // Brief pause so the previous stream fully releases before we open the next
  await new Promise(r => setTimeout(r, 250))
  startScan()
}

function handleScanResult(text) {
  stopScan()
  const { payload, error } = decodePayload(text)
  if (error) {
    scanError.value = error
    return
  }
  scanResult.value = payload
}

function importWorkout() {
  if (!scanResult.value) return
  const w = workoutsStore.importWorkout(scanResult.value)
  emit('imported', w)
  close()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

watch(() => props.modelValue, (open) => {
  if (open) {
    tab.value = props.workout ? 'share' : 'scan'
    qrDataUrl.value = null
    qrError.value = null
    scanResult.value = null
    scanError.value = null
    if (props.workout) generateQR()
  } else {
    stopScan()
  }
})

watch(tab, (t) => {
  if (t === 'share' && !qrDataUrl.value) generateQR()
  if (t === 'scan') { scanResult.value = null; scanError.value = null }
  if (t !== 'scan') stopScan()
})

// Last resort — component torn down while camera is active
onUnmounted(stopScan)

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="sheet">

      <header class="sheet-header">
        <h3>{{ tab === 'share' ? 'Share Workout' : 'Scan & Import' }}</h3>
        <button class="close-btn" @click="close" aria-label="Close">×</button>
      </header>

      <!-- Tabs -->
      <div class="tabs">
        <button v-if="workout" class="tab" :class="{ active: tab === 'share' }" @click="tab = 'share'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
          </svg>
          Share
        </button>
        <button class="tab" :class="{ active: tab === 'scan' }" @click="tab = 'scan'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
          Scan
        </button>
      </div>

      <!-- ── Share tab ── -->
      <div v-if="tab === 'share'" class="tab-content">
        <div v-if="qrError" class="scan-error">{{ qrError }}</div>
        <div v-else-if="qrDataUrl" class="qr-wrap">
          <div class="qr-card">
            <img :src="qrDataUrl" alt="Workout QR Code" class="qr-img" />
          </div>
          <p class="qr-hint">Show this to another device to share <strong>{{ workout?.title }}</strong></p>
          <p v-if="workout && workout.items.length > MAX_EXERCISES" class="qr-warning">
            Only the first {{ MAX_EXERCISES }} exercises are included in the QR code.
          </p>
          <p class="qr-meta">{{ Math.min(workout?.items.length ?? 0, MAX_EXERCISES) }} exercise{{ workout?.items.length === 1 ? '' : 's' }} encoded</p>
        </div>
        <div v-else class="qr-loading">Generating…</div>
      </div>

      <!-- ── Scan tab ── -->
      <div v-if="tab === 'scan'" class="tab-content">

        <!-- Preview of scanned workout -->
        <div v-if="scanResult" class="scan-preview">
          <div class="preview-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span class="preview-title">{{ scanResult.title }}</span>
          </div>
          <ul class="preview-list">
            <li v-for="(item, i) in scanResult.items" :key="i" class="preview-item">
              <span class="preview-index">{{ i + 1 }}</span>
              {{ item.exerciseName }}
            </li>
          </ul>
          <div class="preview-actions">
            <button class="btn btn-accent" @click="importWorkout">Add to my Workouts</button>
            <button class="btn" @click="scanResult = null; startScan()">Scan Again</button>
          </div>
        </div>

        <!-- Camera -->
        <template v-else>
          <div class="video-wrap">
            <video ref="videoRef" class="video" autoplay muted playsinline />
            <div class="scan-line" />
            <button
              v-if="hasMultipleCameras && scanning"
              class="switch-overlay-btn"
              @click="switchCamera"
              aria-label="Switch camera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>

          <div v-if="scanError" class="scan-error">{{ scanError }}</div>

          <div class="scan-btns">
            <button v-if="!scanning" class="btn btn-accent scan-btn" @click="startScan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </svg>
              Start Camera
            </button>
            <button v-if="scanning" class="btn scan-btn" @click="stopScan">Cancel</button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<style scoped>
.sheet {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  background: var(--color-surface-2);
  border-radius: var(--radius);
  padding: 4px;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  border-radius: 7px;
  padding: 8px;
  font-size: 13px;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-dim);
  transition: background 0.15s ease, color 0.15s ease;
}

.tab.active {
  background: var(--color-surface);
  color: var(--color-text);
}

/* ── Tab content ── */
.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* ── QR ── */
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.qr-card {
  background: #ffffff;
  padding: 16px;
  border-radius: var(--radius);
  display: flex;
}

.qr-img {
  width: 280px;
  height: 280px;
  display: block;
}

.qr-hint {
  font-size: 13px;
  color: var(--color-text-dim);
  text-align: center;
  margin: 0;
}

.qr-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
  margin: 0;
}

.qr-warning {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-danger);
  text-align: center;
  margin: 0;
}

.qr-loading {
  color: var(--color-text-dim);
  font-size: 13px;
  padding: 32px 0;
}

/* ── Camera ── */
.video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: #000;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scan-line {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 50%;
  height: 2px;
  background: var(--color-accent);
  opacity: 0.8;
  animation: sweep 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sweep {
  0%, 100% { transform: translateY(-80px); opacity: 0.4; }
  50%       { transform: translateY(80px);  opacity: 0.9; }
}

.switch-overlay-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.scan-btns {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scan-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.scan-error {
  font-size: 13px;
  color: var(--color-danger);
  text-align: center;
  width: 100%;
}

/* ── Scan preview ── */
.scan-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title {
  font-family: var(--font-display);
  font-size: 18px;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  padding: 8px 12px;
  background: var(--color-surface-2);
  border-radius: var(--radius);
}

.preview-index {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-accent);
  width: 16px;
  flex-shrink: 0;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-actions .btn {
  width: 100%;
}
</style>