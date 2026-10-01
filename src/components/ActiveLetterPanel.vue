<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useActiveLetterPanel } from '../composables/useActiveLetterPanel';
import DateSuggestions from './DateSuggestions.vue';
import RandomPickButton from './RandomPickButton.vue';
import { LETTER_POP_ENTRANCE_DELAY_MS, RIM_ANIMATION_DURATION_MS } from '../constants';
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  letter: LetterState | null;
  selectedAt?: string | null;
  boardId: string;
  pickRandom: () => LetterState | null;
  isPicking?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'complete', note: string): void;
  (e: 'exclude'): void;
  (e: 'cancel'): void;
  (e: 'pick', letter: LetterState): void;
}>();

const {
  countdownInfo,
  isCompleting,
  completionNote,
  confirmingAction,
  startCompleting,
  cancelCompleting,
  submitComplete,
  handleConfirmableAction,
  cancelConfirmation
} = useActiveLetterPanel(props, emit);

const showTimer = ref(false);
let timerTimeout: ReturnType<typeof setTimeout> | null = null;
const showRimAnimation = ref(false);
let rimTimeout: ReturnType<typeof setTimeout> | null = null;
let isInitial = true;

const checkTimerVisibility = (newLetter: string | undefined) => {
  if (timerTimeout) {
    clearTimeout(timerTimeout);
    timerTimeout = null;
  }

  if (!newLetter) {
    showTimer.value = false;
    return;
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    showTimer.value = true;
    return;
  }

  showTimer.value = false;
  timerTimeout = setTimeout(() => {
    showTimer.value = true;
  }, LETTER_POP_ENTRANCE_DELAY_MS);
};

const triggerRimAnimation = () => {
  if (rimTimeout) {
    clearTimeout(rimTimeout);
    rimTimeout = null;
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    showRimAnimation.value = false;
    return;
  }

  showRimAnimation.value = true;
  rimTimeout = setTimeout(() => {
    showRimAnimation.value = false;
  }, RIM_ANIMATION_DURATION_MS);
};

watch(
  () => props.letter?.letter,
  (newVal, oldVal) => {
    checkTimerVisibility(newVal);

    if (isInitial) {
      isInitial = false;
      return;
    }

    if (newVal && newVal !== oldVal) {
      triggerRimAnimation();
    } else if (!newVal) {
      showRimAnimation.value = false;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (timerTimeout) {
    clearTimeout(timerTimeout);
    timerTimeout = null;
  }
  if (rimTimeout) {
    clearTimeout(rimTimeout);
    rimTimeout = null;
  }
});
</script>

<template>
  <div class="active-letter-panel" :class="{ 'has-active-letter': !!letter }">
    <div v-if="letter && showRimAnimation" class="panel-rim-beam" aria-hidden="true">
      <div class="rim-beam-spinner"></div>
    </div>

    <div v-if="letter" class="panel-content">
      <div class="letter-display-wrap">
        <h2 class="active-letter-char">{{ letter.letter }}</h2>
        <div
          v-if="countdownInfo"
          class="countdown-badge"
          :class="{
            'is-urgent': countdownInfo.urgent,
            'is-expired': countdownInfo.expired,
            'is-visible': showTimer
          }"
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
        ></textarea>
        <div class="completion-actions">
          <button class="button success confirm-btn" @click="submitComplete">
            Підтвердити виконання
          </button>
          <button class="button outline cancel-btn" @click="cancelCompleting">Назад</button>
        </div>
      </div>

      <!-- Confirmation state for cancel / exclude (expanded full-width with cancel button) -->
      <div v-else-if="confirmingAction" class="confirmation-actions">
        <button
          class="button is-confirming confirm-expanded-btn"
          @click="handleConfirmableAction(confirmingAction)"
        >
          <span>
            {{ confirmingAction === 'cancel' ? 'Так, обрати іншу' : 'Так, виключити літеру' }}
          </span>
          <span class="confirm-progress-bar"></span>
        </button>
        <button class="button outline cancel-confirm-btn" @click="cancelConfirmation">
          <span>Скасувати</span>
        </button>
      </div>

      <!-- Normal action buttons -->
      <div v-else class="action-buttons">
        <button
          class="button text close-panel-btn"
          @click="handleConfirmableAction('cancel')"
        >
          <span>Обрати іншу</span>
        </button>
        <button
          class="button danger"
          @click="handleConfirmableAction('exclude')"
        >
          <span>Виключити</span>
        </button>
        <button
          v-if="letter.status !== 'used'"
          class="button success complete-main-btn"
          @click="startCompleting"
        >
          Виконано
        </button>
      </div>

      <!-- Date Suggestions section -->
      <DateSuggestions :board-id="boardId" :letter="letter.letter" />
    </div>

    <div v-else class="panel-placeholder">
      <p>Оберіть літеру вручну на дошці або натисніть кнопку випадкового вибору.</p>
      <RandomPickButton
        :pick-random="pickRandom"
        :is-picking="isPicking"
        :disabled="disabled"
        @pick="(item) => emit('pick', item)"
      />
    </div>
  </div>
