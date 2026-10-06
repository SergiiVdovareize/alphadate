<script setup lang="ts">
import { formatDurationBetween, formatCompletionDate } from '../utils/formatDuration';
import PinModal from '../components/PinModal.vue';
import RomanticLoader from '../components/RomanticLoader.vue';
import InlineMemoryEditor from '../components/InlineMemoryEditor.vue';
import PhotoLightboxModal from '../components/PhotoLightboxModal.vue';
import { useMemoriesPage } from '../composables/useMemoriesPage';

const {
  isPinRequired,
  pinError,
  isLoadingBackend,
  currentSelectedLetter,
  displayHistory,
  letterHistoryItems,
  expandedPhoto,
  editingLetter,
  isSavingEdit,
  editError,
  goBackToBoard,
  handleViewAll,
  handleCancelPin,
  handleUnlockPin,
  openPhoto,
  closePhoto,
  startEditing,
  cancelEditing,
  handleSaveInline,
  resolvePlayerId,
  getPartnerEmoji
} = useMemoriesPage();

const vSyncBadge = {
  mounted(el: HTMLElement) {
    const update = () => {
      const info = el.querySelector<HTMLElement>('.item-main-info');
      const badge = el.querySelector<HTMLElement>('.item-letter-badge');
      if (info && badge) {
        const h = info.offsetHeight;
        if (h > 0) {
          badge.style.width = `${h}px`;
          badge.style.height = `${h}px`;
        }
      }
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      const info = el.querySelector('.item-main-info');
      if (info) ro.observe(info);
      (el as HTMLElement & { _ro?: ResizeObserver })._ro = ro;
    }
  },
  unmounted(el: HTMLElement) {
    const ro = (el as HTMLElement & { _ro?: ResizeObserver })._ro;
    if (ro) ro.disconnect();
  }
};
</script>

