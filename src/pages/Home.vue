<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const partner1 = ref('');
const partner2 = ref('');

const createBoard = () => {
    if (!partner1.value || !partner2.value) {
        alert("Будь ласка, введіть обидва імена.");
        return;
    }

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let boardId = '';
    for (let i = 0; i < 5; i++) {
      boardId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // You can optionally save clean1 and clean2 to localStorage here if you want to display their names later.
    
    router.push(`/${boardId}`);
};
</script>

<template>
  <main class="home-container">
    <div class="card">
        <h1>AlphaDate</h1>
        <p>Створіть свій унікальний простір для планування побачень.</p>
        
        <form @submit.prevent="createBoard" class="setup-form">
            <div class="input-group">
                <label>Ваше ім'я</label>
                <input type="text" v-model="partner1" required placeholder="Наприклад: Олексій" />
            </div>
            
            <div class="input-group">
                <label>Ім'я партнера</label>
                <input type="text" v-model="partner2" required placeholder="Наприклад: Марія" />
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
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
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
    transition: opacity 0.2s, background-color 0.2s;
}

.start-btn:hover {
    opacity: 0.9;
    background-color: #5265e0;
}
</style>
