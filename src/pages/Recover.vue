<script setup lang="ts">
import AppLogo from '../components/AppLogo.vue';
import AppAlert from '../components/AppAlert.vue';
import AppButton from '../components/AppButton.vue';
import { useRecoverPage } from '../composables/useRecoverPage';

const {
  email,
  isLoading,
  isSuccess,
  errorMessage,
  isEmailError,
  isCopied,
  copyKeyword,
  goHome,
  handleRecover
} = useRecoverPage();
</script>

<template>
  <main class="recover-container">
    <div class="card">
      <div class="top-nav">
        <button type="button" class="back-link-btn" @click="goHome">
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
          На головну
        </button>
      </div>

      <div class="logo-wrap">
        <AppLogo :size="48" />
      </div>

      <h1>Відновлення щоденника</h1>
      <p class="subtitle">
        Забули або втратили посилання на спільний щоденник? Дотримуйтесь цих кроків для швидкого
        відновлення доступу:
      </p>

      <div class="steps-list">
        <!-- Step 1: Previous device / browser -->
        <section class="step-card" aria-labelledby="step-1-heading">
          <div class="step-header">
            <span class="step-number" aria-hidden="true">1</span>
            <h2 id="step-1-heading" class="step-title">Відкрийте з пристрою, де вже заходили</h2>
          </div>
          <p class="step-desc">
            Якщо ви вже відкривали щоденник раніше на телефоні, ноутбуці або планшеті — він
            зберігається в пам’яті цього браузера автоматично.
          </p>
        </section>

        <div class="or-divider" role="separator" aria-label="або">
          <span>або</span>
        </div>

        <!-- Step 2: Search in mail (Gmail direct search link) -->
        <section class="step-card" aria-labelledby="step-2-heading">
          <div class="step-header">
            <span class="step-number" aria-hidden="true">2</span>
            <h2 id="step-2-heading" class="step-title">Пошукайте лист від AlphaDate у пошті</h2>
          </div>
          <p class="step-desc">
            Одразу під час створення щоденника ми надсилали вітальний лист із прямим посиланням
            (при реєстрації могла вводитись пошта будь-якого партнера). Спробуйте знайти його за
            словом
            <button
              type="button"
              class="copy-keyword-btn"
              :class="{ 'is-copied': isCopied }"
              :title="isCopied ? 'Скопійовано!' : 'Натисніть, щоб скопіювати «AlphaDate»'"
              :aria-label="isCopied ? 'Слово скопійовано' : 'Скопіювати слово AlphaDate'"
              @click="copyKeyword"
            >
              <span class="keyword-text">«AlphaDate»</span>
              <svg
                v-if="!isCopied"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="copy-icon"
                aria-hidden="true"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="copy-icon check-icon"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg></button
            >.
          </p>
        </section>

        <div class="or-divider" role="separator" aria-label="або">
          <span>або</span>
        </div>

        <!-- Step 3: Enter email to resend link -->
        <section class="step-card" aria-labelledby="step-3-heading">
          <div class="step-header">
            <span class="step-number" aria-hidden="true">3</span>
            <h2 id="step-3-heading" class="step-title">Надіслати посилання на Email</h2>
          </div>
          <p class="step-desc step-desc-form">
            Якщо попередні способи не спрацювали, введіть електронну пошту, зазначену під час
            створення щоденника (пам’ятайте, що при реєстрації могла вводитись пошта будь-якого
            партнера) — ми повторно надішлемо вам посилання.
          </p>

          <form v-if="!isSuccess" class="recovery-form" novalidate @submit.prevent="handleRecover">
            <div class="input-group">
              <label for="recovery-email-field">Електронна пошта</label>
              <input
                id="recovery-email-field"
                v-model="email"
                type="email"
                placeholder="Наприклад: couple@example.com"
                :disabled="isLoading"
                autocomplete="email"
                :class="{ 'input-error': isEmailError }"
                @input="errorMessage = null"
              />
            </div>

            <AppAlert
              v-if="errorMessage"
              class="error-banner"
              :message="errorMessage"
            />

            <AppButton
              type="submit"
              class="submit-btn"
              variant="primary"
              size="lg"
              block
              :disabled="isLoading"
              :loading="isLoading"
              loading-text="Надсилання..."
            >
              Надіслати посилання на пошту
            </AppButton>
          </form>

          <div v-else class="success-box" role="status">
            <div class="success-icon" aria-hidden="true">💌</div>
            <h3 class="success-title">Лист надіслано!</h3>
            <p class="success-desc">
              Якщо щоденник було зареєстровано на цю адресу, ми надіслали лист із посиланням на нього.
              Будь ласка, перевірте поштову скриньку (і папку «Спам»).
              Пам’ятайте, що при реєстрації могла вводитись пошта будь-якого партнера — якщо листа немає,
              спробуйте також адресу іншого партнера.
            </p>
            <button type="button" class="action-btn outline-btn" @click="goHome">
              Повернутися на головну
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.recover-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.card {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  max-width: 540px;
  width: 100%;
  box-shadow: none;
  position: relative;
}