</template>

<style scoped>
.active-letter-panel {
  position: relative;
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 22px;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  box-shadow: inset 0 2px 6px rgba(45, 55, 72, 0.06);
  text-align: center;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.active-letter-panel.has-active-letter {
  border-color: rgba(234, 122, 135, 0.25);
  box-shadow:
    inset 0 2px 6px rgba(45, 55, 72, 0.04),
    0 10px 28px -10px rgba(234, 122, 135, 0.18);
}

.panel-rim-beam {
  position: absolute;
  inset: -1.5px;
  border-radius: 22px;
  padding: 2.5px;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rim-beam-fade 800ms ease-out forwards;
}

@keyframes rim-beam-fade {
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.rim-beam-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 260%;
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%) rotate(0deg);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 65deg,
    rgba(234, 122, 135, 0.2) 80deg,
    var(--color-accent, #ea7a87) 95deg,
    #f4a261 105deg,
    rgba(244, 162, 97, 0.3) 115deg,
    transparent 130deg,
    transparent 360deg
  );
  animation: rim-spin 800ms linear forwards;
  transform-origin: center center;
}

@keyframes rim-spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.panel-placeholder {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  animation: panel-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes panel-reveal {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.letter-display-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

@keyframes letter-pop-in {
  0% {
    transform: scale(0.65);
    opacity: 0;
  }
  70% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.active-letter-char {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: var(--color-accent, #ea7a87);
  display: inline-block;
  animation:
    letter-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    pulse-char-color 3.6s ease-in-out 0.45s infinite;
}

@keyframes pulse-char-color {
  0%,
  100% {
    color: var(--color-accent);
  }
  50% {
    color: var(--color-accent-dark);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel-content,
  .letter-display-wrap,
  .active-letter-char,
  .countdown-badge,
  .panel-rim-beam,
  .rim-beam-spinner {
    animation: none;
    transition: none;
  }
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
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
}

.countdown-badge.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.countdown-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: var(--color-accent, #ea7a87);
}

.countdown-badge.is-urgent {
  background: rgba(var(--color-accent-rgb, 138, 99, 229), 0.12);
  border-color: rgba(var(--color-accent-rgb, 138, 99, 229), 0.4);
  color: var(--color-accent);
}

.countdown-badge.is-expired {
  background: rgba(var(--color-accent-rgb, 138, 99, 229), 0.18);
  border-color: var(--color-accent);
  color: var(--color-accent);
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
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb, 138, 99, 229), 0.2);
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

/* Confirmation stage styles (Option 3: full width + cancel button) */
.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  animation: confirm-fade-in 0.15s ease-out;
}

@keyframes confirm-fade-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm-expanded-btn {
  position: relative;
  overflow: hidden;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  background-color: var(--color-accent-confirm, #5ea885);
  color: #ffffff;
  width: 100%;
  box-sizing: border-box;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.confirm-expanded-btn:hover {
  background-color: var(--color-accent-confirm-hover, #519675);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.confirm-expanded-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.confirm-expanded-btn span:not(.confirm-progress-bar) {
  position: relative;
  z-index: 1;
}

.cancel-confirm-btn {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  width: 100%;
  box-sizing: border-box;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.cancel-confirm-btn:hover {
  background-color: var(--color-surface-muted, #f3eae3);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.cancel-confirm-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.confirm-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.55);
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

@media (prefers-reduced-motion: reduce) {
  .confirmation-actions {
    animation: none;
  }
  .confirm-progress-bar {
    animation: none;
  }
}
</style>
