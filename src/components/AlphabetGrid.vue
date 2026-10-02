<script setup lang="ts">
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  letters: LetterState[];
  activeLetter?: string;
  highlightedLetter?: string | null;
  isWinner?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', letter: LetterState): void;
  (e: 'view-history', letter: LetterState): void;
}>();

const handleClick = (item: LetterState) => {
  if (item.status === 'used') {
    emit('view-history', item);
    return;
  }
  if (props.disabled) return;
  if (item.status === 'excluded') return;
  emit('select', item);
};
</script>

<template>
  <div class="alphabet-grid">
    <button
      v-for="item in letters"
      :key="item.letter"
      class="letter-btn"
      :class="[
        `status-${item.status}`,
        {
          active: item.letter === activeLetter,
          'is-highlighted': item.letter === highlightedLetter && !isWinner,
          'is-winner': isWinner && item.letter === highlightedLetter
        }
      ]"
      :disabled="
        disabled &&
        item.letter !== activeLetter &&
        item.status !== 'used' &&
        item.letter !== highlightedLetter
      "
      @click="handleClick(item)"
    >
      <span>{{ item.letter }}</span>
      <span v-if="item.status === 'used'" class="used-check-badge" aria-hidden="true">✓</span>
    </button>
  </div>
</template>

<style scoped>
.alphabet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(62px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
}

.letter-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  font-size: 1.5rem;
  font-weight: 800;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  cursor: pointer;
  padding: 0.5rem;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
  box-shadow: var(--shadow-3d-sm, 0 3px 0 #2d3748);
}

.letter-btn:hover:not(:disabled):not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 var(--color-ink, #2d3748);
}

.letter-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.letter-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.letter-btn.active {
  background-color: var(--color-accent) !important;
  color: #ffffff !important;
  border-color: var(--color-ink, #2d3748) !important;
  transform: none;
  z-index: 5;
  cursor: default;
}

.letter-btn.active:hover {
  transform: none;
}

.letter-btn.is-highlighted {
  background-color: var(--color-accent) !important;
  color: #ffffff !important;
  border-color: var(--color-ink, #2d3748) !important;
  transform: translateY(-4px) scale(1.14);
  box-shadow: 0 7px 0 var(--color-ink, #2d3748) !important;
  z-index: 10;
  transition:
    transform 0.05s ease,
    background-color 0.05s ease;
  animation: roulette-pop 0.15s ease-out;
}

@keyframes roulette-pop {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: translateY(-5px) scale(1.18);
  }
  100% {
    transform: translateY(-4px) scale(1.14);
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-btn.is-highlighted {
    animation: none;
    transform: none;
  }
}

.letter-btn.is-winner {
  background-color: var(--color-accent) !important;
  color: #ffffff !important;
  border-color: var(--color-ink, #2d3748) !important;
  z-index: 15;
  animation: winner-celebrate 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
}

@keyframes winner-celebrate {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 0 var(--color-ink, #2d3748);
  }
  35% {
    transform: translateY(-8px) scale(1.24);
    box-shadow:
      0 12px 0 var(--color-ink, #2d3748),
      0 0 0 4px rgba(var(--color-accent-rgb), 0.5),
      0 0 20px rgba(var(--color-accent-rgb), 0.4);
  }
  65% {
    transform: translateY(-2px) scale(1.08);
    box-shadow:
      0 6px 0 var(--color-ink, #2d3748),
      0 0 0 2px rgba(var(--color-accent-rgb), 0.3);
  }
  100% {
    transform: translateY(0) scale(1);
    box-shadow: var(--shadow-3d-sm, 0 3px 0 #2d3748);
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-btn.is-winner {
    animation: none;
    transform: none;
  }
}

.letter-btn:disabled:not(.status-used) {
  cursor: not-allowed;
  opacity: 0.3;
  box-shadow: 0 1.5px 0 var(--color-ink, #2d3748);
  transform: none;
}

/* Mobile tap target improvement */
@media (max-width: 600px) {
  .alphabet-grid {
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 0.5rem;
  }
  .letter-btn {
    font-size: 1.25rem;
    border-radius: 10px;
  }
}

/* Status variants */
.status-available,
.status-skipped {
  background-color: var(--color-surface, #ffffff);
}

.status-used {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d-sm, 0 3px 0 #2d3748);
  cursor: pointer;
  opacity: 1;
}

.status-used:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 var(--color-ink, #2d3748);
  border-color: var(--color-accent-confirm, #5ea885);
}

.status-used:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.used-check-badge {
  position: absolute;
  top: 3px;
  right: 5px;
  font-size: 0.7rem;
  font-weight: 900;
  color: var(--color-accent-confirm, #5ea885);
  line-height: 1;
}

.status-excluded {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink-muted, #718096);
  border-color: var(--color-ink-muted, #718096);
  box-shadow: 0 2px 0 var(--color-ink-muted, #718096);
}
</style>
