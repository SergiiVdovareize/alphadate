<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AlphabetGrid from '../components/AlphabetGrid.vue';
import RandomPickButton from '../components/RandomPickButton.vue';
import LetterActionModal from '../components/LetterActionModal.vue';
import ResetConfirmModal from '../components/ResetConfirmModal.vue';
import { useAlphabetState } from '../composables/useAlphabetState';
import type { LetterState, LetterStatus } from '../composables/useAlphabetState';

const route = useRoute();
const router = useRouter();

// Retrieve ID from URL params. Fallback to default if somehow missing.
const boardId = (route.params.id as string) || 'default';

const { letters, markAsStatus, pickRandom, resetState } = useAlphabetState(boardId);

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
      <p class="subtitle">Оберіть літеру для вашого наступного тематичного побачення.</p>
    </header>

    <RandomPickButton :pick-random="pickRandom" @pick="handleSelect" />

    <AlphabetGrid :letters="letters" @select="handleSelect" />

    <LetterActionModal
      :letter="activeLetter"
      @update-status="handleUpdateStatus"
      @close="activeLetter = null"
    />

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

.subtitle {
  opacity: 0.8;
  font-size: 1.1rem;
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
</style>
