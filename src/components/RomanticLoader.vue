<script setup lang="ts">
import { useBodyScrollLock } from '../composables/useBodyScrollLock';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    message?: string;
    submessage?: string;
  }>(),
  {
    message: 'Зберігаємо побачення... 💕',
    submessage: 'Синхронізуємо ваші спогади з сервером...'
  }
);

useBodyScrollLock(() => props.visible);
</script>

<template>
  <Transition name="romantic-loader-fade">
    <div
      v-if="visible"
      class="romantic-loader-overlay"
      role="status"
      aria-live="polite"
      aria-label="Синхронізація з сервером"
    >
      <div class="romantic-loader-card">
        <!-- Thematic floating romantic elements -->
        <div class="heart-animation-wrapper">
          <div class="heart-halo" aria-hidden="true"></div>
          <span class="sparkle sparkle-1" aria-hidden="true">✨</span>
          <span class="sparkle sparkle-2" aria-hidden="true">💖</span>
          <span class="sparkle sparkle-3" aria-hidden="true">✨</span>

          <!-- Beating heart SVG -->
          <svg
            class="beating-heart-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#romantic-heart-grad)"
            />
            <defs>
              <linearGradient
                id="romantic-heart-grad"
                x1="2"
                y1="3"
                x2="22"
                y2="21.35"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stop-color="#fb7185" />
                <stop offset="100%" stop-color="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h3 class="loader-title">{{ message }}</h3>
        <p v-if="submessage" class="loader-submessage">{{ submessage }}</p>

        <!-- Pulsing dots indicator -->
        <div class="pulsing-dots" aria-hidden="true">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.romantic-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: rgba(45, 55, 72, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: wait;
  user-select: none;
}

.romantic-loader-card {
  position: relative;
  background-color: var(--color-surface, #ffffff);
  border: 2px solid var(--color-border, #2d3748);
  border-radius: 1.5rem;
  padding: 2.25rem 2rem;
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow:
    0 16px 36px rgba(45, 55, 72, 0.2),
    var(--shadow-3d, 0 4px 0 #2d3748);
  transform: translateY(0);
}

.heart-animation-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.heart-halo {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, rgba(244, 63, 94, 0) 70%);
  animation: haloPulse 2s ease-in-out infinite;
}

.beating-heart-icon {
  width: 52px;
  height: 52px;
  filter: drop-shadow(0 4px 8px rgba(244, 63, 94, 0.35));
  animation: heartBeat 1.4s ease-in-out infinite;
}

.sparkle {
  position: absolute;
  font-size: 1.1rem;
  pointer-events: none;
}

.sparkle-1 {
  top: 0;
  right: 6px;
  animation: floatSparkle 2.2s ease-in-out infinite;
}

.sparkle-2 {
  bottom: 6px;
  left: 4px;
  font-size: 0.9rem;
  animation: floatSparkle 2.2s ease-in-out infinite 0.7s;
}

.sparkle-3 {
  top: 10px;
  left: 2px;
  font-size: 0.85rem;
  animation: floatSparkle 2.2s ease-in-out infinite 1.4s;
}

.loader-title {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  line-height: 1.3;
}

.loader-submessage {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: var(--color-ink-muted, #718096);
  line-height: 1.4;
}

.pulsing-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-accent, #d97732);
  animation: dotPulse 1.2s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.18);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.18);
  }
  70% {
    transform: scale(1);
  }
}

@keyframes haloPulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.8;
  }
}

@keyframes floatSparkle {
  0%,
  100% {
    transform: translateY(0) scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-6px) scale(1.15);
    opacity: 1;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    transform: scale(0.7);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Transitions */
.romantic-loader-fade-enter-active,
.romantic-loader-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.romantic-loader-fade-enter-from,
.romantic-loader-fade-leave-to {
  opacity: 0;
}

.romantic-loader-fade-enter-from .romantic-loader-card,
.romantic-loader-fade-leave-to .romantic-loader-card {
  transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .beating-heart-icon,
  .heart-halo,
  .sparkle,
  .dot {
    animation: none;
  }
  .romantic-loader-fade-enter-active,
  .romantic-loader-fade-leave-active {
    transition: none;
  }
}
</style>
