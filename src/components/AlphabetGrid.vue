<script setup lang="ts">
import { STATUS_UI_STRINGS } from '../composables/useAlphabetState';
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  letters: LetterState[];
  activeLetter?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', letter: LetterState): void;
}>();

const handleClick = (item: LetterState) => {
  if (props.disabled) return;
  if (item.status === 'used' || item.status === 'excluded') return;
  emit('select', item);
};
</script>

<template>
  <div class="alphabet-grid">
    <button
      v-for="item in letters"
      :key="item.letter"
      class="letter-btn"
      :class="[`status-${item.status}`, { active: item.letter === activeLetter }]"
      :disabled="disabled && item.letter !== activeLetter && item.status !== 'used'"
      :title="
        item.status === 'used'
          ? 'Літеру вже виконано'
          : disabled && item.letter !== activeLetter
            ? 'Завершіть або скасуйте поточну літеру'
            : `Статус: ${STATUS_UI_STRINGS[item.status]}`
      "
      @click="handleClick(item)"
    >
      {{ item.letter }}
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

.letter-btn:hover:not(:disabled):not(.active):not(.status-used) {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 var(--color-ink, #2d3748);
}

.letter-btn:active:not(:disabled):not(.status-used) {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.letter-btn.active {
  border-color: var(--color-accent, #ea7a87) !important;
  color: var(--color-accent, #ea7a87) !important;
  background-color: var(--color-surface-muted, #f3eae3);
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748) !important;
  z-index: 2;
  cursor: default;
}

.letter-btn.active:hover {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748) !important;
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
  color: var(--color-ink-muted, #718096);
  border-color: rgba(45, 55, 72, 0.35);
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
  cursor: default;
  opacity: 0.65;
}

.status-used:hover {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.status-excluded {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink-muted, #718096);
  border-color: var(--color-ink-muted, #718096);
  box-shadow: 0 2px 0 var(--color-ink-muted, #718096);
}
</style>
