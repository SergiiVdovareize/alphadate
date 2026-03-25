<script setup lang="ts">
import { STATUS_UI_STRINGS } from '../composables/useAlphabetState';
import type { LetterState } from '../composables/useAlphabetState';

defineProps<{
  letters: LetterState[];
}>();

const emit = defineEmits<{
  (e: 'select', letter: LetterState): void;
}>();


</script>

<template>
  <div class="alphabet-grid">
    <button
      v-for="item in letters"
      :key="item.letter"
      class="letter-btn"
      :class="`status-${item.status}`"
      @click="emit('select', item)"
      :title="`Статус: ${STATUS_UI_STRINGS[item.status]}`"
    >
      {{ item.letter }}
      <small class="status-indicator">{{ STATUS_UI_STRINGS[item.status] }}</small>
    </button>
  </div>
</template>

<style scoped>
.alphabet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.letter-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--bg);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Mobile tap target improvement */
@media (max-width: 600px) {
  .alphabet-grid {
    grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
    gap: 0.5rem;
  }
  .letter-btn {
    font-size: 1.25rem;
  }
}

.letter-btn:active {
  transform: scale(0.95);
}

.status-indicator {
  font-size: 0.5rem;
  text-transform: uppercase;
  font-weight: normal;
  margin-top: 4px;
  opacity: 0.8;
}

/* Status variants */
.status-available {
  border-color: #42d392;
  color: var(--fg);
}
.status-available:hover {
  background-color: rgba(66, 211, 146, 0.1);
  border-color: #33a06f;
}

.status-used {
  opacity: 0.4;
  background-color: var(--bg-muted);
  text-decoration: line-through;
}

.status-excluded {
  opacity: 0.6;
  border-color: #ff5c5c;
  color: #ff5c5c;
  background-color: rgba(255, 92, 92, 0.05);
}

.status-skipped {
  opacity: 0.6;
  border-color: #eab308;
  color: #eab308;
  background-color: rgba(234, 179, 8, 0.05);
}
</style>
