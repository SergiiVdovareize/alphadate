<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { LetterHistoryItem, LetterState } from '../types';
import { formatDurationBetween, formatCompletionDate } from '../utils/formatDuration';

const props = defineProps<{
  isOpen: boolean;
  history: LetterHistoryItem[];
  letters?: LetterState[];
  selectedLetter?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'view-all'): void;
}>();

const internalLetter = ref<string | null | undefined>(props.selectedLetter);

watch(
  () => props.selectedLetter,
  (val) => {
    internalLetter.value = val;
  }
);

const currentSelectedLetter = internalLetter;

const handleViewAll = () => {
  internalLetter.value = null;
  emit('view-all');
};

// Filter for a specific letter if selectedLetter is set (with fallback to letter object)
const letterHistoryItems = computed<LetterHistoryItem[]>(() => {
  if (!currentSelectedLetter.value) return [];
  const found = props.history.filter((h) => h.letter === currentSelectedLetter.value);
  if (found.length > 0) return found;

  // Fallback to letter object from letters array if history not yet synced
  const fallbackLetter = props.letters?.find((l) => l.letter === currentSelectedLetter.value);
  if (fallbackLetter && fallbackLetter.status === 'used') {
    return [
      {
        letter: fallbackLetter.letter,
        status: 'used',
        note: fallbackLetter.note,
        partnerName: 'Партнер',
        selectedAt: null,
        completedAt: ''
      }
    ];
  }
  return [];
});

// Close modal on Escape
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});

// Prevent body scroll when modal is open
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>

