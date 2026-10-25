<script setup lang="ts">
import type { PartnerAvatarType } from '../../utils/history';

withDefaults(
  defineProps<{
    avatarType?: PartnerAvatarType;
  }>(),
  {
    avatarType: 'neutral'
  }
);
</script>

<template>
  <svg
    v-if="avatarType === 'female'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="partner-avatar-svg avatar-female-svg"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M10 2a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Zm-4.5 13a3.5 3.5 0 0 1 7 0v1.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75V15Z"
      clip-rule="evenodd"
    />
  </svg>
  <svg
    v-else-if="avatarType === 'male'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="partner-avatar-svg avatar-male-svg"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M10 2a4 4 0 0 0-4 4v.5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Zm-4.5 13a3.5 3.5 0 0 1 7 0v1.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75V15Z"
      clip-rule="evenodd"
    />
  </svg>
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="partner-avatar-svg avatar-neutral-svg"
    aria-hidden="true"
  >
    <path
      d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
    />
  </svg>
</template>
