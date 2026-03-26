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
        <p>Ви впевнені, що хочете повністю скинути всі дані?</p>

        <div class="actions">
          <button class="button danger" @click="emit('confirm')">Так, скинути</button>
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
  background: var(--bg, #fff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 2rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 90vw;
  width: 400px;
}

@media (prefers-color-scheme: dark) {
  .selection-modal {
    background: #1e293b;
    border-color: #334155;
    color: #f8fafc;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 999;
}

.modal-content h2 {
  font-size: 2rem;
  text-align: center;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.modal-content p {
  text-align: center;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.actions button {
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid var(--border, #e2e8f0);
  font-weight: 500;
  transition: all 0.2s;
}

.button.danger {
  background: var(--color-danger, #ef4444);
  color: white;
  border-color: transparent;
}
.button.danger:hover {
  opacity: 0.9;
}

.button.outline {
  background: var(--bg-muted, #f8fafc);
  color: var(--fg, #334155);
}
.button.outline:hover {
  background: var(--border, #e2e8f0);
}

.cancel-btn {
  width: 100%;
}
</style>
