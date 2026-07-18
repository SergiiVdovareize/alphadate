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
      :title="`Статус: ${STATUS_UI_STRINGS[item.status]}`"
      @click="emit('select', item)"
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
  grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 600px;
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
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--bg);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  opacity: 1;
  background-color: var(--bg-muted);
  border-color: #42d392;
  color: var(--fg);
}

.status-excluded {
  opacity: 0.6;
  border-color: #94a3b8;
  color: #94a3b8;
  background-color: rgba(148, 163, 184, 0.05);
}

.status-skipped {
  opacity: 0.6;
  border-color: #f97316;
  color: #f97316;
  background-color: rgba(249, 115, 22, 0.05);
}

.check-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #42d392;
  color: white;
  border-radius: 4px;
  padding: 2px;
}

.icon-svg {
  width: 100%;
  height: 100%;
}
</style>
