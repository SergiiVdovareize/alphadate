<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import AppAlert from './AppAlert.vue';
import AppButton from './AppButton.vue';
import PhotoUploadInput from './PhotoUploadInput.vue';

const props = defineProps<{
  letter: string;
  initialNote?: string;
  initialPhoto?: string;
  isLoading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'save', payload: { note: string; photo?: string | null }): void;
  (e: 'cancel'): void;
}>();

const note = ref(props.initialNote || '');
const photo = ref<string | null>(props.initialPhoto || null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isProcessingPhoto = ref(false);

onMounted(() => {
  nextTick(() => {
    textareaRef.value?.focus();
  });
});

const handleSave = () => {
  if (props.isLoading || isProcessingPhoto.value) return;
  emit('save', {
    note: note.value.trim(),
    photo: photo.value ?? null
  });
};
</script>

<template>
  <div class="inline-editor">
    <div class="inline-editor-body">
      <textarea
        :id="`inline-note-${letter}`"
        ref="textareaRef"
        v-model="note"
        rows="3"
        class="comment-textarea inline-editor-textarea"
        placeholder="Поділіться враженнями, куди сходили... (необов’язково)"
        aria-label="Враження від побачення"
        :disabled="isLoading"
      ></textarea>

      <!-- Photo attachment section -->
      <PhotoUploadInput
        v-model="photo"
        :disabled="isLoading"
        @processing="(val) => (isProcessingPhoto = val)"
      />

      <AppAlert v-if="error" class="editor-alert" :message="error" />

      <div class="completion-actions inline-editor-actions">
        <AppButton
          type="button"
          class="button success confirm-btn"
          variant="success"
          :disabled="isLoading || isProcessingPhoto"
          @click="handleSave"
        >
          <span v-if="isLoading">Збереження...</span>
          <span v-else>Зберегти</span>
        </AppButton>
        <AppButton
          type="button"
          class="button secondary cancel-btn"
          variant="secondary"
          :disabled="isLoading"
          @click="emit('cancel')"
        >
          Скасувати
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-editor {
  margin-top: 0.85rem;
  width: 100%;
}

.inline-editor-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.comment-textarea,
.inline-editor-textarea {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1.5px solid #dfd5ca;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-ink, #2d3748);
  background: var(--color-surface, #ffffff);
  box-sizing: border-box;
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.comment-textarea:focus,
.inline-editor-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb, 217, 119, 50), 0.2);
}

.editor-alert {
  margin: 0;
}

.completion-actions,
.inline-editor-actions {
  display: flex;
  gap: 0.65rem;
  width: 100%;
  margin-top: 0.25rem;
}

.completion-actions :deep(.app-button),
.inline-editor-actions :deep(.app-button),
.confirm-btn,
.cancel-btn {
  flex: 1;
}
</style>
