<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
  }>(),
  {
    size: 40
  }
);
</script>

<template>
  <div class="app-logo-container">
    <img
      src="/logo.png"
      alt="AlphaDate Logo"
      class="logo-img"
      :style="{ height: `${size}px`, width: 'auto' }"
    />
  </div>
</template>

<style scoped>
.app-logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.logo-img {
  display: block;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
