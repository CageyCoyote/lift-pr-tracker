<script setup>
import { ref, watch, onUnmounted } from 'vue'
import QRCode from 'qrcode'
import { useSharePR } from '../../composables/useSharePR'
import { useImportPR } from '../../composables/useImportPR'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Pass an entry + personId to open straight into "share" mode.
  // Omit both to open straight into "scan/paste" (import) mode.
  entry: { type: Object, default: null },
  personId: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'imported'])

const { shareViaWebShare, copyToClipboard } = useSharePR()
const {
  importDialogOpen,
  pendingPayload,
  importOptions,
  startImport,
  finishImport,
  cancelImport,
} = useImportPR()

const isShareMode = ref(!!props.entry)
const tab = ref('share') // 'share' | 'scan'

const qrDataUrl = ref(null)
const qrError = ref(null)
const copyStatus = ref(null) // null | 'copied' | 'failed'

const pasteText = ref('')
const importError = ref(null)
const confirmingOption = ref(null) // holds the option pending a mismatch confirmation

// ── Camera scan state (mirrors WorkoutQRSheet) ─────────────────────────────
const scanError = ref(null)
const scanning = ref(false)
const videoRef = ref(null)
const cameras = ref([])
const cameraIndex = ref(0)
const hasMultipleCameras = ref(false)
let codeReader = null

// ── Share tab ───────────────────────────────────────────────────────────────

async function attemptShare() {
  if (!props.entry || !props.personId) return
  qrError.value = null
  copyStatus.value = null

  await shareViaWebShare(props.entry, props.personId)

  // Whether Web Share succeeded, was cancelled, or isn't supported at all,
  // keep the sheet open with the QR/copy fallback underneath it. On desktop
  // especially, people often dismiss the native share popup without picking
  // anything, so this is the only reliable way to get the code afterward.
  await generateQR()
}

async function generateQR() {
  qrError.value = null
  qrDataUrl.value = null
  try {
    const { encodePRPayload } = useSharePR()
    const text = encodePRPayload(props.entry, props.personId)
    if (!text) throw new Error('Could not build share code — missing share ID.')
    qrDataUrl.value = await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'L',
      color: { dark: '#000', light: '#fff' },
    })
  } catch (e) {
    qrError.value = e.message ?? 'Failed to generate QR code.'
    console.error('[PR QR generate]', e)
  }
}

async function doCopy() {
  const result = await copyToClipboard(props.entry, props.personId)
  copyStatus.value = result === 'copied' ? 'copied' : 'failed'
  setTimeout(() => (copyStatus.value = null), 2000)
}

// ── Import (paste) ─────────────────────────────────────────────────────────

function handleImportText(text) {
  importError.value = null
  const trimmed = text.trim()
  if (!trimmed) return

  const result = startImport(trimmed)
  if (result?.error) {
    importError.value = result.error
    return
  }
  if (result?.autoImported) {
    emit('imported', result.personId)
    close()
    return
  }
  // needsConfirmation → importDialogOpen is now true, dialog renders below
}

function submitPaste() {
  handleImportText(pasteText.value)
  pasteText.value = ''
}

function chooseImportTarget(opt) {
  if (opt.identityMismatch && confirmingOption.value?.id !== opt.id) {
    // First tap on a mismatched option just asks for confirmation —
    // doesn't commit anything yet.
    confirmingOption.value = opt
    return
  }
  confirmingOption.value = null
  const personId = finishImport(opt.id)
  if (personId) {
    emit('imported', personId)
    close()
  }
}

// ── Camera helpers (same pattern as WorkoutQRSheet) ────────────────────────

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
      width: { ideal: 1280 },
      height: { ideal: 720 },
      advanced: [{ focusMode: 'continuous' }],
    },
    audio: false,
  }
}

function stopScan() {
  scanning.value = false
  if (codeReader) {
    try { codeReader.reset() } catch { /* ignore */ }
    codeReader = null
  }
  if (videoRef.value) {
    try { videoRef.value.srcObject = null } catch { /* ignore */ }
  }
}

async function startScan() {
  if (scanning.value) return
  scanError.value = null
  importError.value = null
  scanning.value = true

  try {
    if (cameras.value.length === 0) await loadCameraList()
    const deviceId = cameras.value[cameraIndex.value]?.deviceId
    const constraints = buildConstraints(deviceId)

    const { BrowserQRCodeReader } = await import('@zxing/browser')
    if (!scanning.value) return

    codeReader = new BrowserQRCodeReader()
    const result = await codeReader.decodeOnceFromConstraints(constraints, videoRef.value)
    if (!scanning.value) return

    stopScan()
    handleImportText(result.getText())
  } catch (e) {
    if (e?.name === 'NotFoundException') {
      scanning.value = false
      return
    }
    if (e?.name === 'NotAllowedError') {
      scanError.value = 'Camera permission denied. Allow camera access and try again.'
    } else if (e?.name === 'NotFoundError') {
      scanError.value = 'No camera found on this device.'
    } else {
      scanError.value = 'Camera unavailable. Check permissions and try again.'
      console.error('[PR QR scan]', e)
    }
    stopScan()
  }
}

