<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string | null;
    type?: 'error' | 'success' | 'info' | 'warning';
  }>(),
  {
    message: '',
    type: 'error'
  }
);
</script>

<template>
  <div
    class="app-alert"
    :class="`is-${type}`"
    role="alert"
    aria-live="polite"
  >
    <slot>{{ message }}</slot>
  </div>
</template>

<style scoped>
.app-alert {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-error, 10px);
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
  box-sizing: border-box;
  animation: alert-slide-down 0.2s ease-out;
  border: 1.5px solid transparent;
}

@keyframes alert-slide-down {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-alert.is-error {
  background-color: var(--color-error-bg, #fff5f5);
  color: var(--color-error, #c53030);
  border-color: var(--color-error-border, transparent);
}

.app-alert.is-success {
  background-color: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.app-alert.is-info {
  background-color: var(--color-surface-muted, #f3eae3);
  color: var(--color-ink, #2d3748);
  border-color: #dfd5ca;
}

.app-alert.is-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

@media (prefers-reduced-motion: reduce) {
  .app-alert {
    animation: none;
  }
}
</style>
