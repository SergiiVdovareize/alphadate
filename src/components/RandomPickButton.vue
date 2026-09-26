<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type { LetterState } from '../composables/useAlphabetState';

const props = defineProps<{
  pickRandom: () => LetterState | null;
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
    <button class="button primary large random-btn" @click="handleRandomPick">
      Випадкова літера
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

.empty-notice {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent, #ea7a87);
}
</style>
