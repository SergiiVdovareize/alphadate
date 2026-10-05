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
  emit('view-all');
};

// Combined history: includes history array plus any letters with status 'used' or 'excluded' not yet in history
const displayHistory = computed<LetterHistoryItem[]>(() => {
  const items = [...props.history];
  const historyLetters = new Set(items.map((i) => i.letter));

  if (props.letters) {
    for (const l of props.letters) {
      if ((l.status === 'used' || l.status === 'excluded') && !historyLetters.has(l.letter)) {
        items.push({
          letter: l.letter,
          status: l.status,
          note: l.note,
          photo: l.photo,
          partnerName: 'Партнер',
          selectedAt: null,
          completedAt: ''
        });
      }
    }
  }
  return items.reverse();
});

// Filter for a specific letter if selectedLetter is set (with fallback to letter object)
const letterHistoryItems = computed<LetterHistoryItem[]>(() => {
  if (!currentSelectedLetter.value) return [];
  const found = displayHistory.value.filter((h) => h.letter === currentSelectedLetter.value);
  if (found.length > 0) return found;

  const fallbackLetter = props.letters?.find((l) => l.letter === currentSelectedLetter.value);
  if (fallbackLetter && (fallbackLetter.status === 'used' || fallbackLetter.status === 'excluded')) {
    return [
      {
        letter: fallbackLetter.letter,
        status: fallbackLetter.status,
        note: fallbackLetter.note,
        photo: fallbackLetter.photo,
        partnerName: 'Партнер',
        selectedAt: null,
        completedAt: ''
      }
    ];
  }
  return [];
});

const getPartnerEmoji = (playerId?: number | null): string => {
  if (playerId === null || playerId === undefined) {
    return '👤';
  }
  return Math.abs(playerId) % 2 === 0 ? '👩' : '👨';
};

// Fullscreen photo state
const expandedPhoto = ref<{ src: string; alt: string } | null>(null);

const openPhoto = (photo: string, letter: string) => {
  expandedPhoto.value = {
    src: photo,
    alt: `Фото з побачення на літеру «${letter}»`
  };
};

const closePhoto = () => {
  expandedPhoto.value = null;
};

// Close modal on Escape
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (expandedPhoto.value) {
      closePhoto();
    } else if (props.isOpen) {
      emit('close');
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

// Prevent body scroll when modal is open
watch(
  () => props.isOpen,
  (val) => {
    if (typeof document !== 'undefined') {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  { immediate: true }
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
          <span v-else>📖 Спільні спогади</span>
        </h3>
        <button type="button" class="close-icon-btn" aria-label="Закрити" @click="emit('close')">
          ✕
        </button>
      </header>

      <!-- Single letter focused memory view -->
      <div class="single-letter-container">
        <div class="single-letter-content-scroll">
          <div v-if="letterHistoryItems.length === 0" class="empty-history">
            <div class="memory-letter-heading">
              <span class="memory-letter-char">{{ currentSelectedLetter }}</span>
            </div>
            <p class="empty-title">Спогадів для літери «{{ currentSelectedLetter }}» ще немає</p>
            <p class="empty-desc">
              Виконайте побачення на цю літеру, щоб зберегти деталі у спільні спогади!
            </p>
          </div>

          <div v-else class="single-letter-memories">
            <div v-for="(item, idx) in letterHistoryItems" :key="idx" class="single-memory-view">
              <div class="memory-letter-heading">
                <span class="memory-letter-char">{{ item.letter }}</span>
                <span v-if="item.status === 'excluded'" class="excluded-badge">
                  ✕ Літеру виключено з щоденнику
                </span>
              </div>

              <div class="memory-meta">
                <div v-if="item.partnerName" class="meta-row">
                  <span class="meta-label">Організатор:</span>
                  <span class="partner-pill">
                    <span class="partner-icon" aria-hidden="true">{{ getPartnerEmoji(item.playerId) }}</span>
                    <strong>{{ item.partnerName }}</strong>
                  </span>
                </div>

                <div v-if="item.status !== 'excluded'" class="meta-row">
                  <span class="meta-label">Час на виконання:</span>
                  <span class="duration-badge">
                    ⏱ {{ formatDurationBetween(item.selectedAt, item.completedAt) }}
                  </span>
                </div>

                <div v-if="item.completedAt" class="meta-row">
                  <span class="meta-label">
                    {{ item.status === 'excluded' ? 'Дата виключення:' : 'Дата завершення:' }}
                  </span>
                  <span class="date-text">
                    {{ formatCompletionDate(item.completedAt) }}
                  </span>
                </div>
              </div>

              <div v-if="item.status !== 'excluded'" class="memory-note-box">
                <span class="note-label">Враження від побачення:</span>
                <p v-if="item.note" class="note-content">«{{ item.note }}»</p>
                <p v-else class="empty-note">Коментар не було додано</p>
              </div>

              <button
                v-if="item.photo"
                type="button"
                class="memory-photo-box soft-album-frame"
                aria-label="Збільшити фото"
                title="Натисніть, щоб збільшити"
                @click="openPhoto(item.photo, item.letter)"
              >
                <img
                  :src="item.photo"
                  :alt="'Фото з побачення на літеру «' + item.letter + '»'"
                  class="memory-photo-img"
                  loading="lazy"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Link to open full dedicated memories page -->
        <div class="view-all-history-section">
          <button type="button" class="view-all-history-link" @click="handleViewAll">
            <span class="view-all-icon" aria-hidden="true">📖</span>
            <span class="view-all-text">Відкрити всі спільні спогади</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Photo Lightbox Modal inside letter modal -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div
          v-if="expandedPhoto"
          class="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Збільшене фото"
        >
          <button
            type="button"
            class="lightbox-backdrop"
            aria-label="Закрити зображення"
            tabindex="-1"
            @click="closePhoto"
          />
          <button
            type="button"
            class="lightbox-close-btn"
            aria-label="Закрити зображення"
            title="Закрити зображення"
            @click="closePhoto"
          >
            ✕
          </button>
          <div class="lightbox-image-wrap">
            <img
              :src="expandedPhoto.src"
              :alt="expandedPhoto.alt"
              class="lightbox-img"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
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
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.excluded-badge {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-error, #c53030);
  background: var(--color-error-bg, #fff5f5);
  border: 1px solid rgba(197, 48, 48, 0.2);
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
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
  box-sizing: border-box;
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

.memory-photo-box {
  margin: 1.25rem 0 0 0;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 12px 30px -4px rgba(45, 55, 72, 0.12);
  background: #f1f5f9;
  border: none;
  padding: 0;
  cursor: pointer;
  display: block;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.memory-photo-box:hover {
  transform: scale(1.015);
  box-shadow: 0 6px 20px rgba(45, 55, 72, 0.16);
}

.memory-photo-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  display: block;
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

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-ink-muted, #718096);
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

/* Lightbox Fullscreen */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  cursor: default;
  z-index: 1;
}

.lightbox-close-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #ffffff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  line-height: 1;
  backdrop-filter: blur(4px);
}

.lightbox-close-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: scale(1.08);
}

.lightbox-close-btn:active {
  transform: scale(0.95);
}

.lightbox-close-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.lightbox-image-wrap {
  position: relative;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  border-radius: 0;
  box-shadow: none;
  user-select: none;
  display: block;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
