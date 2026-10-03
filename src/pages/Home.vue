<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHome } from '../composables/useHome';
import AppLogo from '../components/AppLogo.vue';

const router = useRouter();
const { partners, email, pin, isLoading, errorMessage, savedBoards, openBoard, createBoard } =
  useHome();

const isBoardsListOpen = ref(false);
const goToRecover = () => {
  router.push('/recover');
};
</script>

<template>
  <main class="home-container">
    <div class="card">
      <div class="logo-wrap">
        <AppLogo :size="52" />
      </div>
      <h1>AlphaDate</h1>
      <p>Створіть свій унікальний простір для планування побачень.</p>

      <!-- Quick continue banner & selector for saved boards -->
      <div v-if="savedBoards.length > 0" class="saved-boards-section">
        <!-- Main card for the most recent board -->
        <button type="button" class="recent-suggestion" @click="openBoard(savedBoards[0].key)">
          <div class="suggestion-content">
            <div class="suggestion-header">
              <span class="suggestion-tag">
                <span class="tag-heart" aria-hidden="true">💕</span>
                {{ savedBoards.length > 1 ? 'Остання дошка' : 'Збережена дошка' }}
              </span>
            </div>
            <div class="suggestion-partners">
              {{ savedBoards[0].partners.join(' та ') }}
            </div>
          </div>
          <div class="suggestion-action" aria-hidden="true">
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
        </button>

        <!-- Toggle for selecting among all saved boards when > 1 -->
        <div v-if="savedBoards.length > 1" class="boards-picker-wrap">
          <button
            type="button"
            class="toggle-boards-btn"
            :aria-expanded="isBoardsListOpen"
            @click="isBoardsListOpen = !isBoardsListOpen"
          >
            <span class="toggle-btn-text">
              {{
                isBoardsListOpen
                  ? 'Сховати список дошок'
                  : `Вибрати іншу дошку (${savedBoards.length - 1})`
              }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="toggle-chevron"
              :class="{ 'chevron-rotated': isBoardsListOpen }"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <Transition name="expand">
            <div v-if="isBoardsListOpen" class="saved-boards-dropdown">
              <ul class="dropdown-list">
                <li v-for="(board, idx) in savedBoards" :key="board.key" class="dropdown-item">
                  <button
                    type="button"
                    class="board-select-btn"
                    :class="{ 'board-select-current': idx === 0 }"
                    @click="openBoard(board.key)"
                  >
                    <span class="board-bullet" aria-hidden="true">•</span>
                    <span class="board-select-names">{{ board.partners.join(' та ') }}</span>
                    <span v-if="idx === 0" class="current-badge">(активна)</span>
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>

      <form class="setup-form" @submit.prevent="createBoard">
        <div v-for="(_, index) in partners" :key="index" class="input-group">
          <label :for="`partner-${index}`">
            {{ index === 0 ? "Ваше ім'я" : "Ім'я партнера" }}
          </label>
          <input
            :id="`partner-${index}`"
            v-model="partners[index]"
            type="text"
            required
            :placeholder="index === 0 ? 'Наприклад: Олексій' : 'Наприклад: Марія'"
          />
        </div>

        <div class="input-group">
          <label for="board-email">Електронна пошта</label>
          <input
            id="board-email"
            v-model="email"
            type="email"
            required
            placeholder="Наприклад: email@example.com"
          />
        </div>

        <div class="input-group">
          <div class="label-with-hint">
            <label for="board-pin">PIN-код для захисту</label>
            <span class="hint-text">необов'язково</span>
          </div>
          <input
            id="board-pin"
            v-model="pin"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="4"
            placeholder="4 цифри (наприклад: 1234)"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </div>

        <div v-if="errorMessage" class="form-error-banner" role="alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="start-btn" :disabled="isLoading">
          {{ isLoading ? 'Створення...' : 'Створити спільну дошку' }}
        </button>
      </form>

      <!-- Recovery text button -->
      <div class="recovery-section">
        <button type="button" class="recover-text-btn" @click="goToRecover">
          Забули посилання на дошку?
        </button>
      </div>
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
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: none;
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

.label-with-hint {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.hint-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-ink-muted, #718096);
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
  border-color: var(--color-accent, #d97732);
  box-shadow: 0 0 0 3px rgba(217, 119, 50, 0.15);
}

#board-pin {
  -webkit-text-security: disc;
  text-security: disc;
}

.start-btn {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: var(--color-accent, #d97732);
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
  background-color: var(--color-accent-hover, #c26522);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.start-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.start-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748);
}

.start-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.form-error-banner {
  padding: 0.65rem 0.9rem;
  background-color: var(--color-error-bg, #fff5f5);
  border: 1.5px solid var(--color-error-border, #feb2b2);
  border-radius: var(--radius-error, 10px);
  color: var(--color-error, #c53030);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}

.saved-boards-section {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 2rem;
  width: 100%;
}

.recent-suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  background-color: #fdebee;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 14px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 0;
  cursor: pointer;
  box-shadow: var(--shadow-3d-sm, 0 3px 0 #2d3748);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background-color 0.15s ease;
  text-align: left;
}

.recent-suggestion:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3d, 0 5px 0 #2d3748);
  background-color: #fbe0e7;
}

.recent-suggestion:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
  background-color: #f8d0dc;
}

.recent-suggestion:focus-visible {
  outline: 2px solid #e25c75;
  outline-offset: 3px;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  flex: 1;
}

.suggestion-header {
  display: flex;
  align-items: center;
}

.suggestion-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ad2e52;
  background-color: rgba(226, 92, 117, 0.16);
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  line-height: 1.2;
}

.tag-heart {
  font-size: 0.75rem;
  line-height: 1;
}

.suggestion-partners {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-ink, #2d3748);
  line-height: 1.35;
  word-break: break-word;
}

.suggestion-action {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #e25c75;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(226, 92, 117, 0.35);
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.recent-suggestion:hover .suggestion-action {
  transform: translateX(2px);
  background-color: #cc4963;
}

.suggestion-action .arrow-icon {
  width: 1rem;
  height: 1rem;
  stroke: currentColor;
}

.boards-picker-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -0.25rem;
}

.toggle-boards-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  padding: 0.35rem 0.65rem;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-ink-muted, #718096);
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.toggle-boards-btn:hover {
  color: var(--color-accent, #d97732);
}

.toggle-boards-btn .toggle-btn-text {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition: text-decoration-color 0.15s ease;
}

.toggle-boards-btn:hover .toggle-btn-text {
  text-decoration-color: var(--color-accent, #d97732);
}

.toggle-boards-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.toggle-chevron {
  width: 0.95rem;
  height: 0.95rem;
  transition: transform 0.2s ease;
}

.chevron-rotated {
  transform: rotate(180deg);
}

.saved-boards-dropdown {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.4rem 0.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dropdown-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dropdown-item {
  margin: 0;
  padding: 0;
}

.board-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.35rem 0.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink-muted, #718096);
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
  transition:
    color 0.12s ease,
    background-color 0.12s ease;
}

.board-select-btn:hover {
  color: var(--color-accent, #d97732);
  background-color: rgba(217, 119, 50, 0.08);
}

.board-select-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.board-select-current {
  color: var(--color-ink, #2d3748);
  font-weight: 700;
}

.board-bullet {
  color: var(--color-accent, #d97732);
  font-size: 1rem;
  line-height: 1;
}

.board-select-names {
  flex-grow: 1;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.25);
  word-break: break-word;
  transition: text-decoration-color 0.12s ease;
}

.board-select-btn:hover .board-select-names {
  text-decoration-color: var(--color-accent, #d97732);
}

.current-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-accent, #d97732);
  margin-left: 0.35rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.recovery-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(223, 213, 202, 0.4);
  display: flex;
  justify-content: center;
}

.recover-text-btn {
  background: none;
  border: none;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: #718096;
  cursor: pointer;
  border-radius: 8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition:
    color 0.2s ease,
    text-decoration-color 0.2s ease;
  font-family: inherit;
}

.recover-text-btn:hover {
  color: var(--color-accent, #d97732);
  text-decoration-color: var(--color-accent, #d97732);
}

.recover-text-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}
</style>
