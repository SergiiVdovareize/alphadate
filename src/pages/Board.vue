<script setup lang="ts">
import { useBoardPage } from '../composables/useBoardPage';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue';
import AppLogo from '../components/AppLogo.vue';
import ActiveLetterPanel from '../components/ActiveLetterPanel.vue';

const {
  boardId,
  letters,
  metadata,
  activeLetter,
  fetchError,
  isDeleteModalOpen,
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
      <div
        class="brand-wrap"
        style="cursor: pointer"
        title="Повернутися на головну"
        @click="goHome"
      >
        <AppLogo :size="38" />
        <h1 class="brand-title">AlphaDate</h1>
      </div>
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
    />

    <!-- Board Deletion Modal -->
    <DeleteConfirmModal
      :is-open="isDeleteModalOpen"
      @confirm="handleDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />

    <footer class="footer">
      <button class="button reset-btn" @click="isDeleteModalOpen = true">Видалити дошку</button>
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
}

.footer {
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--color-ink, #2d3748);
}

.reset-btn {
  cursor: pointer;
  background: var(--color-surface, #ffffff);
  color: var(--color-ink-muted, #718096);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  padding: 0.65rem 1.5rem;
  font-weight: 700;
  box-shadow: var(--shadow-3d-sm, 0 2.5px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.reset-btn:hover {
  color: var(--color-accent, #ea7a87);
  border-color: var(--color-accent, #ea7a87);
  box-shadow: 0 3px 0 var(--color-accent, #ea7a87);
  transform: translateY(-1px);
}

.reset-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--color-accent, #ea7a87);
}
</style>