.top-nav {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.25rem;
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

.logo-wrap {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

h1 {
  font-size: 1.85rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: var(--color-ink, #2d3748);
  letter-spacing: -0.02em;
  text-align: center;
}

.subtitle {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #718096;
  text-align: center;
  margin: 0 0 2rem 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.step-card {
  background: #fdfcfb;
  border: 1.5px solid #ece5de;
  border-radius: 16px;
  padding: 1.25rem 1.25rem;
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.step-card:hover {
  border-color: #dfd5ca;
}

.or-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0;
  color: var(--color-ink-muted, #718096);
  font-size: 0.88rem;
  font-weight: 700;
  user-select: none;
  text-align: center;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.step-number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e2e8f0;
  color: var(--color-ink, #2d3748);
  font-weight: 800;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  margin: 0;
}

.step-desc {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #4a5568;
  margin: 0;
}

.step-desc-form {
  margin-bottom: 0.85rem;
}

.copy-keyword-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0 0.15rem;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  cursor: pointer;
  vertical-align: baseline;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  text-decoration-color: var(--color-accent, #d97732);
  transition:
    text-decoration-color 0.15s ease,
    color 0.15s ease;
  user-select: none;
}

.copy-keyword-btn:hover {
  text-decoration-color: var(--color-accent-hover, #c26522);
}

.copy-icon {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--color-accent, #d97732);
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.copy-keyword-btn:hover .copy-icon {
  color: var(--color-accent-hover, #c26522);
}

.copy-keyword-btn.is-copied,
.copy-keyword-btn.is-copied:hover {
  text-decoration-color: #38a169;
}

.copy-keyword-btn.is-copied .copy-icon,
.copy-keyword-btn.is-copied:hover .copy-icon,
.copy-icon.check-icon {
  color: #38a169 !important;
}

.copy-keyword-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
  border-radius: 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.outline-btn {
  background: #ffffff;
  color: var(--color-ink, #2d3748);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  font-weight: 700;
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.outline-btn:hover {
  background: var(--color-surface-muted, #f3eae3);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.outline-btn:active {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.outline-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.recovery-form {
  margin-top: 0.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

.input-group label {
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: var(--color-ink, #2d3748);
}

.input-group input {
  width: 100%;
  padding: 0.7rem 0.95rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.92rem;
  color: var(--color-ink, #2d3748);
  background: #ffffff;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-accent, #d97732);
  box-shadow: 0 0 0 3px rgba(217, 119, 50, 0.15);
}

.input-group input.input-error {
  border-color: var(--color-error, #c53030);
  background-color: var(--color-error-bg, #fff5f5);
}

.input-group input.input-error:focus {
  border-color: var(--color-error, #c53030);
  box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.2);
}

.error-banner {
  text-align: center;
  margin-bottom: 0.75rem;
}

.success-box {
  background: #f0fff4;
  border: 1.5px solid #9ae6b4;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.success-icon {
  font-size: 1.75rem;
}

.success-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #22543d;
  margin: 0;
}

.success-desc {
  font-size: 0.85rem;
  line-height: 1.45;
  color: #276749;
  margin: 0 0 0.5rem 0;
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.6rem;
  }
}
</style>
