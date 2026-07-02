<script setup>
import { ref, watch, onUnmounted } from 'vue'
import QRCode from 'qrcode'
import { useWorkoutsStore } from '../../stores/workouts'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workout: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'imported'])

const workoutsStore = useWorkoutsStore()

const tab = ref(props.workout ? 'share' : 'scan')
const qrDataUrl = ref(null)
const qrError = ref(null)

// Scan state
const scanError = ref(null)
const scanResult = ref(null)
const scanning = ref(false)
const videoRef = ref(null)

// Camera list — only videoinput devices, populated once on first scan
const cameras = ref([])
const cameraIndex = ref(0)
const hasMultipleCameras = ref(false)

let codeReader = null
let activeStream = null  // we own the MediaStream lifecycle

// ── Share tab ────────────────────────────────────────────────────────────────

async function generateQR() {
  if (!props.workout) return
  try {
    const payload = JSON.stringify({
      v: 1,
      title: props.workout.title,
      items: props.workout.items.map(i => ({
        exerciseId: i.exerciseId,
        exerciseName: i.exerciseName
      }))
    })
    qrDataUrl.value = await QRCode.toDataURL(payload, {
      width: 325,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#000', light: '#fff' }
    })
  } catch (e) {
    qrError.value = 'Failed to generate QR code.'
    console.error(e)
  }
}

// ── Camera helpers ────────────────────────────────────────────────────────────

async function loadCameraList() {
  try {
    // Brief probe stream needed so enumerateDevices returns labels on all browsers
    const probe = await navigator.mediaDevices.getUserMedia({ video: true })
    probe.getTracks().forEach(t => t.stop())

    const all = await navigator.mediaDevices.enumerateDevices()
    cameras.value = all
      .filter(d => d.kind === 'videoinput')
      .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 4)}` }))
    hasMultipleCameras.value = cameras.value.length > 1

    // Default to rear camera if detectable, otherwise last device (usually rear on mobile)
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
      // focusMode: continuous dramatically helps QR decode on phones that support it;
      // silently ignored on those that don't
      advanced: [{ focusMode: 'continuous' }]
    },
    audio: false
  }
}

// ── Scan ─────────────────────────────────────────────────────────────────────

async function startScan() {
  scanError.value = null
  scanResult.value = null
  scanning.value = true

  try {
    if (cameras.value.length === 0) await loadCameraList()

    const deviceId = cameras.value[cameraIndex.value]?.deviceId
    const constraints = buildConstraints(deviceId)

    // Own the stream directly so stopScan can kill it cleanly
    // independent of whatever zxing does internally
    activeStream = await navigator.mediaDevices.getUserMedia(constraints)
    videoRef.value.srcObject = activeStream

    const { BrowserQRCodeReader } = await import('@zxing/browser')
    codeReader = new BrowserQRCodeReader()

    const result = await codeReader.decodeOnceFromConstraints(constraints, videoRef.value)
    handleScanResult(result.getText())
  } catch (e) {
    if (e?.name === 'NotFoundException') return
    if (e?.name === 'NotAllowedError') {
      scanError.value = 'Camera permission denied. Allow camera access and try again.'
    } else if (e?.name === 'NotFoundError') {
      scanError.value = 'No camera found on this device.'
    } else {
      scanError.value = 'Camera unavailable. Check permissions and try again.'
    }
    scanning.value = false
    console.error(e)
  }
}

function stopScan() {
  scanning.value = false
  try { codeReader?.reset() } catch { /* ignore */ }
  try {
    activeStream?.getTracks().forEach(t => t.stop())
    activeStream = null
    if (videoRef.value) videoRef.value.srcObject = null
  } catch { /* ignore */ }
}

async function switchCamera() {
  if (!hasMultipleCameras.value) return
  stopScan()
  cameraIndex.value = (cameraIndex.value + 1) % cameras.value.length
  await new Promise(r => setTimeout(r, 200))
  startScan()
}

function handleScanResult(text) {
  stopScan()
  try {
    const payload = JSON.parse(text)
    if (!payload.v || !payload.title || !Array.isArray(payload.items)) {
      scanError.value = 'QR code is not a valid workout.'
      return
    }
    scanResult.value = payload
  } catch {
    scanError.value = 'Could not read QR code data.'
  }
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
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
          <img :src="qrDataUrl" alt="Workout QR Code" class="qr-img" />
          <p class="qr-hint">Show this to another device to share <strong>{{ workout?.title }}</strong></p>
          <p class="qr-meta">{{ workout?.items.length }} exercise{{ workout?.items.length === 1 ? '' : 's' }}</p>
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
            <!-- Switch button overlaid top-right, only when multiple cameras confirmed -->
            <button
              v-if="hasMultipleCameras && scanning"
              class="switch-overlay-btn"
              @click="switchCamera"
              aria-label="Switch camera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>

          <div v-if="scanError" class="scan-error">{{ scanError }}</div>

          <div class="scan-btns">
            <button v-if="!scanning" class="btn btn-accent scan-btn" @click="startScan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
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
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 16px 16px 0 0;
  padding: 18px 16px calc(28px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-header h3 {
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 24px;
  line-height: 1;
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

.qr-img {
  width: 325px;
  height: 325px;
  border-radius: var(--radius);
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

.qr-loading {
  color: var(--color-text-dim);
  font-size: 13px;
  padding: 32px 0;
}

/* ── Camera ── */
.video-wrap {
  position: relative;
  width: 100%;
  max-width: 485px;
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

/* Camera switch button — overlaid top-right corner of the viewfinder */
.switch-overlay-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255,255,255,0.2);
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