<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAlphabetState } from '../composables/useAlphabetState';

const router = useRouter();

const partners = ref(['', '']);

const createBoard = () => {
  const validPartners = partners.value.map((p) => p.trim()).filter(Boolean);
  if (validPartners.length < 1) {
    alert("Будь ласка, введіть хоча б одне ім'я.");
    return;
  }

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let boardId = '';
  for (let i = 0; i < 5; i++) {
    boardId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Initialize the board metadata immediately into localStorage using the composable
  const { initBoardMetadata } = useAlphabetState(boardId);
  initBoardMetadata(validPartners);

  router.push(`/${boardId}`);
};
</script>

<template>
  <main class="home-container">
    <div class="card">
      <h1>AlphaDate</h1>
      <p>Створіть свій унікальний простір для планування побачень.</p>

      <form class="setup-form" @submit.prevent="createBoard">
        <div v-for="(_, index) in partners" :key="index" class="input-group">
          <label v-if="index === 0">Ваше ім'я</label>
          <label v-else>Ім'я партнера</label>
          <input
            v-model="partners[index]"
            type="text"
            required
            :placeholder="index === 0 ? 'Наприклад: Олексій' : 'Наприклад: Марія'"
          />
        </div>

        <button type="submit" class="start-btn">Створити спільну дошку</button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  margin-top: 0;
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  opacity: 0.8;
  margin-bottom: 2rem;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.input-group input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 1rem;
  background: var(--bg-muted);
  color: var(--fg);
  width: 100%;
}

.start-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  background-color: var(--color-primary, #647eff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    background-color 0.2s;
}

.start-btn:hover {
  opacity: 0.9;
  background-color: #5265e0;
}
</style>
