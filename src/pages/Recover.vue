<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLogo from '../components/AppLogo.vue';
import { api } from '../services/api';

const router = useRouter();

const email = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref<string | null>(null);

const isCopied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | undefined;

const copyKeyword = async () => {
  const keyword = 'AlphaDate';
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(keyword);
    } else if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      const textarea = document.createElement('textarea');
      textarea.value = keyword;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    isCopied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
  }
};

let iosFallbackTimeout: ReturnType<typeof setTimeout> | undefined;

const navigateTo = (url: string) => {
  if (typeof window !== 'undefined') {
    if (typeof window.location.assign === 'function') {
      window.location.assign(url);
    } else {
      window.location.href = url;
    }
  }
};

const openGmail = async () => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const webSearchUrl = 'https://mail.google.com/mail/u/0/#search/AlphaDate';

  if (isAndroid) {
    // Android Chrome Intent: triggers native Gmail app if present, or redirects to web fallback
    navigateTo(
      'intent://#Intent;package=com.google.android.gm;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;S.browser_fallback_url=' +
        encodeURIComponent(webSearchUrl) +
        ';end'
    );
    return;
  }

  if (isIOS) {
    // iOS URL scheme: launches native Gmail app if present, with fallback to web if not installed
    const start = Date.now();
    navigateTo('googlegmail:///');
    if (iosFallbackTimeout) clearTimeout(iosFallbackTimeout);
    iosFallbackTimeout = setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - start < 1500) {
        navigateTo(webSearchUrl);
      }
    }, 800);
    return;
  }

  // Desktop or other environments: open web search directly in new tab
  window.open(webSearchUrl, '_blank', 'noopener,noreferrer');
};

onUnmounted(() => {
  if (copyTimeout) clearTimeout(copyTimeout);
  if (iosFallbackTimeout) clearTimeout(iosFallbackTimeout);
});

const handleRecover = async () => {
  const trimmed = email.value.trim();
  if (!trimmed) {
    errorMessage.value = 'Будь ласка, введіть електронну пошту.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    const res = await api.recoverBoard(trimmed);
    if (res.success) {
      isSuccess.value = true;
    } else {
      errorMessage.value = res.message || 'Не вдалося надіслати посилання. Спробуйте пізніше.';
    }
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error
        ? err.message
        : 'Помилка при відновленні дошки. Перевірте зʼєднання.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="recover-container">
    <div class="card">
      <div class="top-nav">
        <button type="button" class="back-link-btn" @click="router.push('/')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="back-arrow"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          На головну
        </button>
      </div>

      <div class="logo-wrap">
        <AppLogo :size="48" />
      </div>

      <h1>Відновлення дошки</h1>
      <p class="subtitle">
        Забули або втратили посилання на спільну дошку? Дотримуйтесь цих кроків для швидкого відновлення доступу:
      </p>

      <div class="steps-list">
        <!-- Step 1: Previous device / browser -->
        <section class="step-card" aria-labelledby="step-1-heading">
          <div class="step-header">
            <span class="step-number" aria-hidden="true">1</span>
            <h2 id="step-1-heading" class="step-title">Відкрийте з пристрою, де вже заходили</h2>
          </div>
          <p class="step-desc">
            Якщо ви вже відкривали дошку раніше на телефоні, ноутбуці або планшеті — вона зберігається у памʼяті цього браузера автоматично.
          </p>
        </section>

        <!-- Step 2: Search in mail (Gmail direct search link) -->
        <section class="step-card" aria-labelledby="step-2-heading">
          <div class="step-header">
            <span class="step-number" aria-hidden="true">2</span>
            <h2 id="step-2-heading" class="step-title">Пошукайте лист від AlphaDate у пошті</h2>
          </div>
          <p class="step-desc">
            Одразу під час створення дошки ми надсилали вітальний лист із прямим посиланням. Спробуйте знайти його за словом
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
              </svg>
            </button>.
          </p>
          <div class="step-action-row">
            <button
              type="button"
              class="action-btn gmail-btn"
              @click="openGmail"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="gmail-icon"
                aria-hidden="true"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              Відкрити Gmail
              <span class="external-icon" aria-hidden="true">↗</span>
            </button>
          </div>
          <p class="step-subnote">
            На телефоні відкриється застосунок Gmail (або вебверсія пошуку).
          </p>
        </section>

        <!-- Step 3: Enter email to resend link -->
        <section class="step-card highlight-card" aria-labelledby="step-3-heading">
          <div class="step-header">
            <span class="step-number highlight-number" aria-hidden="true">3</span>
            <h2 id="step-3-heading" class="step-title">Надіслати посилання на Email</h2>
          </div>
          <p class="step-desc">
            Якщо попередні способи не спрацювали, введіть електронну пошту, зазначену під час створення дошки — ми повторно надішлемо вам посилання.
          </p>

          <form v-if="!isSuccess" class="recovery-form" @submit.prevent="handleRecover">
            <div class="input-group">
              <label for="recovery-email-field">Ваша електронна пошта</label>
              <input
                id="recovery-email-field"
                v-model="email"
                type="email"
                required
                placeholder="Наприклад: couple@example.com"
                :disabled="isLoading"
                autocomplete="email"
              />
            </div>

            <div v-if="errorMessage" class="error-banner" role="alert">
              {{ errorMessage }}
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Надсилання...' : 'Надіслати посилання на пошту' }}
            </button>
          </form>

          <div v-else class="success-box" role="status">
            <div class="success-icon" aria-hidden="true">💌</div>
            <h3 class="success-title">Лист надіслано!</h3>
            <p class="success-desc">
              Якщо дошка була зареєстрована на цю адресу, ми надіслали лист із посиланням на неї. Будь ласка, перевірте поштову скриньку (і папку «Спам»).
            </p>
            <button type="button" class="action-btn outline-btn" @click="router.push('/')">
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
  transition: color 0.15s ease, background 0.15s ease;
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
  gap: 1.25rem;
}

.step-card {
  background: #fdfcfb;
  border: 1.5px solid #ece5de;
  border-radius: 16px;
  padding: 1.25rem 1.25rem;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.step-card:hover {
  border-color: #dfd5ca;
}

.highlight-card {
  border-color: rgba(217, 119, 50, 0.35);
  background: #fffdfb;
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

.highlight-number {
  background: var(--color-accent, #d97732);
  color: #ffffff;
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
  margin: 0 0 0.85rem 0;
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
  transition: text-decoration-color 0.15s ease, color 0.15s ease;
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

.step-action-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
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

.gmail-btn {
  background: #ffffff;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.gmail-btn:hover {
  background: #fff5f5;
  border-color: #e53e3e;
}

.gmail-btn:active {
  transform: translateY(1px);
}

.gmail-btn:focus-visible {
  outline: 2px solid #c53030;
  outline-offset: 2px;
}

.gmail-icon {
  width: 1rem;
  height: 1rem;
}

.external-icon {
  font-size: 0.9rem;
  line-height: 1;
  opacity: 0.7;
}

.step-subnote {
  font-size: 0.78rem;
  color: #a0aec0;
  margin: 0.6rem 0 0 0;
  line-height: 1.35;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-accent, #d97732);
  box-shadow: 0 0 0 3px rgba(217, 119, 50, 0.15);
}

.submit-btn {
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: var(--color-accent, #d97732);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-accent-hover, #c26522);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748);
}

.submit-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.error-banner {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-size: 0.82rem;
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