<template>
  <main class="container page-wrapper">
    <!-- Top back navigation (styled like Recover.vue) -->
    <div class="top-nav">
      <button
        type="button"
        class="back-link-btn"
        aria-label="Повернутися до щоденника"
        @click="goBackToBoard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="back-arrow"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        До щоденника
      </button>
    </div>

    <!-- Header title -->
    <header class="page-header">
      <h1 class="page-title">
        <span v-if="currentSelectedLetter">Спогад про літеру «{{ currentSelectedLetter }}»</span>
        <span v-else>📖 Спільні спогади</span>
      </h1>
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
            Виконайте побачення на цю літеру, щоб зберегти деталі у спільні спогади!
          </p>
        </div>

        <div v-else class="single-letter-memories">
          <div v-for="(item, idx) in letterHistoryItems" :key="idx" class="single-memory-view">
            <div class="memory-letter-heading">
              <span class="memory-letter-char">{{ item.letter }}</span>
              <span v-if="item.status === 'excluded'" class="excluded-badge">✕ Літеру виключено з щоденнику</span>
            </div>

            <div class="memory-meta">
              <div v-if="item.partnerName" class="meta-row">
                <span class="meta-label">Організатор:</span>
                <span class="partner-pill">
                  <span class="partner-icon" aria-hidden="true">{{ getPartnerEmoji(resolvePlayerId(item)) }}</span>
                  <strong>{{ item.partnerName }}</strong>
                </span>
              </div>

              <div v-if="item.status !== 'excluded'" class="meta-row">
                <span class="meta-label">Час на виконання:</span>
                <span class="duration-badge">
                  ⏱ {{ formatDurationBetween(item.selectedAt, item.completedAt) }}
                </span>
              </div>

              <div v-if="item.completedAt" class="meta-row meta-date-row">
                <span class="meta-label">
                  {{ item.status === 'excluded' ? 'Дата виключення:' : 'Дата завершення:' }}
                </span>
                <span class="date-text">
                  {{ formatCompletionDate(item.completedAt) }}
                </span>
              </div>
            </div>

            <!-- Inline editor in this card OR static note & photo -->
            <div v-if="item.status !== 'excluded'" class="single-letter-note-wrap">
              <div v-if="editingLetter === item.letter" class="item-note single-letter-item-note">
                <InlineMemoryEditor
                  :letter="item.letter"
                  :initial-note="item.note"
                  :initial-photo="item.photo"
                  :is-loading="isSavingEdit"
                  :error="editError"
                  @save="handleSaveInline"
                  @cancel="cancelEditing"
                />
              </div>
              <div v-else class="memory-note-box">
                <div class="note-display-row">
                  <div class="note-content-col">
                    <p v-if="item.note" class="note-content">«{{ item.note }}»</p>
                    <p v-else class="empty-note">Без коментаря</p>
                  </div>
                  <button
                    v-if="item.status === 'used'"
                    type="button"
                    class="edit-note-btn edit-memory-under-date-btn"
                    title="Редагувати спогад"
                    :aria-label="'Редагувати спогад на літеру «' + item.letter + '»'"
                    @click="startEditing(item)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="edit-icon-svg"
                      aria-hidden="true"
                    >
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button
              v-if="editingLetter !== item.letter && item.photo"
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

      <!-- Link to open full history -->
      <div class="view-all-history-section">
        <button type="button" class="view-all-history-link" @click="handleViewAll">
          <span class="view-all-icon" aria-hidden="true">📖</span>
          <span class="view-all-text">Відкрити спільні спогади</span>
        </button>
      </div>
    </div>

    <!-- Multiple items history list view -->
    <div v-else class="history-list-view">
      <div v-if="displayHistory.length === 0" class="empty-history">
        <span class="empty-icon" aria-hidden="true">💌</span>
        <p class="empty-title">Поки що немає спільних спогадів</p>
        <p class="empty-desc">
          Оберіть літеру в щоденнику, проведіть незабутній час разом та збережіть перші враження!
        </p>
      </div>

      <div v-else class="history-scroll-list">
        <article
          v-for="item in displayHistory"
          :key="item.letter + item.completedAt + item.status"
          class="history-card-item"
          :class="{ 'is-excluded-item': item.status === 'excluded' }"
        >
          <div v-sync-badge class="item-header">
            <div class="item-letter-badge" :class="{ 'is-excluded': item.status === 'excluded' }">
              <span>{{ item.letter }}</span>
              <span v-if="item.status === 'excluded'" class="badge-sub-cross" aria-hidden="true">✕</span>
            </div>
            <div class="item-main-info">
              <div class="item-top-line">
                <span class="partner-pill">
                  <span class="partner-icon" aria-hidden="true">{{ getPartnerEmoji(resolvePlayerId(item)) }}</span>
                  <strong>{{ item.partnerName || 'Партнер' }}</strong>
                </span>
                <span v-if="item.completedAt" class="date-badge">
                  {{ formatCompletionDate(item.completedAt) }}
                </span>
              </div>
              <div class="item-duration-line">
                <span v-if="item.status === 'excluded'" class="excluded-pill">
                  ✕ Літеру виключено з щоденнику
                </span>
                <span v-else class="duration-badge">
                  ⏱ {{ formatDurationBetween(item.selectedAt, item.completedAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Inline editor in item-note OR static note & photo -->
          <div v-if="item.status !== 'excluded'" class="item-note">
            <InlineMemoryEditor
              v-if="editingLetter === item.letter"
              :letter="item.letter"
              :initial-note="item.note"
              :initial-photo="item.photo"
              :is-loading="isSavingEdit"
              :error="editError"
              @save="handleSaveInline"
              @cancel="cancelEditing"
            />
            <div v-else class="note-display-row">
              <div class="note-content-col">
                <p v-if="item.note" class="note-text">«{{ item.note }}»</p>
                <p v-else class="empty-note-small">Без коментаря</p>
              </div>
              <button
                v-if="item.status === 'used'"
                type="button"
                class="edit-note-btn edit-memory-under-date-btn"
                title="Редагувати спогад"
                :aria-label="'Редагувати спогад на літеру «' + item.letter + '»'"
                @click="startEditing(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="edit-icon-svg"
                  aria-hidden="true"
                >
                  <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                </svg>
              </button>
            </div>
          </div>

          <button
            v-if="editingLetter !== item.letter && item.photo"
            type="button"
            class="item-photo-box soft-album-mini"
            aria-label="Збільшити фото"
            title="Натисніть, щоб збільшити"
            @click="openPhoto(item.photo, item.letter)"
          >
            <img
              :src="item.photo"
              :alt="'Фото з побачення на літеру «' + item.letter + '»'"
              class="item-photo-img"
              loading="lazy"
            />
          </button>
        </article>
      </div>
    </div>

    <!-- PIN Unlock Modal if board is password-protected -->
    <PinModal
      :is-open="isPinRequired"
      :error="pinError"
      :is-loading="isLoadingBackend"
      @unlock="handleUnlockPin"
      @cancel="handleCancelPin"
    />

    <!-- Romantic Loader while loading backend data -->
    <RomanticLoader
      :visible="isLoadingBackend"
      message="Завантажуємо спільні спогади... 💕"
      submessage="Відкриваємо вашу романтичну історію..."
    />

    <!-- Fullscreen Photo Lightbox Modal -->
    <PhotoLightboxModal :photo="expandedPhoto" @close="closePhoto" />
  </main>
</template>

<style scoped>
.page-wrapper {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem 1rem;
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.back-link-btn {
  background: none;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-ink-muted, #718096);
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
  font-family: inherit;
}

.back-link-btn:hover {
  color: var(--color-ink, #2d3748);
  background: rgba(45, 55, 72, 0.05);
}

.back-link-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.back-arrow {
  width: 1rem;
  height: 1rem;
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-ink, #2d3748);
  letter-spacing: -0.02em;
}

/* Single Letter View */
.single-letter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.single-letter-content-scroll {
  display: flex;
  flex-direction: column;
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
  background: var(--color-bg, #fcf8f5);
  border: 1.5px solid #dfd5ca;
  border-radius: 14px;
  box-shadow: inset 0 1px 3px rgba(45, 55, 72, 0.04);
}

.memory-letter-heading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.edit-note-btn,
.edit-memory-under-date-btn {
  background: transparent;
  border: none;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink-muted, #718096);
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  line-height: 1;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.1s ease;
}

.edit-note-btn:hover,
.edit-memory-under-date-btn:hover {
  color: var(--color-accent, #d97732);
  background-color: rgba(217, 119, 50, 0.08);
}

.edit-note-btn:active,
.edit-memory-under-date-btn:active {
  transform: scale(0.92);
}

.edit-note-btn:focus-visible,
.edit-memory-under-date-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.single-letter-note-wrap {
  width: 100%;
}

.single-letter-item-note {
  border-top: 1px dashed rgba(45, 55, 72, 0.12);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  width: 100%;
}

.edit-icon-svg {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
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
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #dfd5ca;
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
  display: flex;
  justify-content: center;
  padding-top: 1rem;
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
  width: 100%;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--color-ink-muted, #718096);
  background: var(--color-bg, #fcf8f5);
  border: 1.5px solid #dfd5ca;
  border-radius: 14px;
  box-shadow: inset 0 1px 3px rgba(45, 55, 72, 0.04);
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
  width: 52px;
  height: 52px;
  aspect-ratio: 1 / 1;
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
  position: relative;
  box-sizing: border-box;
}

.item-letter-badge.is-excluded {
  background: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
}

.badge-sub-cross {
  position: absolute;
  top: 4px;
  right: 5px;
  font-size: 0.65rem;
  font-weight: 900;
  color: var(--color-error, #c53030);
  line-height: 1;
}

.excluded-pill {
  display: inline-flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--color-error, #c53030);
  background: var(--color-error-bg, #fff5f5);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  line-height: 1.2;
}

.item-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.35rem;
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

.note-display-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
}

.note-content-col {
  flex: 1;
  min-width: 0;
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

/* Photo styling */
.memory-photo-box {
  margin: 1.25rem 0 0 0;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.04),
    0 12px 30px -4px rgba(45, 55, 72, 0.12);
  background: #f1f5f9;
  box-sizing: border-box;
}

.memory-photo-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  display: block;
}

.item-photo-box {
  margin-top: 0.75rem;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 6px 18px -2px rgba(45, 55, 72, 0.1);
  background: #f1f5f9;
  box-sizing: border-box;
}

.memory-photo-box,
.item-photo-box {
  cursor: pointer;
  position: relative;
  border: none;
  padding: 0;
  background: transparent;
  display: block;
  width: 100%;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.memory-photo-box:hover,
.item-photo-box:hover {
  transform: scale(1.015);
  box-shadow: 0 6px 20px rgba(45, 55, 72, 0.16);
}

.item-photo-img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  display: block;
}
</style>