async function switchCamera() {
  if (!hasMultipleCameras.value || !scanning.value) return
  stopScan()
  cameraIndex.value = (cameraIndex.value + 1) % cameras.value.length
  await new Promise(r => setTimeout(r, 250))
  startScan()
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

watch(() => props.modelValue, (open) => {
  if (open) {
    isShareMode.value = !!props.entry
    tab.value = isShareMode.value ? 'share' : 'scan'
    qrDataUrl.value = null
    qrError.value = null
    copyStatus.value = null
    scanError.value = null
    importError.value = null
    pasteText.value = ''
    confirmingOption.value = null
    if (isShareMode.value) attemptShare()
  } else {
    stopScan()
    cancelImport()
    confirmingOption.value = null
  }
})

watch(tab, (t) => {
  if (t === 'scan') { importError.value = null }
  else stopScan()
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
        <h3>{{ isShareMode ? 'Share PR' : 'Import PR' }}</h3>
        <button class="close-btn" @click="close" aria-label="Close">×</button>
      </header>

      <!-- Tabs — only show both when opened generically (no entry provided) -->
      <div v-if="!entry" class="tabs">
        <button class="tab" :class="{ active: tab === 'scan' }" @click="tab = 'scan'">Scan / Paste</button>
      </div>

      <!-- ── Share ── -->
      <div v-if="isShareMode" class="tab-content">
        <div v-if="qrError" class="scan-error">{{ qrError }}</div>
        <div v-else-if="qrDataUrl" class="qr-wrap">
          <div class="qr-card">
            <img :src="qrDataUrl" alt="PR share code" class="qr-img" />
          </div>
          <p class="qr-hint">
            Have them scan this to import <strong>{{ entry?.exerciseName }}</strong>
          </p>
          <button class="btn copy-btn" @click="doCopy">
            {{ copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Copy code instead' }}
          </button>
        </div>
        <div v-else class="qr-loading">Preparing share…</div>
      </div>

      <!-- ── Scan / Paste (import) ── -->
      <div v-if="!isShareMode" class="tab-content">

        <!-- Confirmation dialog: who does this PR belong to locally? -->
        <div v-if="importDialogOpen && pendingPayload" class="scan-preview">
          <div class="preview-header">
            <span class="preview-title">New PR from {{ pendingPayload.personName }}</span>
          </div>
          <p class="qr-hint">
            {{ pendingPayload.exerciseName }} — {{ pendingPayload.unit === 'bodyweight'
              ? `${pendingPayload.reps} reps` : `${pendingPayload.weight}${pendingPayload.unit} × ${pendingPayload.reps}` }}
            on {{ pendingPayload.date }}
          </p>
          <p class="qr-hint">Who is this?</p>
          <ul class="preview-list">
            <li v-for="opt in importOptions" :key="opt.id">
              <button class="btn option-btn" :class="{ accent: opt.isNew, warn: opt.identityMismatch }" @click="chooseImportTarget(opt)">
                {{ opt.name }}
              </button>
              <p v-if="confirmingOption?.id === opt.id" class="mismatch-warning">
                {{ opt.name }} already has their own share code — this PR is from someone else.
                Tap "{{ opt.name }}" again to import anyway, or pick a different option.
              </p>
            </li>
          </ul>
          <button class="btn" @click="cancelImport">Cancel</button>
        </div>

        <template v-else>
          <!-- Paste-a-code input -->
          <div class="paste-row">
            <input
              v-model="pasteText"
              type="text"
              class="paste-input"
              placeholder="Paste share code (PRK:PR:1:...)"
              @keyup.enter="submitPaste"
            />
            <button class="btn btn-accent" @click="submitPaste" :disabled="!pasteText.trim()">Import</button>
          </div>
          <div v-if="importError" class="scan-error">{{ importError }}</div>

          <!-- Camera -->
          <div class="video-wrap">
            <video ref="videoRef" class="video" autoplay muted playsinline />
            <div class="scan-line" />
            <button v-if="hasMultipleCameras && scanning" class="switch-overlay-btn" @click="switchCamera" aria-label="Switch camera">⟲</button>
          </div>

          <div v-if="scanError" class="scan-error">{{ scanError }}</div>

          <div class="scan-btns">
            <button v-if="!scanning" class="btn btn-accent scan-btn" @click="startScan">Start Camera</button>
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

.tabs {
  display: flex;
  gap: 6px;
}

.tab {
  flex: 1;
  background: var(--color-surface-2);
  border: none;
  border-radius: 7px;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-dim);
}

.tab.active {
  background: var(--color-surface);
  color: var(--color-text);
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.qr-card {
  background: #fff;
  padding: 16px;
  border-radius: var(--radius);
  display: flex;
}

.qr-img {
  width: 240px;
  height: 240px;
  display: block;
}

.qr-hint {
  font-size: 13px;
  color: var(--color-text-dim);
  text-align: center;
  margin: 0;
}

.qr-loading {
  color: var(--color-text-dim);
  font-size: 13px;
  padding: 32px 0;
}

.copy-btn {
  width: 100%;
}

.paste-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.paste-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

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
  50% { transform: translateY(80px); opacity: 0.9; }
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
}

.scan-btns {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scan-btn {
  width: 100%;
}

.scan-error {
  font-size: 13px;
  color: var(--color-danger);
  text-align: center;
  width: 100%;
}

.scan-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title {
  font-family: var(--font-display);
  font-size: 17px;
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-btn {
  width: 100%;
  text-align: left;
}

.option-btn.accent {
  background: var(--color-accent);
  color: #1a1500;
  border: none;
}

.option-btn.warn {
  border-color: var(--color-danger);
}

.mismatch-warning {
  font-size: 12px;
  color: var(--color-danger);
  margin: 4px 0 0;
  line-height: 1.4;
}
</style>
