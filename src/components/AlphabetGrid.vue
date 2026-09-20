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
      :disabled="disabled && item.letter !== activeLetter"
      :title="
        disabled && item.letter !== activeLetter
          ? 'Завершіть або скасуйте поточну літеру'
          : `Статус: ${STATUS_UI_STRINGS[item.status]}`
      "
      @click="handleClick(item)"
    >
      <span v-if="item.status === 'used'" class="check-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="icon-svg"
        >
          <path
            fill-rule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
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

.letter-btn:hover:not(:disabled):not(.active) {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 var(--color-ink, #2d3748);
}

.letter-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.letter-btn.active {
  border-color: var(--color-accent, #ea7a87) !important;
  color: var(--color-accent, #ea7a87);
  box-shadow: 0 4px 0 var(--color-accent, #ea7a87) !important;
  transform: translateY(-2px);
  z-index: 2;
  cursor: default;
}

.letter-btn:disabled {
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
.status-available {
  background-color: var(--color-surface, #ffffff);
}

.status-used {
  background-color: var(--color-surface-muted, #f3eae3);
}

.status-excluded {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink-muted, #718096);
  border-color: var(--color-ink-muted, #718096);
  box-shadow: 0 2px 0 var(--color-ink-muted, #718096);
}

.status-skipped {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink-muted, #718096);
}

.check-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: var(--color-accent, #ea7a87);
  color: #ffffff;
  border-radius: 6px;
  border: 1.5px solid var(--color-ink, #2d3748);
  padding: 2px;
}

.icon-svg {
  width: 100%;
  height: 100%;
}
</style>
