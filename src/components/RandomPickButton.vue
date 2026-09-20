<script setup lang="ts">
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  pickRandom: () => LetterState | null;
}>();

const emit = defineEmits<{
  (e: 'pick', letter: LetterState): void;
}>();

const handleRandomPick = () => {
  const result = props.pickRandom();
  if (result) {
    emit('pick', result);
  } else {
    alert('Більше немає нових літер!');
  }
};
</script>

<template>
  <div class="selector-container">
    <button class="button primary large random-btn" @click="handleRandomPick">
      Випадкова літера
    </button>
  </div>
</template>

<style scoped>
.selector-container {
  margin: 1.25rem 0;
  display: flex;
  justify-content: center;
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

.random-btn:hover {
  background-color: var(--color-accent, #ea7a87);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.random-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}
</style>
