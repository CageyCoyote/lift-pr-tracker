<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeopleStore } from '../../stores/people'

const router = useRouter()
const peopleStore = usePeopleStore()

const name = ref('')
const error = ref('')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Please enter your name.'
    return
  }
  peopleStore.addPerson(trimmed)
  router.replace('/')
}
</script>

<template>
  <div class="welcome-page">
    <div class="welcome-content">

      <div class="logo-mark">
        <img class="logo-img" src="/icons/image.png?url" />
        <!-- <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" stroke="var(--color-accent)" stroke-width="3"/>
          <circle cx="28" cy="28" r="13" stroke="var(--color-accent)" stroke-width="2"/>
          <rect x="25" y="6" width="6" height="44" rx="3" fill="var(--color-text)"/>
        </svg> -->
      </div>

      <header class="welcome-header">
        <span class="eyebrow">Personal Records</span>
        <h1>Tracker</h1>
        <p class="welcome-sub">Track your lifts, own your progress.</p>
      </header>

      <form class="welcome-form" @submit.prevent="submit">
        <div class="field">
          <label class="eyebrow" for="name-input">What's your name?</label>
          <input id="name-input" v-model="name" type="text" placeholder="e.g. Alex" autocomplete="given-name"
            autofocus />
          <span v-if="error" class="field-error">{{ error }}</span>
        </div>
        <button type="submit" class="btn btn-accent submit-btn">
          Start Tracking →
        </button>
      </form>

      <p class="welcome-note">
        You can add more people later under <strong>People</strong>.
      </p>

    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #252726; /* hides the background color of the logo */
}

.welcome-content {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* ── Logo ── */
.logo-mark {
  opacity: 0.9;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.logo-img {
  width: 35%;
}

/* ── Header ── */
.welcome-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.welcome-header h1 {
  font-size: 42px;
  line-height: 1;
}

.welcome-sub {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-dim);
}

/* ── Form ── */
.welcome-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field input {
  width: 100%;
  font-size: 18px;
  padding: 14px 16px;
  text-align: center;
}

.field-error {
  font-size: 12px;
  color: var(--color-danger);
  text-align: center;
}

.submit-btn {
  width: 100%;
  font-size: 16px;
  padding: 16px;
  font-family: var(--font-display);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ── Footer note ── */
.welcome-note {
  font-size: 12px;
  color: var(--color-text-dim);
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.welcome-note strong {
  color: var(--color-text);
}
</style>