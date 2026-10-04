<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('cancel');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>

<template>
  <div>
    <dialog class="selection-modal" :open="isOpen">
      <div v-if="isOpen" class="modal-content">
        <h2>Видалити дошку?</h2>
        <p>Усі заплановані побачення та збережені спогади буде втрачено. Цю дію неможливо скасувати.</p>

        <div class="actions">
          <AppButton
            type="button"
            class="button danger"
            variant="danger"
            size="md"
            block
            @click="emit('confirm')"
          >
            Так, видалити
          </AppButton>
          <AppButton
            type="button"
            class="button outline cancel-btn"
            variant="outline"
            size="md"
            block
            @click="emit('cancel')"
          >
            Скасувати
          </AppButton>
        </div>
      </div>
    </dialog>
    <button
      v-if="isOpen"
      type="button"
      class="modal-overlay"
      aria-label="Закрити модальне вікно"
      @click="emit('cancel')"
    ></button>
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
  width: 400px;
  color: var(--color-ink, #2d3748);
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

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--color-ink, #2d3748);
}

.modal-content p {
  text-align: center;
  margin-bottom: 1.75rem;
  color: var(--color-ink, #2d3748);
  opacity: 0.85;
  line-height: 1.5;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
