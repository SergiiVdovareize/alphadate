<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'text';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    block?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    loadingText: '',
    block: false
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (e: MouseEvent) => {
  if (props.disabled || props.loading) {
    e.preventDefault();
    return;
  }
  emit('click', e);
};
</script>

<template>
  <button
    :type="type"
    class="app-button"
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 'is-loading': loading, 'is-block': block }
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner button-spinner" aria-hidden="true">
      <svg class="spinner-svg" viewBox="0 0 24 24" fill="none">
        <circle class="spinner-track" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" />
        <path class="spinner-head" d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    </span>

    <span class="button-content">
      <template v-if="loading && loadingText">{{ loadingText }}</template>
      <slot v-else />
    </span>
  </button>
</template>

<style scoped>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  box-sizing: border-box;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  border-radius: 12px;
  border: 2px solid var(--color-ink, #2d3748);
  box-shadow: var(--shadow-3d, 0 4px 0 #2d3748);
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.app-button:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.app-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--color-ink, #2d3748);
}

.app-button:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: var(--shadow-3d-pressed, 0 1px 0 #2d3748);
}

.app-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 0 var(--color-ink, #2d3748);
}

/* Sizing */
.app-button.size-sm {
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
  border-radius: 10px;
}

.app-button.size-md {
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  border-radius: 12px;
}

.app-button.size-lg {
  padding: 0.9rem 1.5rem;
  font-size: 1.05rem;
  border-radius: 14px;
}

.app-button.is-block {
  width: 100%;
}

/* Variants */
.app-button.variant-primary {
  background-color: var(--color-accent, #d97732);
  color: #ffffff;
}
.app-button.variant-primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover, #c26522);
}

.app-button.variant-success {
  background-color: var(--color-accent-confirm, #5ea885);
  color: #ffffff;
}
.app-button.variant-success:hover:not(:disabled) {
  background-color: var(--color-accent-confirm-hover, #519675);
}

.app-button.variant-secondary {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
}
.app-button.variant-secondary:hover:not(:disabled) {
  background-color: var(--color-surface, #ffffff);
}

.app-button.variant-danger {
  background-color: #e53e3e;
  color: #ffffff;
}
.app-button.variant-danger:hover:not(:disabled) {
  background-color: #c53030;
}
.app-button.variant-danger:focus-visible {
  outline-color: #e53e3e;
}

.app-button.variant-outline {
  background-color: var(--color-surface, #ffffff);
  color: var(--color-ink, #2d3748);
}
.app-button.variant-outline:hover:not(:disabled) {
  background-color: var(--color-surface-muted, #f3eae3);
}

.app-button.variant-text {
  background-color: transparent;
  border-color: transparent;
  box-shadow: none;
  color: var(--color-ink, #2d3748);
}
.app-button.variant-text:hover:not(:disabled) {
  background-color: var(--color-surface-muted, #f3eae3);
  transform: none;
  box-shadow: none;
}
.app-button.variant-text:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: none;
}

/* Loading spinner */
.button-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  margin-right: 0.35rem;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  animation: button-spin 0.8s linear infinite;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-head {
  opacity: 0.85;
}

@keyframes button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.button-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

@media (prefers-reduced-motion: reduce) {
  .app-button {
    transition: none;
  }
  .spinner-svg {
    animation: none;
  }
}
</style>