<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="history-modal-title"
  >
    <button
      type="button"
      class="backdrop-dismiss"
      aria-label="Закрити модальне вікно"
      tabindex="-1"
      @click="emit('close')"
    ></button>
    <div class="modal-card">
      <header class="modal-header">
        <h3 id="history-modal-title" class="modal-title">
          <span v-if="currentSelectedLetter">Спогад про літеру «{{ currentSelectedLetter }}»</span>
          <span v-else>📖 Щоденник побачень</span>
        </h3>
        <button type="button" class="close-icon-btn" aria-label="Закрити" @click="emit('close')">
          ✕
        </button>
      </header>

      <!-- Single letter focused memory view (ONLY this letter) -->
      <div v-if="currentSelectedLetter" class="single-letter-container">
        <div class="single-letter-content-scroll">
          <div v-if="letterHistoryItems.length === 0" class="empty-history">
            <div class="memory-letter-heading">
              <span class="memory-letter-char">{{ currentSelectedLetter }}</span>
            </div>
            <p class="empty-title">Спогадів для літери «{{ currentSelectedLetter }}» ще немає</p>
            <p class="empty-desc">
              Виконайте побачення на цю літеру, щоб зберегти деталі в щоденник!
            </p>
          </div>

          <div v-else class="single-letter-memories">
            <div v-for="(item, idx) in letterHistoryItems" :key="idx" class="single-memory-view">
              <div class="memory-letter-heading">
                <span class="memory-letter-char">{{ item.letter }}</span>
              </div>

              <div class="memory-meta">
                <div v-if="item.partnerName" class="meta-row">
                  <span class="meta-label">Організатор:</span>
                  <span class="partner-pill">
                    <span class="partner-icon" aria-hidden="true">👤</span>
                    <strong>{{ item.partnerName }}</strong>
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Час на виконання:</span>
                  <span class="duration-badge">
                    ⏱ {{ formatDurationBetween(item.selectedAt, item.completedAt) }}
                  </span>
                </div>

                <div v-if="item.completedAt" class="meta-row">
                  <span class="meta-label">Дата завершення:</span>
                  <span class="date-text">
                    {{ formatCompletionDate(item.completedAt) }}
                  </span>
                </div>
              </div>

              <div class="memory-note-box">
                <span class="note-label">Враження від побачення:</span>
                <p v-if="item.note" class="note-content">«{{ item.note }}»</p>
                <p v-else class="empty-note">Коментар не було додано</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Link to open full history (fixed footer outside scrollbar) -->
        <div class="view-all-history-section">
          <button type="button" class="view-all-history-link" @click="handleViewAll">
            <span class="view-all-icon" aria-hidden="true">📖</span>
            <span class="view-all-text">Відкрити щоденник побачень</span>
          </button>
        </div>
      </div>

      <!-- Multiple items history list view -->
      <div v-else class="history-list-view">
        <div v-if="history.length === 0" class="empty-history">
          <span class="empty-icon" aria-hidden="true">💌</span>
          <p class="empty-title">Поки що немає виконаних побачень</p>
          <p class="empty-desc">
            Оберіть літеру на дошці, проведіть незабутній час разом та відмітьте її виконаною!
          </p>
        </div>

        <div v-else class="history-scroll-list">
          <article
            v-for="item in history"
            :key="item.letter + item.completedAt"
            class="history-card-item"
          >
            <div class="item-header">
              <div class="item-letter-badge">
                {{ item.letter }}
              </div>
              <div class="item-main-info">
                <div class="item-top-line">
                  <span class="partner-pill">
                    <span class="partner-icon" aria-hidden="true">👤</span>
                    <strong>{{ item.partnerName || 'Партнер' }}</strong>
                  </span>
                  <span class="date-badge">
                    {{ formatCompletionDate(item.completedAt) }}
                  </span>
                </div>
                <div class="item-duration-line">
                  <span class="duration-badge">
                    ⏱ {{ formatDurationBetween(item.selectedAt, item.completedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="item-note">
              <p v-if="item.note" class="note-text">«{{ item.note }}»</p>
              <p v-else class="empty-note-small">Без коментаря</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(45, 55, 72, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: modal-fade 0.2s ease-out;
}

@keyframes modal-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.backdrop-dismiss {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: default;
  z-index: 1;
}

.modal-card {
  position: relative;
  z-index: 2;
  background: var(--color-surface, #ffffff);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 20px;
  box-shadow: var(--shadow-3d-lg, 0 6px 0 #2d3748);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-scale 0.2s ease-out;
}

@keyframes modal-scale {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1.5px solid var(--color-surface-muted, #f3eae3);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-ink, #2d3748);
}

.close-icon-btn {
  background: transparent;
  border: none;
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-ink-muted, #718096);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  line-height: 1;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.1s ease;
}

.close-icon-btn:hover {
  color: var(--color-ink, #2d3748);
  background-color: var(--color-surface-muted, #f3eae3);
}

.close-icon-btn:active {
  transform: scale(0.92);
}

.close-icon-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

/* Single Letter View */
.single-letter-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.single-letter-content-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.single-letter-memories {
  display: flex;
  flex-direction: column;
}

.single-memory-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.memory-letter-heading {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.25rem;
}

.memory-letter-char {
  font-size: 4rem;
  font-weight: 900;
  color: var(--color-accent, #d97732);
  line-height: 1;
  letter-spacing: -0.02em;
  user-select: none;
}

.memory-meta {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-bg, #fcf8f5);
  border-radius: 10px;
  font-size: 0.92rem;
}

.meta-label {
  color: var(--color-ink-muted, #718096);
  font-weight: 600;
}

.partner-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ffffff;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(45, 55, 72, 0.15);
  color: var(--color-ink, #2d3748);
}

.partner-icon {
  font-size: 0.95rem;
}

.duration-badge {
  font-weight: 700;
  color: var(--color-accent-confirm, #5ea885);
}

.date-text {
  font-weight: 600;
  color: var(--color-ink, #2d3748);
}

.memory-note-box {
  width: 100%;
  text-align: left;
  background: #ffffff;
  border: 1.5px solid #dfd5ca;
  border-radius: 12px;
  padding: 1rem;
}

.note-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-ink-muted, #718096);
  margin-bottom: 0.4rem;
  letter-spacing: 0.04em;
}

.note-content {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.5;
  color: var(--color-ink, #2d3748);
  font-style: italic;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-note {
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-ink-muted, #718096);
}

.view-all-history-section {
  flex-shrink: 0;
  background: var(--color-surface, #ffffff);
  display: flex;
  justify-content: center;
  padding: 0.75rem 1.5rem 1.25rem 1.5rem;
  border-top: 1.5px solid var(--color-surface-muted, #f3eae3);
  z-index: 2;
}

.view-all-history-link {
  background: transparent;
  border: none;
  color: var(--color-ink, #2d3748);
  font-size: 0.92rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  box-shadow: none;
  user-select: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.view-all-history-link .view-all-text {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition: text-decoration-color 0.15s ease;
}

.view-all-history-link:hover {
  color: var(--color-accent, #d97732);
  background-color: var(--color-surface-muted, #f3eae3);
}

.view-all-history-link:hover .view-all-text {
  text-decoration-color: var(--color-accent, #d97732);
}

.view-all-history-link:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.view-all-icon {
  font-size: 1.1rem;
  line-height: 1;
}

/* History List View */
.history-list-view {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-ink-muted, #718096);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 0.92rem;
  margin: 0;
  line-height: 1.45;
}

.history-scroll-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.history-card-item {
  background: var(--color-bg, #fcf8f5);
  border: 1.5px solid #dfd5ca;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: inset 0 1px 3px rgba(45, 55, 72, 0.04);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.item-letter-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--color-accent-rgb, 217, 119, 50), 0.12);
  color: var(--color-accent, #d97732);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 900;
  border: none;
  box-shadow: none;
  flex-shrink: 0;
  user-select: none;
}

.item-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.item-top-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.date-badge {
  font-size: 0.82rem;
  color: var(--color-ink-muted, #718096);
  font-weight: 600;
}

.item-duration-line {
  font-size: 0.88rem;
}

.item-note {
  border-top: 1px dashed rgba(45, 55, 72, 0.12);
  padding-top: 0.5rem;
}

.note-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--color-ink, #2d3748);
  font-style: italic;
}

.empty-note-small {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-ink-muted, #718096);
}
</style>
