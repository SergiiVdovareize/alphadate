<script setup lang="ts">
import { useBoardPage } from '../composables/useBoardPage';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import DateHistoryModal from '../components/DateHistoryModal.vue';
import AppLogo from '../components/AppLogo.vue';
import ActiveLetterPanel from '../components/ActiveLetterPanel.vue';

const {
  boardId,
  letters,
  metadata,
  activeLetter,
  history,
  fetchError,
  isDeleteModalOpen,
  isHistoryModalOpen,
  selectedHistoryLetter,
  openHistory,
  closeHistory,
  pickRandom,
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
    </header>

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
      @complete="handleCompleteLetter"
      @exclude="handleExcludeLetter"
      @cancel="handleCancelLetter"
      @pick="handleSelectLetter"
    />

    <!-- Alphabet Letter Grid -->
    <AlphabetGrid
      :letters="letters"
      :active-letter="activeLetter?.letter"
      :disabled="!!activeLetter"
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
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.sync-warning-banner {
  background: rgba(234, 122, 135, 0.12);
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
  box-shadow: none;
  transform: none;
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
  .active-dot {
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
  background-color: rgba(234, 122, 135, 0.15);
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
