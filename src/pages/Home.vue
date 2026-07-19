<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAlphabetState } from '../composables/useAlphabetState';
import { api } from '../services/api';

interface SavedBoard {
  key: string;
  partners: string[];
  createdAt: string;
}

const router = useRouter();

const partners = ref(['', '']);
const email = ref('');
const isLoading = ref(false);
const savedBoards = ref<SavedBoard[]>([]);

onMounted(() => {
  const savedKey = 'alphadate_saved_boards';
  const list = localStorage.getItem(savedKey);
  if (list) {
    try {
      savedBoards.value = JSON.parse(list);
    } catch (e) {
      console.error('Failed to parse saved boards:', e);
    }
  }
});

const openBoard = (key: string) => {
  router.push(`/${key}`);
};

const createBoard = async () => {
  const validPartners = partners.value.map((p) => p.trim()).filter(Boolean);
  if (validPartners.length < 1) {
    alert("Будь ласка, введіть хоча б одне ім'я.");
    return;
  }

  const trimmedEmail = email.value.trim();
  if (!trimmedEmail) {
    alert('Будь ласка, введіть електронну пошту.');
    return;
  }

  isLoading.value = true;
  try {
    const data = await api.createBoard(validPartners, trimmedEmail);
    if (data.success && data.key) {
      // Save board details to localStorage history list
      const savedKey = 'alphadate_saved_boards';
      const existingList = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const newEntry = {
        key: data.key,
        partners: validPartners,
        createdAt: new Date().toISOString()
      };
      const updated = [newEntry, ...existingList.filter((b: any) => b.key !== data.key)];
      localStorage.setItem(savedKey, JSON.stringify(updated));

      // Initialize the board metadata immediately into localStorage using the composable
      const { initBoardMetadata } = useAlphabetState(data.key);
      initBoardMetadata(validPartners);

      router.push(`/${data.key}`);
    } else {
      alert('Не вдалося створити дошку. Спробуйте ще раз.');
    }
  } catch (error) {
    console.error('Error creating board:', error);
    alert('Помилка при створенні дошки. Перевірте, чи запущений сервер.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="home-container">
    <div class="card">
      <h1>AlphaDate</h1>
      <p>Створіть свій унікальний простір для планування побачень.</p>

      <!-- Quick continue banner for the most recent board -->
      <div v-if="savedBoards.length > 0" class="recent-suggestion" @click="openBoard(savedBoards[0].key)">
        <span class="suggestion-tag">Збережена дошка:</span>
        <span class="suggestion-partners">{{ savedBoards[0].partners.join(' та ') }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="arrow-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </div>

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

        <div class="input-group">
          <label>Електронна пошта</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Наприклад: email@example.com"
          />
        </div>

        <button type="submit" class="start-btn" :disabled="isLoading">
          {{ isLoading ? 'Створення...' : 'Створити спільну дошку' }}
        </button>
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

.start-btn:hover:not(:disabled) {
  opacity: 0.9;
  background-color: #5265e0;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recent-suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(100, 126, 255, 0.08);
  border: 1px solid rgba(100, 126, 255, 0.15);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.75rem;
  cursor: pointer;
  text-align: left;
}

.recent-suggestion:hover {
  background: rgba(100, 126, 255, 0.12);
  border-color: #647eff;
}

.suggestion-tag {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #647eff;
  letter-spacing: 0.05em;
  margin-right: 0.5rem;
}

.suggestion-partners {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--fg);
  flex-grow: 1;
}

.recent-suggestion .arrow-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #647eff;
  margin-left: 0.5rem;
}
</style>
