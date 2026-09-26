<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import RandomPickButton from '../components/RandomPickButton.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import AppLogo from '../components/AppLogo.vue';
import { useAlphabetState } from '../composables/useAlphabetState';
import type { LetterState, LetterStatus } from '../composables/useAlphabetState';

const route = useRoute();
const router = useRouter();

// Retrieve ID from URL params. Fallback to default if somehow missing.
const boardId = (route.params.id as string) || 'default';

const {
  letters,
  metadata,
  markAsStatus,
  pickRandom,
  deleteBoardState,
  activeLetter,
  selectLetter
} = useAlphabetState(boardId);

const isDeleteModalOpen = ref(false);

const COUNTDOWN_DAYS = 30;
const now = ref(Date.now());
let timerInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

const countdownInfo = computed(() => {
  if (!activeLetter.value || !metadata.value.currentLetterSelectedAt) {
    return null;
  }

  const selectedTime = new Date(metadata.value.currentLetterSelectedAt).getTime();
  if (isNaN(selectedTime)) return null;

  const deadline = selectedTime + COUNTDOWN_DAYS * 24 * 60 * 60 * 1000;
  const remaining = deadline - now.value;

  if (remaining <= 0) {
    return {
      expired: true,
      urgent: true,
      text: 'Час на побачення вичерпано!'
    };
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const urgent = days < 3;

  let text = '';
  if (days > 0) {
    text = `Залишилось: ${days} дн. ${hours} год. ${minutes} хв`;
  } else if (hours > 0) {
    text = `Залишилось: ${hours} год. ${minutes} хв ${seconds} с`;
  } else {
    text = `Залишилось: ${minutes} хв ${seconds} с`;
  }

  return {
    expired: false,
    urgent,
    text
  };
});

const isCompleting = ref(false);
const completionNote = ref('');
const confirmingAction = ref<'exclude' | 'cancel' | null>(null);
let confirmTimeout: ReturnType<typeof setTimeout> | null = null;

const clearConfirmTimeout = () => {
  if (confirmTimeout) {
    clearTimeout(confirmTimeout);
    confirmTimeout = null;
  }
};

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  clearConfirmTimeout();
});

const startCompleting = () => {
  clearConfirmTimeout();
  confirmingAction.value = null;
  completionNote.value = activeLetter.value?.note || '';
  isCompleting.value = true;
};

const cancelCompleting = () => {
  isCompleting.value = false;
  completionNote.value = '';
};

const submitComplete = () => {
  if (!activeLetter.value) return;
  const letterChar = activeLetter.value.letter;
  const note = completionNote.value.trim();
  markAsStatus(letterChar, 'used', note);
  isCompleting.value = false;
  completionNote.value = '';
  clearConfirmTimeout();
  confirmingAction.value = null;
};

const handleConfirmableAction = (action: 'exclude' | 'cancel') => {
  if (confirmingAction.value === action) {
    clearConfirmTimeout();
    confirmingAction.value = null;
    if (action === 'exclude' && activeLetter.value) {
      handleUpdateStatus(activeLetter.value.letter, 'excluded');
    } else if (action === 'cancel') {
      selectLetter(null);
      isCompleting.value = false;
      completionNote.value = '';
    }
  } else {
    clearConfirmTimeout();
    confirmingAction.value = action;
    confirmTimeout = setTimeout(() => {
      confirmingAction.value = null;
    }, 4000);
  }
};

const handleUpdateStatus = (letterChar: string, status: LetterStatus) => {
  markAsStatus(letterChar, status);
  clearConfirmTimeout();
  confirmingAction.value = null;
  isCompleting.value = false;
  completionNote.value = '';
};

const handleSelectLetter = (letter: LetterState) => {
  if (activeLetter.value) return;
  clearConfirmTimeout();
  confirmingAction.value = null;
  isCompleting.value = false;
  completionNote.value = '';
  selectLetter(letter);
};

