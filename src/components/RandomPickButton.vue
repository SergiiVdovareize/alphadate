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
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.random-btn {
  font-size: 1rem;
  padding: 0.6rem 1.25rem;
  background-color: #647eff;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(100, 126, 255, 0.3);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  border: none;
}

.random-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(100, 126, 255, 0.4);
}

.random-btn:active {
  transform: translateY(0);
}
</style>
