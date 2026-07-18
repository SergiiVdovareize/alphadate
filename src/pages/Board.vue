<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import RandomPickButton from '../components/RandomPickButton.vue';
import ResetConfirmModal from '../components/ResetConfirmModal.vue';
import { useAlphabetState, STATUS_UI_STRINGS } from '../composables/useAlphabetState';
import type { LetterState, LetterStatus } from '../composables/useAlphabetState';

const route = useRoute();
const router = useRouter();

// Retrieve ID from URL params. Fallback to default if somehow missing.
const boardId = (route.params.id as string) || 'default';

const { letters, metadata, markAsStatus, pickRandom, resetState } = useAlphabetState(boardId);

const activeLetter = ref<LetterState | null>(null);
const isResetModalOpen = ref(false);

const handleSelect = (letter: LetterState) => {
  activeLetter.value = { ...letter };
};

const handleUpdateStatus = (letterChar: string, status: LetterStatus) => {
  markAsStatus(letterChar, status);
  activeLetter.value = null; // Failsafe
};

const handleResetConfirm = () => {
  resetState();
  isResetModalOpen.value = false;
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <main class="container">
    <header class="header">
      <h1 style="cursor: pointer" title="Повернутися на головну" @click="goHome">AlphaDate</h1>
    </header>

    <div v-if="metadata.partners && metadata.partners.length > 0" class="turn-container">
      <span class="turn-label">Черга організовувати побачення</span>
      <div class="turn-badges">
        <span
          v-for="partner in metadata.partners"
          :key="partner.id"
          class="partner-badge"
          :class="{ active: partner.id === metadata.currentPartnerId }"
        >
          {{ partner.name }}
        </span>
      </div>
    </div>

    <!-- Active Letter Action Panel -->
    <div class="active-letter-panel">
      <div v-if="activeLetter" class="panel-content">
        <div class="letter-display-wrap">
          <h2 class="active-letter-char">{{ activeLetter.letter }}</h2>
          <span class="active-status-badge" :class="`status-${activeLetter.status}`">
            {{ STATUS_UI_STRINGS[activeLetter.status] }}
          </span>
        </div>
        <div class="action-buttons">
          <button
            v-if="activeLetter.status !== 'used'"
            class="button success"
            @click="handleUpdateStatus(activeLetter.letter, 'used')"
          >
            Використана
          </button>
          <button
            v-if="activeLetter.status !== 'skipped'"
            class="button warning"
            @click="handleUpdateStatus(activeLetter.letter, 'skipped')"
          >
            Пропустити
          </button>
          <button
            v-if="activeLetter.status !== 'excluded'"
            class="button danger"
            @click="handleUpdateStatus(activeLetter.letter, 'excluded')"
          >
            Виключити
          </button>
          <button
            v-if="activeLetter.status !== 'available'"
            class="button outline"
            @click="handleUpdateStatus(activeLetter.letter, 'available')"
          >
            Зробити новою
          </button>
          <button class="button text close-panel-btn" @click="activeLetter = null">
            Скасувати
          </button>
        </div>
      </div>
      <div v-else class="panel-placeholder">
        <p>Оберіть літеру вручну на дошці або натисніть кнопку випадкового вибору.</p>
        <RandomPickButton :pick-random="pickRandom" @pick="handleSelect" />
      </div>
    </div>

    <AlphabetGrid :letters="letters" @select="handleSelect" />

    <ResetConfirmModal
      :is-open="isResetModalOpen"
      @confirm="handleResetConfirm"
      @cancel="isResetModalOpen = false"
    />

    <footer class="footer">
      <button class="button reset-btn danger" @click="isResetModalOpen = true">
        Скинути всі дані
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

h1 {
  font-size: clamp(2rem, 10vw, 3rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: opacity 0.2s;
}

h1:hover {
  opacity: 0.8;
}

.footer {
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.reset-btn {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}
.reset-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
.reset-btn:active {
  transform: translateY(0);
}

.turn-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 2rem 0;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.turn-label {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.turn-badges {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.partner-badge {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  opacity: 0.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
}

.partner-badge.active {
  opacity: 1;
  background-color: #647eff;
  color: white;
  border-color: #647eff;
  box-shadow: 0 4px 12px rgba(100, 126, 255, 0.3);
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(100, 126, 255, 0.3);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 4px 20px rgba(100, 126, 255, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(100, 126, 255, 0.3);
  }
}

.active-letter-panel {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  text-align: center;
  transition: all 0.3s ease;
}

.panel-placeholder {
  color: var(--fg);
  opacity: 0.7;
  font-size: 1rem;
  padding: 0.5rem 0;
  margin: 0;
}

.panel-placeholder :deep(.selector-container) {
  margin: 1.5rem 0 0 0;
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.letter-display-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.active-letter-char {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  color: #647eff;
}

.active-status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.active-status-badge.status-available {
  background: rgba(66, 211, 146, 0.1);
  color: #33a06f;
  border: 1px solid rgba(66, 211, 146, 0.3);
}

.active-status-badge.status-used {
  background: rgba(66, 211, 146, 0.15);
  color: #33a06f;
  border: 1px solid rgba(66, 211, 146, 0.3);
}

.active-status-badge.status-excluded {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.active-status-badge.status-skipped {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.action-buttons button {
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

/* Button variants */
.button.success {
  background-color: #42d392;
  color: white;
  border: none;
}
.button.success:hover {
  background-color: #33a06f;
}

.button.warning {
  background-color: #f97316;
  color: white;
  border: none;
}
.button.warning:hover {
  background-color: #ea580c;
}

.button.danger {
  background-color: transparent;
  color: #94a3b8;
  border: 1px solid #94a3b8;
}
.button.danger:hover {
  background-color: #94a3b8;
  color: white;
}

.button.outline {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
}
.button.outline:hover {
  border-color: #647eff;
  background-color: rgba(100, 126, 255, 0.05);
}

.button.text {
  background: transparent;
  border: none;
  color: var(--fg);
  opacity: 0.6;
}
.button.text:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
