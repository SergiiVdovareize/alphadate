<script setup lang="ts">
import { ref } from 'vue';
import AlphabetGrid from './components/AlphabetGrid.vue';
import RandomPickButton from './components/RandomPickButton.vue';
import LetterActionModal from './components/LetterActionModal.vue';
import { useAlphabetState } from './composables/useAlphabetState';
import type { LetterState, LetterStatus } from './composables/useAlphabetState';

const { letters, markAsStatus, pickRandom, resetState } = useAlphabetState();

const activeLetter = ref<LetterState | null>(null);

const handleSelect = (letter: LetterState) => {
  activeLetter.value = { ...letter };
};

const handleUpdateStatus = (letterChar: string, status: LetterStatus) => {
  markAsStatus(letterChar, status);
  activeLetter.value = null; // Failsafe, though modal should hit close itself mostly
};

const handleReset = () => {
  if (confirm("Ви впевнені, що хочете повністю скинути всі дані?")) {
    resetState();
  }
};
</script>

<template>
  <main class="container">
    <header class="header">
      <h1>AlphaDate</h1>
      <p class="subtitle">Оберіть літеру для вашого наступного тематичного побачення.</p>
    </header>

    <RandomPickButton 
      :pickRandom="pickRandom" 
      @pick="handleSelect" 
    />

    <AlphabetGrid 
      :letters="letters" 
      @select="handleSelect" 
    />

    <LetterActionModal 
      :letter="activeLetter" 
      @update-status="handleUpdateStatus" 
      @close="activeLetter = null" 
    />

    <footer class="footer">
      <button class="button small outline danger" @click="handleReset">
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
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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

.danger {
  color: #ef4444;
  border-color: #ef4444;
}
</style>