const handleDeleteConfirm = async () => {
  await deleteBoardState();
  isDeleteModalOpen.value = false;
  goHome();
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <main class="container">
    <header class="header">
      <div
        class="brand-wrap"
        style="cursor: pointer"
        title="Повернутися на головну"
        @click="goHome"
      >
        <AppLogo :size="38" />
        <h1 class="brand-title">AlphaDate</h1>
      </div>
    </header>

    <div v-if="metadata.partners && metadata.partners.length > 0" class="turn-container">
      <span class="turn-label">Черга організовувати побачення</span>
      <div class="turn-badges">
        <span
          v-for="partner in metadata.partners"
          :key="partner.id"
          class="partner-badge"
          :class="{ active: partner.id === metadata.currentPartnerId }"
        >
          <span
            v-if="partner.id === metadata.currentPartnerId"
            class="active-dot"
            aria-hidden="true"
          ></span>
          <span class="partner-name">{{ partner.name }}</span>
        </span>
      </div>
    </div>

    <!-- Active Letter Action Panel -->
    <div class="active-letter-panel">
      <div v-if="activeLetter" class="panel-content">
        <div class="letter-display-wrap">
          <h2 class="active-letter-char">{{ activeLetter.letter }}</h2>
          <div
            v-if="countdownInfo"
            class="countdown-badge"
            :class="{ 'is-urgent': countdownInfo.urgent, 'is-expired': countdownInfo.expired }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="countdown-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>{{ countdownInfo.text }}</span>
          </div>
          <!-- Existing note if letter was completed with a note and not in editing mode -->
          <div v-if="activeLetter.note && !isCompleting" class="existing-note-box">
            <span class="existing-note-label">Нотатка про побачення:</span>
            <p class="existing-note-text">«{{ activeLetter.note }}»</p>
          </div>
        </div>

        <!-- Inline completion form with comment input -->
        <div v-if="isCompleting" class="completion-form">
          <label class="comment-label" for="date-note"> Як пройшло побачення? </label>
          <textarea
            id="date-note"
            v-model="completionNote"
            rows="3"
            class="comment-textarea"
            placeholder="Опишіть ваші враження, куди сходили... (необов'язково)"
            autofocus
          ></textarea>
          <div class="completion-actions">
            <button class="button success confirm-btn" @click="submitComplete">
              Підтвердити виконання
            </button>
            <button class="button outline cancel-btn" @click="cancelCompleting">Назад</button>
          </div>
        </div>

        <!-- Normal action buttons with inline two-step confirmation -->
        <div v-else class="action-buttons">
          <button
            class="button text close-panel-btn"
            :class="{ 'is-confirming': confirmingAction === 'cancel' }"
            @click="handleConfirmableAction('cancel')"
          >
            <span>{{ confirmingAction === 'cancel' ? 'Точно обрати іншу?' : 'Обрати іншу' }}</span>
            <span v-if="confirmingAction === 'cancel'" class="confirm-progress-bar"></span>
          </button>
          <button
            v-if="activeLetter.status !== 'excluded'"
            class="button danger"
            :class="{ 'is-confirming': confirmingAction === 'exclude' }"
            @click="handleConfirmableAction('exclude')"
          >
            <span>{{ confirmingAction === 'exclude' ? 'Точно виключити?' : 'Виключити' }}</span>
            <span v-if="confirmingAction === 'exclude'" class="confirm-progress-bar"></span>
          </button>
          <button
            v-if="activeLetter.status !== 'used'"
            class="button success complete-main-btn"
            @click="startCompleting"
          >
            Виконано
          </button>
        </div>
      </div>
      <div v-else class="panel-placeholder">
        <p>Оберіть літеру вручну на дошці або натисніть кнопку випадкового вибору.</p>
        <RandomPickButton :pick-random="pickRandom" @pick="selectLetter" />
      </div>
    </div>

    <AlphabetGrid
      :letters="letters"
      :active-letter="activeLetter?.letter"
      :disabled="!!activeLetter"
      @select="handleSelectLetter"
    />

    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      @confirm="handleDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />

    <footer class="footer">
      <button class="button reset-btn" @click="isDeleteModalOpen = true">Видалити дошку</button>
    </footer>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  user-select: none;
  transition: transform 0.15s ease;
}

.brand-wrap:hover {
  transform: translateY(-1px);
}

.brand-wrap:active {
  transform: translateY(2px);
}

.brand-title {
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  color: var(--color-ink, #2d3748);
  letter-spacing: -0.02em;
}

.turn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 2rem 0;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
  box-shadow: inset 0 2px 6px rgba(45, 55, 72, 0.06);
}

.turn-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink-muted, #718096);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.turn-badges {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.partner-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface-muted, #f3eae3);
  border: 1.5px solid transparent;
  color: var(--color-ink-muted, #718096);
  padding: 0.4rem 1.1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: default;
  user-select: none;
  box-shadow: none;
  transition: all 0.2s ease;
}

