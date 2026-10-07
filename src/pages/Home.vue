<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHome } from '../composables/useHome';
import AppLogo from '../components/AppLogo.vue';
import AppAlert from '../components/AppAlert.vue';
import AppButton from '../components/AppButton.vue';

const router = useRouter();
const { partners, email, pin, isLoading, errorMessage, savedBoards, openBoard, createBoard } =
  useHome();

const isBoardsListOpen = ref(false);
const isHowItWorksOpen = ref(false);
const goToRecover = () => {
  router.push('/recover');
};

const onExpandEnter = (element: Element) => {
  const el = element as HTMLElement;
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
  const targetHeight = el.scrollHeight;
  el.style.height = targetHeight > 0 ? `${targetHeight}px` : 'auto';
  el.style.opacity = '1';
};

const onExpandAfterEnter = (element: Element) => {
  const el = element as HTMLElement;
  el.style.height = '';
  el.style.opacity = '';
  el.style.overflow = '';
  el.style.transition = '';
};

const onExpandLeave = (element: Element) => {
  const el = element as HTMLElement;
  el.style.height = `${el.offsetHeight}px`;
  el.style.opacity = '1';
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.transition = 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease';
  el.style.height = '0';
  el.style.opacity = '0';
};

const isEmailError = computed(
  () => !!errorMessage.value && errorMessage.value.includes('електронну пошту')
);
const isPartnerError = computed(
  () => !!errorMessage.value && errorMessage.value.includes('ім’я')
);
const isPinError = computed(
  () => !!errorMessage.value && errorMessage.value.includes('PIN')
);
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
                {{ savedBoards.length > 1 ? 'Останній щоденник' : 'Збережений щоденник' }}
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
                  ? 'Сховати список щоденників'
                  : `Обрати інший щоденник (${savedBoards.length - 1})`
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

          <Transition
            name="expand"
            @enter="onExpandEnter"
            @after-enter="onExpandAfterEnter"
            @leave="onExpandLeave"
          >
            <div v-if="isBoardsListOpen" class="saved-boards-collapse">
              <div class="saved-boards-dropdown">
              <div class="dropdown-list" role="list">
                <button
                  v-for="(board, idx) in savedBoards"
                  :key="board.key"
                  type="button"
                  class="board-select-btn"
                  :class="{ 'board-select-current': idx === 0 }"
                  @click="openBoard(board.key)"
                >
                  <div class="board-card-icon-wrap" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.8"
                      stroke="currentColor"
                      class="board-card-icon"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                  </div>
                  <div class="board-card-content">
                    <span class="board-select-names">{{ board.partners.join(' та ') }}</span>
                    <span v-if="idx === 0" class="current-badge">Останній</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="board-card-arrow"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Transition>
        </div>
      </div>

      <!-- How it works collapsible guide (shown only when no saved boards) -->
      <div v-if="savedBoards.length === 0" class="how-it-works-section">
        <button
          type="button"
          class="how-it-works-toggle"
          :aria-expanded="isHowItWorksOpen"
          @click="isHowItWorksOpen = !isHowItWorksOpen"
        >
          <span class="how-it-works-toggle-title">
            Як це працює?
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="how-it-works-chevron"
            :class="{ 'chevron-rotated': isHowItWorksOpen }"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <Transition
          name="expand"
          @enter="onExpandEnter"
          @after-enter="onExpandAfterEnter"
          @leave="onExpandLeave"
        >
          <div v-if="isHowItWorksOpen" class="how-it-works-collapse">
            <div class="how-it-works-content">
              <p class="how-it-works-lead">
                <strong>Alphabet Dating</strong> — це романтична традиція для пари, яка перетворює побачення на спільну захопливу пригоду за українським алфавітом від <strong>А</strong> до <strong>Я</strong>.
              </p>
              <ol class="how-it-works-steps">
                <li class="how-step">
                  <span class="step-num" aria-hidden="true">1</span>
                  <div class="step-text">
                    <strong>Обирайте літеру по черзі</strong>
                    <span>Обирайте разом або довіртеся рандомайзеру. Хто обрав — той планує побачення-сюрприз!</span>
                  </div>
                </li>
                <li class="how-step">
                  <span class="step-num" aria-hidden="true">2</span>
                  <div class="step-text">
                    <strong>Придумуйте ідею на обрану літеру</strong>
                    <span>Наприклад: <em>«А»</em> — Астрономічна обсерваторія, <em>«К»</em> — Каякінг, <em>«П»</em> — Пікнік на заході сонця.</span>
                  </div>
                </li>
                <li class="how-step">
                  <span class="step-num" aria-hidden="true">3</span>
                  <div class="step-text">
                    <strong>Встигніть до завершення таймера</strong>
                    <span>На виконання кожної літери є 30 днів, щоб не відкладати романтичні плани на потім.</span>
                  </div>
                </li>
                <li class="how-step">
                  <span class="step-num" aria-hidden="true">4</span>
                  <div class="step-text">
                    <strong>Зберігайте спільні спогади</strong>
                    <span>Відзначайте літеру виконаною, додавайте фотографії та щирі враження до вашого щоденника.</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </Transition>
      </div>

      <form class="setup-form" novalidate @submit.prevent="createBoard">
        <div v-for="(_, index) in partners" :key="index" class="input-group">
          <label :for="`partner-${index}`">
            {{ index === 0 ? "Ваше ім’я" : "Ім’я партнера або партнерки" }}
          </label>
          <input
            :id="`partner-${index}`"
            v-model="partners[index]"
            type="text"
            :placeholder="index === 0 ? 'Наприклад: Марія' : 'Наприклад: Олексій'"
            :class="{ 'input-error': isPartnerError }"
            @input="errorMessage = null"
          />
        </div>

        <div class="input-group">
          <div class="label-with-hint">
            <label for="board-email">Електронна пошта</label>
            <span class="hint-text">для відновлення доступу</span>
          </div>
          <input
            id="board-email"
            v-model="email"
            type="email"
            placeholder="Наприклад: email@example.com"
            :class="{ 'input-error': isEmailError }"
            @input="errorMessage = null"
          />
        </div>

        <div class="input-group">
          <div class="label-with-hint">
            <label for="board-pin">PIN-код для захисту</label>
            <span class="hint-text">необов’язково</span>
          </div>
          <input
            id="board-pin"
            v-model="pin"
            type="text"
            inputmode="numeric"
            maxlength="4"
            placeholder="4 цифри (наприклад: 1234)"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            :class="{ 'input-error': isPinError }"
            @input="errorMessage = null"
          />
        </div>

        <AppAlert
          v-if="errorMessage"
          class="form-error-banner"
          :message="errorMessage"
        />

        <AppButton
          type="submit"
          class="start-btn"
          variant="primary"
          size="lg"
          block
          :disabled="isLoading"
          :loading="isLoading"
          loading-text="Створення..."
        >
          Створити спільний щоденник
        </AppButton>
      </form>

      <!-- Recovery text button -->
      <div class="recovery-section">
        <button type="button" class="recover-text-btn" @click="goToRecover">
          Забули посилання на щоденник?
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
  gap: 0.5rem;
  flex-wrap: wrap;
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

