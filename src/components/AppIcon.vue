<script setup lang="ts">
withDefaults(
  defineProps<{
    path: string;
    size?: number | string;
  }>(),
  {
    size: undefined
  }
);
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size || '1em'"
    :height="size || '1em'"
    fill="currentColor"
    aria-hidden="true"
  >
    <path :d="path" />
  </svg>
</template>
