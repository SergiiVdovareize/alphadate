<script setup lang="ts">
import { useHome } from '../composables/useHome';
import AppLogo from '../components/AppLogo.vue';

const { partners, email, isLoading, errorMessage, savedBoards, openBoard, createBoard } = useHome();
</script>

<template>
  <main class="home-container">
    <div class="card">
      <div class="logo-wrap">
        <AppLogo :size="52" />
      </div>
      <h1>AlphaDate</h1>
      <p>Створіть свій унікальний простір для планування побачень.</p>

      <!-- Quick continue banner for the most recent board -->
      <div
        v-if="savedBoards.length > 0"
        class="recent-suggestion"
        @click="openBoard(savedBoards[0].key)"
      >
        <span class="suggestion-tag">Збережена дошка:</span>
        <span class="suggestion-partners">{{ savedBoards[0].partners.join(' та ') }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="arrow-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>

      <form class="setup-form" @submit.prevent="createBoard">
        <div v-for="(_, index) in partners" :key="index" class="input-group">
          <label v-if="index === 0">Ваше ім'я</label>
          <label v-else>Ім'я партнера</label>
          <input
            v-model="partners[index]"
            type="text"
            required
            :placeholder="index === 0 ? 'Наприклад: Олексій' : 'Наприклад: Марія'"
          />
        </div>

        <div class="input-group">
          <label>Електронна пошта</label>
          <input v-model="email" type="email" required placeholder="Наприклад: email@example.com" />
        </div>

        <div v-if="errorMessage" class="form-error-banner" role="alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="start-btn" :disabled="isLoading">
          {{ isLoading ? 'Створення...' : 'Створити спільну дошку' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
}

.card {
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: inset 0 2px 6px rgba(45, 55, 72, 0.06);
}

.logo-wrap {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: center;
}

h1 {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: var(--color-ink, #2d3748);
  letter-spacing: -0.02em;
}

p {
  color: var(--color-ink-muted, #718096);
  margin-bottom: 2rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
}

input {
  padding: 0.85rem 1rem;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  font-size: 1rem;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: var(--color-accent, #ea7a87);
  box-shadow: 0 0 0 3px rgba(234, 122, 135, 0.2);
}

.start-btn {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: var(--color-accent, #ea7a87);
  color: #ffffff;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.start-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover, #dc6876);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.start-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748);
}

.form-error-banner {
  padding: 0.65rem 0.9rem;
  background-color: rgba(234, 122, 135, 0.12);
  border: 1.5px solid var(--color-accent, #ea7a87);
  border-radius: 10px;
  color: var(--color-accent, #ea7a87);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}

.recent-suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface, #ffffff);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.75rem;
  cursor: pointer;
  box-shadow: var(--shadow-3d-sm, 0 2.5px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
  text-align: left;
}

.recent-suggestion:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
}

.recent-suggestion:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.suggestion-tag {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-accent, #ea7a87);
  letter-spacing: 0.05em;
  margin-right: 0.5rem;
}

.suggestion-partners {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-ink, #2d3748);
  flex-grow: 1;
}

.recent-suggestion .arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-ink, #2d3748);
  margin-left: 0.5rem;
}
</style>