input.input-error {
  border-color: var(--color-error, #c53030);
  background-color: var(--color-error-bg, #fff5f5);
}

input.input-error:focus {
  border-color: var(--color-error, #c53030);
  box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.2);
}

#board-pin {
  -webkit-text-security: disc;
  text-security: disc;
}

.start-btn {
  margin-top: 0.5rem;
}

.form-error-banner {
  text-align: center;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}

.how-it-works-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.how-it-works-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-ink-muted, #718096);
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 6px;
  user-select: none;
  transition: color 0.15s ease;
}

.how-it-works-toggle:hover {
  color: var(--color-accent, #d97732);
}

.how-it-works-toggle:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.how-it-works-toggle-title {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition: text-decoration-color 0.15s ease;
}

.how-it-works-toggle:hover .how-it-works-toggle-title {
  text-decoration-color: var(--color-accent, #d97732);
}

.how-it-works-chevron {
  width: 0.95rem;
  height: 0.95rem;
  color: currentColor;
  transition: transform 0.2s ease;
}

.how-it-works-content {
  width: 100%;
  margin-top: 0.75rem;
  padding: 1.15rem 1.25rem;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.05);
  text-align: left;
}

.how-it-works-lead {
  margin: 0.75rem 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-ink, #2d3748);
}

.how-it-works-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.how-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--color-ink, #2d3748);
}

.step-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-accent, #d97732);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.step-text strong {
  font-weight: 700;
  color: var(--color-ink, #2d3748);
}

.step-text span {
  color: var(--color-ink-muted, #718096);
  font-size: 0.85rem;
}

.step-text em {
  font-style: normal;
  font-weight: 600;
  color: var(--color-accent, #d97732);
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
  margin-top: 0.65rem;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.board-select-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(45, 55, 72, 0.04);
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink, #2d3748);
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.12s ease,
    box-shadow 0.15s ease;
}

.board-select-btn:hover {
  background-color: var(--color-bg, #fcf8f5);
  border-color: var(--color-accent, #d97732);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(45, 55, 72, 0.08);
}

.board-select-btn:active {
  transform: translateY(0);
}

.board-select-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.board-select-current {
  border-color: rgba(226, 92, 117, 0.4);
  background-color: #fff9fa;
}

.board-select-current:hover {
  border-color: #e25c75;
  background-color: #fff5f7;
}

.board-card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background-color: rgba(217, 119, 50, 0.1);
  color: var(--color-accent, #d97732);
  flex-shrink: 0;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.board-select-current .board-card-icon-wrap {
  background-color: rgba(226, 92, 117, 0.12);
  color: #e25c75;
}

.board-card-icon {
  width: 1.15rem;
  height: 1.15rem;
}

.board-card-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  min-width: 0;
}

.board-select-names {
  flex-grow: 1;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink, #2d3748);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: #e25c75;
  background: rgba(226, 92, 117, 0.1);
  border: 1px solid rgba(226, 92, 117, 0.2);
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  white-space: nowrap;
  flex-shrink: 0;
}

.board-card-arrow {
  width: 1rem;
  height: 1rem;
  color: var(--color-ink-muted, #718096);
  opacity: 0.4;
  flex-shrink: 0;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
}

.board-select-btn:hover .board-card-arrow {
  opacity: 1;
  color: var(--color-accent, #d97732);
  transform: translateX(2px);
}

.how-it-works-collapse,
.saved-boards-collapse {
  width: 100%;
  overflow: hidden;
}

.expand-enter-active {
  transition:
    height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
  overflow: hidden;
}

.expand-leave-active {
  transition:
    height 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
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
