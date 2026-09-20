<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
    withBadge?: boolean;
  }>(),
  {
    size: 40,
    withBadge: false
  }
);
</script>

<template>
  <div
    class="app-logo-container"
    :class="{ 'with-badge': withBadge }"
    :style="{ '--logo-size': `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="logo-svg"
      aria-label="AlphaDate Logo"
    >
      <!-- Delta (Δ) geometric structure -->
      <path
        d="M24 6L41 38H7L24 6Z"
        class="logo-delta"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Alpha (α) intertwined loop -->
      <path
        d="M33 21C29 17 21 16 16.5 20.5C12 25 12 31 16.5 35.5C21 39.5 28 38 32 32C34.5 28 37 24 40 21"
        class="logo-alpha"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.app-logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.app-logo-container.with-badge {
  padding: 0.5rem;
  background: var(--color-surface, #ffffff);
  border: 2px solid var(--color-ink, #2d3748);
  border-radius: 12px;
  box-shadow: 0 3px 0 var(--color-ink, #2d3748);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.logo-svg {
  display: block;
}

.logo-delta {
  stroke: var(--color-ink, #2d3748);
}

.logo-alpha {
  stroke: var(--color-accent, #ea7a87);
}
</style>
