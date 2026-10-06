<script setup lang="ts">
import { ref } from 'vue';
import { compressImageFile } from '../utils/image';
import AppAlert from './AppAlert.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    disabled?: boolean;
    ariaLabel?: string;
    buttonText?: string;
    processingText?: string;
    successLabel?: string;
    changeButtonText?: string;
    removeButtonTitle?: string;
  }>(),
  {
    modelValue: null,
    disabled: false,
    ariaLabel: 'Завантажити фото з побачення',
    buttonText: 'Прикріпити фото',
    processingText: 'Обробка фото...',
    successLabel: '📸 Фото прикріплено',
    changeButtonText: 'Змінити',
    removeButtonTitle: 'Видалити фото'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'processing', isProcessing: boolean): void;
  (e: 'error', errorMessage: string | null): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);
const photoError = ref<string | null>(null);

const triggerFileInput = () => {
  if (props.disabled || isProcessing.value) return;
  fileInputRef.value?.click();
};

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  isProcessing.value = true;
  emit('processing', true);
  photoError.value = null;
  emit('error', null);

  try {
    const compressed = await compressImageFile(file);
    emit('update:modelValue', compressed);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Не вдалося обробити фото. Спробуйте інше.';
    photoError.value = msg;
    emit('error', msg);
  } finally {
    isProcessing.value = false;
    emit('processing', false);
    input.value = '';
  }
};

const removePhoto = () => {
  if (props.disabled || isProcessing.value) return;
  emit('update:modelValue', null);
  photoError.value = null;
  emit('error', null);
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};
</script>

<template>
  <div class="photo-upload-section inline-photo-section">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="photo-file-input photo-hidden-input"
      tabindex="-1"
      :aria-label="ariaLabel"
      @change="onFileChange"
    />

    <!-- Preview if attached -->
    <div v-if="modelValue" class="photo-preview-card inline-photo-preview">
      <div class="photo-thumbnail-wrap">
        <img :src="modelValue" :alt="ariaLabel" class="photo-thumbnail" />
        <button
          type="button"
          class="remove-photo-btn remove-photo-badge"
          :aria-label="removeButtonTitle"
          :title="removeButtonTitle"
          :disabled="disabled || isProcessing"
          @click="removePhoto"
        >
          ✕
        </button>
      </div>
      <div class="photo-info-wrap">
        <span class="photo-success-label photo-status-text">{{ successLabel }}</span>
        <button
          type="button"
          class="change-photo-btn"
          :disabled="disabled || isProcessing"
          @click="triggerFileInput"
        >
          {{ changeButtonText }}
        </button>
      </div>
    </div>

    <!-- Attach button if none attached -->
    <div v-else class="photo-trigger-wrap">
      <button
        type="button"
        class="attach-photo-btn"
        :disabled="disabled || isProcessing"
        @click="triggerFileInput"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.8"
          stroke="currentColor"
          class="camera-icon"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
          />
        </svg>
        <span v-if="isProcessing">{{ processingText }}</span>
        <span v-else>{{ buttonText }}</span>
      </button>
    </div>

    <AppAlert v-if="photoError" class="photo-error-msg" :message="photoError" />
  </div>
</template>

<style scoped>
.photo-upload-section,
.inline-photo-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.photo-file-input,
.photo-hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.photo-trigger-wrap {
  width: 100%;
}

.attach-photo-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  border: 1.5px dashed var(--color-ink, #2d3748);
  background: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.attach-photo-btn:hover:not(:disabled) {
  background-color: #ffffff;
  border-color: var(--color-accent, #d97732);
  color: var(--color-accent, #d97732);
}

.attach-photo-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.attach-photo-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.camera-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.photo-preview-card,
.inline-photo-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.65rem;
  background: var(--color-surface-muted, #f3eae3);
  border: 1.5px solid #dfd5ca;
  border-radius: 12px;
  box-sizing: border-box;
}

.photo-thumbnail-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid var(--color-ink, #2d3748);
  flex-shrink: 0;
  background: #000;
}

.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-photo-btn,
.remove-photo-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: rgba(45, 55, 72, 0.85);
  color: #ffffff;
  border: none;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease;
  padding: 0;
}

.remove-photo-btn:hover:not(:disabled),
.remove-photo-badge:hover:not(:disabled) {
  background: var(--color-error, #b00020);
}

.remove-photo-btn:disabled,
.remove-photo-badge:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.photo-info-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  overflow: hidden;
}

.photo-success-label,
.photo-status-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
}

.change-photo-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-accent, #d97732);
  cursor: pointer;
  text-decoration: underline;
}

.change-photo-btn:hover:not(:disabled) {
  color: var(--color-accent-dark, #a3541c);
}

.change-photo-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.photo-error-msg {
  font-size: 0.8rem;
}
</style>
