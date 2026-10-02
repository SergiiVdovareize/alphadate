<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  pickRandom: () => LetterState | null;
  isPicking?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'pick', letter: LetterState): void;
}>();

const isEmptyNotice = ref(false);
let noticeTimeout: ReturnType<typeof setTimeout> | null = null;

onUnmounted(() => {
  if (noticeTimeout) {
    clearTimeout(noticeTimeout);
    noticeTimeout = null;
  }
});

const handleRandomPick = () => {
  if (props.isPicking || props.disabled) return;
  const result = props.pickRandom();
  if (result) {
    isEmptyNotice.value = false;
    emit('pick', result);
  } else {
    isEmptyNotice.value = true;
    if (noticeTimeout) clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => {
      isEmptyNotice.value = false;
    }, 3000);
  }
};
</script>

<template>
  <div class="selector-container">
    <button
      class="button primary large random-btn"
      :class="{ 'is-picking': isPicking }"
      :disabled="isPicking || disabled"
      @click="handleRandomPick"
    >
      <span v-if="isPicking" class="picking-label">
        <span class="dice-icon" aria-hidden="true">🎲</span>
        Обираємо...
      </span>
      <span v-else>Випадкова літера</span>
    </button>
    <p v-if="isEmptyNotice" class="empty-notice" role="alert">
      Усі літери вже використано або виключено!
    </p>
  </div>
</template>

<style scoped>
.selector-container {
  margin: 1.25rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.random-btn {
  font-size: 1rem;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.random-btn:hover:not(:disabled) {
  background-color: var(--color-accent, #d97732);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.random-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.random-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.empty-notice {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent, #d97732);
}

.random-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748) !important;
}

.picking-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.dice-icon {
  display: inline-block;
  animation: dice-wobble 0.6s ease-in-out infinite;
}

@keyframes dice-wobble {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-18deg) scale(1.15);
  }
  75% {
    transform: rotate(18deg) scale(1.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dice-icon {
    animation: none;
  }
}
</style>
