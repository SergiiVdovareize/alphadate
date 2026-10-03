<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { PIN_LENGTH } from '../constants';

const props = defineProps<{
  isOpen: boolean;
  error?: string | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'unlock', pin: string): void;
  (e: 'cancel'): void;
}>();

const pinInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // Keep only digits and max PIN_LENGTH chars
  const sanitized = target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
  pinInput.value = sanitized;
  if (target.value !== sanitized) {
    target.value = sanitized;
  }
};

const submitPin = () => {
  if (pinInput.value.length === PIN_LENGTH && !props.isLoading) {
    emit('unlock', pinInput.value);
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
      pinInput.value = '';
      nextTick(() => {
        inputRef.value?.focus();
      });
    } else {
      document.body.style.overflow = '';
      pinInput.value = '';
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.isOpen) {
    inputRef.value?.focus();
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div v-if="isOpen">
    <dialog class="selection-modal pin-modal" :open="isOpen" aria-labelledby="pin-modal-title">
      <div class="modal-content">
        <div class="icon-wrap" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lock-icon"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 id="pin-modal-title">Доступ захищено</h2>
        <p>Ця дошка захищена PIN-кодом. Введіть 4-значний код для доступу.</p>

        <form autocomplete="off" @submit.prevent="submitPin">
          <div class="pin-field-wrap">
            <input
              ref="inputRef"
              :value="pinInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="PIN_LENGTH"
              class="pin-input"
              placeholder="••••"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              :disabled="isLoading"
              aria-label="Введіть 4-значний PIN-код"
              @input="handleInput"
            />
          </div>

          <div v-if="error" class="pin-error-banner" role="alert">
            {{ error }}
          </div>

          <div class="actions">
            <button
              type="submit"
              class="button primary unlock-btn"
              :disabled="pinInput.length !== PIN_LENGTH || isLoading"
            >
              {{ isLoading ? 'Перевірка...' : 'Розблокувати' }}
            </button>
            <button
              type="button"
              class="button outline cancel-btn"
              :disabled="isLoading"
              @click="emit('cancel')"
            >
              На головну
            </button>
          </div>
        </form>
      </div>
    </dialog>
    <div class="modal-overlay" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.selection-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 1000;
  background: var(--color-surface, #ffffff);
  border: 1.5px solid #dfd5ca;
  border-radius: 24px;
  padding: 2.25rem;
  box-shadow: 0 20px 50px rgba(45, 55, 72, 0.16);
  max-width: 90vw;
  width: 380px;
  color: var(--color-ink, #2d3748);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 55, 72, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(217, 119, 50, 0.12);
  border: 2px solid var(--color-accent, #d97732);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: var(--color-accent, #d97732);
}

.lock-icon {
  width: 34px;
  height: 34px;
}

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--color-ink, #2d3748);
}

.modal-content p {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-ink, #2d3748);
  opacity: 0.85;
  line-height: 1.45;
  font-size: 0.95rem;
}

.pin-field-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pin-input {
  -webkit-text-security: disc;
  text-security: disc;
  width: 200px;
  text-align: center;
  font-size: 2.3rem;
  letter-spacing: 0.45em;
  padding: 0.6rem 0.6rem 0.6rem 0.9em;
  font-family: monospace, inherit;
  font-weight: 700;
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 14px;
  background: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
  box-shadow: inset 0 2px 4px rgba(45, 55, 72, 0.06);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.pin-input:focus {
  outline: none;
  border-color: var(--color-accent, #d97732);
  box-shadow: 0 0 0 3px rgba(217, 119, 50, 0.2);
}

.pin-error-banner {
  padding: 0.65rem 0.9rem;
  background-color: var(--color-error-bg, #fff5f5);
  border: 1.5px solid var(--color-error-border, #feb2b2);
  border-radius: var(--radius-error, 10px);
  color: var(--color-error, #c53030);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.25rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions button {
  padding: 0.85rem 1.25rem;
  min-height: 48px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  border: 2px solid var(--color-ink, #2d3748);
  font-weight: 700;
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.actions button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.actions button:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 var(--color-ink, #2d3748));
}

.actions button:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.button.primary {
  background: var(--color-accent, #d97732);
  color: #ffffff;
}

.button.primary:hover:not(:disabled) {
  background: var(--color-accent-hover, #c26522);
}

.button.outline {
  background: #ffffff;
  color: var(--color-ink, #2d3748);
}

.button.outline:hover:not(:disabled) {
  background: var(--color-surface-muted, #f3eae3);
}

.actions button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748);
}
</style>
