<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <div>
    <dialog class="selection-modal" :open="isOpen">
      <div v-if="isOpen" class="modal-content">
        <h2>Підтвердження</h2>
        <p>Ви впевнені, що хочете повністю видалити цю дошку? Цю дію неможливо скасувати.</p>

        <div class="actions">
          <button class="button danger" @click="emit('confirm')">Так, видалити</button>
          <button class="button outline cancel-btn" @click="emit('cancel')">Скасувати</button>
        </div>
      </div>
    </dialog>
    <div v-if="isOpen" class="modal-overlay" @click="emit('cancel')"></div>
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
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 0 var(--color-ink, #2d3748);
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

.actions button {
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  border: 2px solid var(--color-ink, #2d3748);
  font-weight: 700;
  box-shadow: var(--shadow-3d-sm, 0 3px 0 #2d3748);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
}

.actions button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 0 var(--color-ink, #2d3748);
}

.actions button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--color-ink, #2d3748);
}

.button.danger {
  background: var(--color-accent-confirm, #5ea885);
  color: #ffffff;
}

.button.danger:hover {
  background: var(--color-accent-confirm-hover, #519675);
}

.button.outline {
  background: #ffffff;
  color: var(--color-ink, #2d3748);
}
</style>