.partner-badge.active {
  background: #ffffff;
  border-color: var(--color-accent, #ea7a87);
  color: var(--color-ink, #2d3748);
  font-weight: 700;
  box-shadow: none;
  transform: none;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent, #ea7a87);
  display: inline-block;
  flex-shrink: 0;
}

.active-letter-panel {
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 22px;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  box-shadow: inset 0 2px 6px rgba(45, 55, 72, 0.06);
  text-align: center;
}

.panel-placeholder {
  color: var(--color-ink, #2d3748);
  font-size: 1rem;
  padding: 0.5rem 0;
  margin: 0;
}

.panel-placeholder p {
  color: var(--color-ink-muted, #718096);
  margin: 0;
  font-weight: 500;
}

.panel-placeholder :deep(.selector-container) {
  margin: 1.25rem 0 0 0;
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.letter-display-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.active-letter-char {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: var(--color-accent, #ea7a87);
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: var(--color-surface-muted, #f3eae3);
  border: 1px solid rgba(45, 55, 72, 0.15);
  box-shadow: none;
  color: var(--color-ink, #2d3748);
  margin-top: 0.5rem;
  cursor: default;
  user-select: none;
}

.countdown-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--color-accent, #ea7a87);
}

.countdown-badge.is-urgent {
  background: rgba(234, 122, 135, 0.12);
  border-color: rgba(234, 122, 135, 0.4);
  color: var(--color-accent, #ea7a87);
}

.countdown-badge.is-expired {
  background: rgba(234, 122, 135, 0.18);
  border-color: var(--color-accent, #ea7a87);
  color: var(--color-accent, #ea7a87);
  font-weight: 700;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.action-buttons button {
  position: relative;
  overflow: hidden;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;
}

.action-buttons .complete-main-btn {
  grid-column: 1 / -1;
}

.action-buttons button span:not(.confirm-progress-bar) {
  position: relative;
  z-index: 1;
}

/* Button variants */
.button.success {
  background-color: var(--color-accent, #ea7a87);
  color: #ffffff;
}
.button.success:hover {
  background-color: var(--color-accent-hover, #dc6876);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}
.button.success:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.button.danger {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
}
.button.danger:hover {
  background-color: var(--color-surface, #ffffff);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}
.button.danger:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.button.outline {
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
}
.button.outline:hover {
  background-color: var(--color-surface-muted, #f3eae3);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}
.button.outline:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.close-panel-btn {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
}
.close-panel-btn:hover {
  background-color: var(--color-surface, #ffffff);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}
.close-panel-btn:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

/* Inline completion form with comment input */
.completion-form {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  text-align: left;
}

.comment-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.comment-textarea {
  width: 100%;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-ink, #2d3748);
  background: #ffffff;
  resize: vertical;
  min-height: 75px;
  box-shadow: inset 0 2px 0 rgba(45, 55, 72, 0.04);
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-accent, #ea7a87);
  box-shadow: 0 0 0 3px rgba(234, 122, 135, 0.2);
}

.completion-actions {
  display: flex;
  gap: 0.65rem;
}

.completion-actions .confirm-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  cursor: pointer;
  background-color: var(--color-accent-confirm, #5ea885);
  color: #ffffff;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.completion-actions .confirm-btn:hover {
  background-color: var(--color-accent-confirm-hover, #519675);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.completion-actions .confirm-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.completion-actions .cancel-btn {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  cursor: pointer;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.completion-actions .cancel-btn:hover {
  background-color: var(--color-surface-muted, #f3eae3);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.completion-actions .cancel-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

/* Inline two-step confirmation state styles (all action confirmations) */
.action-buttons button.is-confirming {
  background-color: var(--color-accent-confirm, #5ea885) !important;
  color: #ffffff !important;
  border-color: var(--color-ink, #2d3748) !important;
}

.action-buttons button.is-confirming:hover {
  background-color: var(--color-accent-confirm-hover, #519675) !important;
}

.confirm-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-accent-confirm-dark, #2a5943);
  transform-origin: left center;
  animation: confirm-progress-shrink 4s linear forwards;
  pointer-events: none;
  z-index: 2;
}

@keyframes confirm-progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.existing-note-box {
  margin-top: 0.75rem;
  padding: 0.6rem 0.9rem;
  background: var(--color-surface-muted, #f3eae3);
  border: 1.5px dashed rgba(45, 55, 72, 0.3);
  border-radius: 12px;
  max-width: 320px;
}

.existing-note-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-ink-muted, #718096);
  display: block;
  margin-bottom: 0.2rem;
}

.existing-note-text {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--color-ink, #2d3748);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.footer {
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--color-ink, #2d3748);
}

.reset-btn {
  cursor: pointer;
  background: var(--color-surface, #ffffff);
  color: var(--color-ink-muted, #718096);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  padding: 0.65rem 1.5rem;
  font-weight: 700;
  box-shadow: var(--shadow-3d-sm, 0 2.5px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.reset-btn:hover {
  color: var(--color-accent, #ea7a87);
  border-color: var(--color-accent, #ea7a87);
  box-shadow: 0 3px 0 var(--color-accent, #ea7a87);
  transform: translateY(-1px);
}

.reset-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--color-accent, #ea7a87);
}
</style>
