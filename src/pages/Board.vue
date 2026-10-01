<script setup lang="ts">
import { useBoardPage } from '../composables/useBoardPage';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import DateHistoryModal from '../components/DateHistoryModal.vue';
import AppLogo from '../components/AppLogo.vue';
import ActiveLetterPanel from '../components/ActiveLetterPanel.vue';
import PinModal from '../components/PinModal.vue';
import SetPinModal from '../components/SetPinModal.vue';
import RomanticLoader from '../components/RomanticLoader.vue';

const {
  boardId,
  letters,
  metadata,
  activeLetter,
  history,
  fetchError,
  isDeleteModalOpen,
  isHistoryModalOpen,
  isSetPinModalOpen,
  setPinError,
  isPinPromptVisible,
  selectedHistoryLetter,
  openHistory,
  closeHistory,
  pickRandom,
  highlightedLetter,
  isPickingRandom,
  isWinner,
  isPinRequired,
  pinError,
  isLoadingBackend,
  isSyncing,
  isBackgroundRefreshing,
  isPageLoaderVisible,
  pageLoaderMessage,
  pageLoaderSubmessage,
  handleUnlockPin,
  handleCancelPin,
  handleOpenSetPin,
  handleCloseSetPin,
  handleSetPin,
  handlePickRandom,
  handleCompleteLetter,
  handleExcludeLetter,
  handleCancelLetter,
  handleSelectLetter,
  handleDeleteConfirm,
  goHome
} = useBoardPage();
</script>

