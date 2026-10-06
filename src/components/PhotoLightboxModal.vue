<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useBodyScrollLock } from '../composables/useBodyScrollLock';

export interface LightboxPhoto {
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
        <button
          type="button"
          class="lightbox-close-btn"
          aria-label="Закрити зображення"
          title="Закрити зображення"
          @click="emit('close')"
        >
          ✕
        </button>
        <div class="lightbox-image-wrap">
          <img
            :src="photo.src"
            :alt="photo.alt || 'Фото спогаду'"
            class="lightbox-img"
          />
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
  padding: 0;
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

.lightbox-close-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #ffffff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  line-height: 1;
  backdrop-filter: blur(4px);
}

.lightbox-close-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: scale(1.08);
}

.lightbox-close-btn:active {
  transform: scale(0.95);
}

.lightbox-close-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.lightbox-image-wrap {
  position: relative;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  border-radius: 0;
  box-shadow: none;
  user-select: none;
  display: block;
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
