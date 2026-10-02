<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { PIN_LENGTH } from '../constants';

const props = defineProps<{
  isOpen: boolean;
  error?: string | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'set-pin', pin: string): void;
  (e: 'close'): void;
}>();

const pinInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const localError = ref<string | null>(null);


const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sanitized = target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
  pinInput.value = sanitized;
  localError.value = null;
  if (target.value !== sanitized) {
    target.value = sanitized;
  }
};

const submitPin = () => {
  if (pinInput.value.length !== PIN_LENGTH) {
    localError.value = 'PIN-код повинен складатися рівно з 4 цифр.';
    return;
  }
  if (!props.isLoading) {
    emit('set-pin', pinInput.value);
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
      pinInput.value = '';
      localError.value = null;
      nextTick(() => {
        inputRef.value?.focus();
      });
    } else {
      document.body.style.overflow = '';
      pinInput.value = '';
      localError.value = null;
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
    <dialog class="selection-modal set-pin-modal" :open="isOpen" aria-labelledby="set-pin-modal-title">
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
            class="shield-icon"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <h2 id="set-pin-modal-title">Захистіть вашу дошку</h2>
        <p class="description">
          Встановіть 4-значний PIN-код, щоб ваші плани, ідеї для побачень та історія залишалися особистими.
          Без коду сторонні особи з посиланням не зможуть переглядати або змінювати вміст дошки.
        </p>

        <form @submit.prevent="submitPin">
          <div class="pin-field-wrap">
            <input
              ref="inputRef"
              :value="pinInput"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="PIN_LENGTH"
              autocomplete="one-time-code"
              class="pin-hidden-input"
              aria-label="Введіть 4-значний PIN-код"
              :disabled="isLoading"
              @input="handleInput"
            />
            <div class="pin-dots-display" aria-hidden="true" @click="inputRef?.focus()">
              <div
                v-for="i in PIN_LENGTH"
                :key="i"
                class="pin-dot-box"
                :class="{ filled: pinInput.length >= i, focused: pinInput.length === i - 1 }"
              >
                <span v-if="pinInput.length >= i" class="dot"></span>
              </div>
            </div>
          </div>

          <div v-if="error || localError" class="pin-error" role="alert">
            {{ error || localError }}
          </div>

          <div class="actions">
            <button
              type="submit"
              class="button primary submit-btn"
              :disabled="pinInput.length !== PIN_LENGTH || isLoading"
            >
              <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
              <span v-else>Встановити PIN</span>
            </button>
            <button
              type="button"
              class="button outline cancel-btn"
              :disabled="isLoading"
              @click="emit('close')"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </dialog>
    <div
      class="modal-overlay"
      aria-hidden="true"
    ></div>
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
  width: 420px;
  color: var(--color-ink, #2d3748);
}

.modal-content {
  position: relative;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(45, 55, 72, 0.5);
  backdrop-filter: blur(2px);
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

.shield-icon {
  width: 36px;
  height: 36px;
}

.modal-content h2 {
  font-size: 1.45rem;
  font-weight: 800;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.65rem;
  color: var(--color-ink, #2d3748);
}

.description {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-ink-muted, #718096);
  font-size: 0.95rem;
  line-height: 1.5;
}

.pin-field-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pin-hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.pin-dots-display {
  display: flex;
  gap: 0.85rem;
}

.pin-dot-box {
  width: 56px;
  height: 64px;
  border: 2px solid #dfd5ca;
  border-radius: 14px;
  background: var(--color-bg, #fcfbf9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pin-dot-box.focused {
  border-color: var(--color-accent, #d97732);
  box-shadow: 0 0 0 3px rgba(217, 119, 50, 0.2);
}

.pin-dot-box.filled {
  border-color: var(--color-ink, #2d3748);
  background: var(--color-surface, #ffffff);
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-ink, #2d3748);
}

.pin-error {
  color: #e53e3e;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.25rem;
  background: rgba(229, 62, 62, 0.08);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.button {
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease,
    color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.button.primary {
  background: var(--color-accent, #d97732);
  color: #ffffff;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
}

.button.primary:hover:not(:disabled) {
  background: var(--color-accent-hover, #c26522);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #2d3748;
}

.button.primary:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.button.primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 #2d3748;
}

.button.outline {
  background: #ffffff;
  color: var(--color-ink, #2d3748);
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
}

.button.outline:hover:not(:disabled) {
  background: var(--color-surface-muted, #f3eae3);
  transform: translateY(-1px);
  box-shadow: 0 5px 0 #2d3748;
}

.button.outline:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.button.outline:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 #2d3748;
}

.button:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