<template>
  <main class="container">
    <header class="header">
      <button type="button" class="brand-wrap" title="Повернутися на головну" @click="goHome">
        <AppLogo :size="38" />
        <h1 class="brand-title">AlphaDate</h1>
      </button>

      <!-- Top right indicators: background refreshing spinner OR pin attention icon -->
      <Transition name="sync-fade" mode="out-in">
        <div
          v-if="isBackgroundRefreshing"
          key="sync-indicator"
          class="header-sync-indicator"
          aria-label="Оновлення даних..."
          role="status"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="sync-spinner-icon"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </div>

        <button
          v-else-if="isPinPromptVisible"
          key="pin-attention-btn"
          type="button"
          class="pin-attention-btn"
          aria-label="Захистити дошку PIN-кодом"
          @click="handleOpenSetPin"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="attention-icon"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="3" />
          </svg>
        </button>
      </Transition>
    </header>

    <template v-if="!isPinRequired">
      <!-- Sync error notification banner -->
      <div v-if="fetchError" class="sync-warning-banner" role="alert">
        <span>⚠️ {{ fetchError }} (показано локальні дані)</span>
      </div>

      <!-- Partner turns banner -->
      <div v-if="metadata.partners && metadata.partners.length > 0" class="turn-container">
        <span class="turn-label">Черга організовувати побачення</span>
        <div class="turn-badges">
          <span
            v-for="partner in metadata.partners"
            :key="partner.id"
            class="partner-badge"
            :class="{ active: partner.id === metadata.currentPartnerId }"
          >
            <span
              v-if="partner.id === metadata.currentPartnerId"
              :key="'rim-' + partner.id"
              class="partner-rim-beam"
              aria-hidden="true"
            >
              <span class="partner-rim-spinner"></span>
            </span>
            <span
              v-if="partner.id === metadata.currentPartnerId"
              class="active-dot"
              aria-hidden="true"
            ></span>
            <span class="partner-name">{{ partner.name }}</span>
          </span>
        </div>
      </div>

      <!-- Active Letter Action Panel Component -->
      <ActiveLetterPanel
        :letter="activeLetter"
        :selected-at="metadata.currentLetterSelectedAt"
        :board-id="boardId"
        :pick-random="pickRandom"
        :is-picking="isPickingRandom"
        :disabled="isSyncing || isPageLoaderVisible"
        @complete="handleCompleteLetter"
        @exclude="handleExcludeLetter"
        @cancel="handleCancelLetter"
        @pick="handlePickRandom"
      />

      <!-- Alphabet Letter Grid -->
      <AlphabetGrid
        :letters="letters"
        :active-letter="activeLetter?.letter"
        :highlighted-letter="highlightedLetter"
        :is-winner="isWinner"
        :disabled="!!activeLetter || isPickingRandom || isSyncing || isPageLoaderVisible"
        @select="handleSelectLetter"
        @view-history="(item) => openHistory(item.letter)"
      />

      <!-- History Journal Trigger Link -->
      <div class="history-trigger-section">
        <button
          type="button"
          class="history-journal-link"
          @click="openHistory()"
        >
          <span class="journal-icon" aria-hidden="true">📖</span>
          <span class="journal-link-text">Щоденник побачень</span>
          <span v-if="history.length > 0" class="history-count-pill">
            {{ history.length }}
          </span>
        </button>
      </div>

      <!-- Date History Modal -->
      <DateHistoryModal
        :is-open="isHistoryModalOpen"
        :history="history"
        :letters="letters"
        :selected-letter="selectedHistoryLetter"
        @close="closeHistory"
        @view-all="openHistory()"
      />

      <!-- Board Deletion Modal -->
      <DeleteConfirmModal
        :is-open="isDeleteModalOpen"
        @confirm="handleDeleteConfirm"
        @cancel="isDeleteModalOpen = false"
      />

      <footer class="footer">
        <button
          type="button"
          class="delete-board-link"
          @click="isDeleteModalOpen = true"
        >
          Видалити дошку
        </button>
      </footer>
    </template>

    <!-- Board PIN Code Modal -->
    <PinModal
      :is-open="isPinRequired"
      :error="pinError"
      :is-loading="isLoadingBackend"
      @unlock="handleUnlockPin"
      @cancel="handleCancelPin"
    />

    <!-- Set Board PIN Code Modal -->
    <SetPinModal
      :is-open="isSetPinModalOpen"
      :error="setPinError"
      :is-loading="isLoadingBackend"
      @set-pin="handleSetPin"
      @close="handleCloseSetPin"
    />

    <!-- Romantic Thematic Loader for initial load and syncing / marking letters -->
    <RomanticLoader
      :visible="isPageLoaderVisible"
      :message="pageLoaderMessage"
      :submessage="pageLoaderSubmessage"
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-sync-indicator {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  color: var(--color-accent, #ea7a87);
  opacity: 0.45;
  pointer-events: none;
}

.sync-spinner-icon {
  width: 22px;
  height: 22px;
  display: block;
  transform-origin: center;
  animation: spinSync 1.2s linear infinite;
}

@keyframes spinSync {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sync-fade-enter-active,
.sync-fade-leave-active {
  transition: opacity 300ms ease;
}

.sync-fade-enter-from,
.sync-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sync-spinner-icon {
    animation-duration: 2.5s;
  }
  .sync-fade-enter-active,
  .sync-fade-leave-active {
    transition: none;
  }
}

.pin-attention-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0.4rem;
  color: var(--color-accent, #ea7a87);
  cursor: pointer;
  transition: color 0.2s ease, filter 0.2s ease;
  animation: floatBob 2.4s ease-in-out infinite;
}

.pin-attention-btn:hover {
  color: #e65100;
  filter: drop-shadow(0 2px 6px rgba(234, 122, 135, 0.5));
}

.pin-attention-btn:focus-visible {
  outline: 2px solid var(--color-accent, #ea7a87);
  outline-offset: 4px;
  border-radius: 8px;
}

.attention-icon {
  width: 28px;
  height: 28px;
}

@keyframes floatBob {
  0%, 100% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(calc(-50% - 6px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .pin-attention-btn {
    animation: none;
  }
}

.sync-warning-banner {
  background: rgba(var(--color-accent-rgb, 138, 99, 229), 0.12);
  border: 1.5px solid var(--color-accent, #ea7a87);
  border-radius: 12px;
  padding: 0.65rem 1rem;
  margin-bottom: 1.5rem;
  color: var(--color-ink, #2d3748);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

.brand-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  user-select: none;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.brand-wrap:hover {
  transform: translateY(-1px);
}

.brand-wrap:active {
  transform: translateY(2px);
}

.brand-title {
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  color: var(--color-ink, #2d3748);
  letter-spacing: -0.02em;
}

.turn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 2rem 0;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 18px;
  padding: 1.25rem 1.5rem;
  box-shadow: inset 0 2px 6px rgba(45, 55, 72, 0.06);
}

.turn-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-ink-muted, #718096);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.turn-badges {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.partner-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-surface-muted, #f3eae3);
  border: 1.5px solid transparent;
  color: var(--color-ink-muted, #718096);
  padding: 0.4rem 1.1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: default;
  user-select: none;
  box-shadow: none;
  transition: all 0.2s ease;
}

.partner-badge.active {
  background: #ffffff;
  border-color: var(--color-accent, #ea7a87);
  color: var(--color-ink, #2d3748);
  font-weight: 700;
  box-shadow: 0 4px 14px -4px rgba(234, 122, 135, 0.25);
  transform: none;
}

.partner-rim-beam {
  position: absolute;
  inset: -1.5px;
  border-radius: 9999px;
  padding: 2px;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: partner-rim-fade 800ms ease-out forwards;
}

@keyframes partner-rim-fade {
  0% {
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.partner-rim-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 260%;
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%) rotate(0deg);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 65deg,
    rgba(74, 46, 27, 0.25) 80deg,
    #4a2e1b 95deg,
    #633e25 105deg,
    rgba(99, 62, 37, 0.35) 115deg,
    transparent 130deg,
    transparent 360deg
  );
  animation: partner-rim-spin 800ms linear forwards;
  transform-origin: center center;
}

@keyframes partner-rim-spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.active-dot,
.partner-name {
  position: relative;
  z-index: 1;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent, #ea7a87);
  display: inline-block;
  flex-shrink: 0;
  animation: dot-pulse 2.2s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes dot-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.35);
  }
}

@media (prefers-reduced-motion: reduce) {
  .active-dot,
  .partner-rim-beam,
  .partner-rim-spinner {
    animation: none;
  }
}

.history-trigger-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.history-journal-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  padding: 0.45rem 0.85rem;
  color: var(--color-ink-muted, #718096);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: none;
  user-select: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.history-journal-link .journal-link-text {
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition: text-decoration-color 0.15s ease;
}

.history-journal-link:hover {
  color: var(--color-accent, #ea7a87);
  background-color: var(--color-surface-muted, #f3eae3);
}

.history-journal-link:hover .journal-link-text {
  text-decoration-color: var(--color-accent, #ea7a87);
}

.journal-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.history-count-pill {
  background-color: rgba(var(--color-accent-rgb, 138, 99, 229), 0.15);
  color: var(--color-accent, #ea7a87);
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  line-height: 1;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.history-journal-link:hover .history-count-pill {
  background-color: var(--color-accent, #ea7a87);
  color: #ffffff;
}

.footer {
  text-align: center;
  max-width: 480px;
  margin: 2rem auto 0 auto;
  padding-top: 1.25rem;
  padding-bottom: 0.5rem;
  border-top: 1px solid rgba(45, 55, 72, 0.12);
}

.delete-board-link {
  background: transparent;
  border: none;
  color: #e53e3e;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(229, 62, 62, 0.4);
  box-shadow: none;
  user-select: none;
  transition:
    color 0.15s ease,
    text-decoration-color 0.15s ease,
    background-color 0.15s ease;
}

.delete-board-link:hover {
  color: #c53030;
  text-decoration-color: #c53030;
  background-color: rgba(229, 62, 62, 0.08);
}
</style>
