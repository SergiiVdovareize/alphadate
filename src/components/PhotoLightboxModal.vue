<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useBodyScrollLock } from '../composables/useBodyScrollLock';
import AppIcon from './AppIcon.vue';
import { mdiClose } from '@mdi/js';

interface LightboxPhoto {
  src: string;
  alt?: string;
}

const props = defineProps<{
  photo: LightboxPhoto | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isOpen = computed(() => Boolean(props.photo));
useBodyScrollLock(isOpen);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.photo) {
    e.stopImmediatePropagation();
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="photo"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Збільшене фото"
      >
        <button
          type="button"
          class="lightbox-backdrop"
          aria-label="Закрити зображення"
          tabindex="-1"
          @click="emit('close')"
        />
        <div class="lightbox-image-wrap">
          <div class="lightbox-image-container">
            <img :src="photo.src" :alt="photo.alt || 'Фото спогаду'" class="lightbox-img" />
            <button
              type="button"
              class="lightbox-close-btn"
              aria-label="Закрити зображення"
              title="Закрити зображення"
              @click="emit('close')"
            >
              <AppIcon :path="mdiClose" class="lightbox-close-icon" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  border: none;
  cursor: default;
  z-index: 1;
}

.lightbox-image-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  pointer-events: none;
}

.lightbox-image-container {
  position: relative;
  display: inline-block;
  max-width: 90vw;
  max-height: 90vh;
  pointer-events: auto;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  user-select: none;
  display: block;
}

.lightbox-close-btn {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 10;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  line-height: 1;
  backdrop-filter: blur(6px);
}

.lightbox-close-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: scale(1.05);
}

.lightbox-close-btn:active {
  transform: scale(0.95);
}

.lightbox-close-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.lightbox-close-icon {
  width: 26px;
  height: 26px;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
