<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useDateSuggestions } from '../composables/useDateSuggestions';
import { HINT_IMAGE_BOARD_ID } from '../constants';
import AppAlert from './AppAlert.vue';
import AppButton from './AppButton.vue';
import AppIcon from './AppIcon.vue';
import { mdiLightbulbOutline, mdiRefresh, mdiCreation, mdiClose } from '@mdi/js';

const props = defineProps<{
  boardId: string;
  letter: string;
}>();

const isHintImageBoard = computed(() => props.boardId === HINT_IMAGE_BOARD_ID);

const { isOpen, isLoading, error, suggestions, hasSuggestions, toggleOpen, fetchSuggestions } =
  useDateSuggestions(props);

const SHIMMER_INTERVAL_MS = 10_000;
const SHIMMER_DURATION_MS = 1_400;

const hintDialogRef = ref<HTMLDialogElement | null>(null);
const isHintShimmering = ref(false);
let shimmerIdleTimer: ReturnType<typeof setTimeout> | null = null;
let shimmerDurationTimer: ReturnType<typeof setTimeout> | null = null;
let pressedOutside = false;

const clearHintShimmerTimers = () => {
  if (shimmerIdleTimer) {
    clearTimeout(shimmerIdleTimer);
    shimmerIdleTimer = null;
  }
  if (shimmerDurationTimer) {
    clearTimeout(shimmerDurationTimer);
    shimmerDurationTimer = null;
  }
  isHintShimmering.value = false;
};

const scheduleHintShimmer = () => {
  if (!isHintImageBoard.value) return;
  clearHintShimmerTimers();
  shimmerIdleTimer = setTimeout(() => {
    isHintShimmering.value = true;
    shimmerDurationTimer = setTimeout(() => {
      isHintShimmering.value = false;
      scheduleHintShimmer();
    }, SHIMMER_DURATION_MS);
  }, SHIMMER_INTERVAL_MS);
};

onMounted(() => {
  scheduleHintShimmer();
});

onUnmounted(() => {
  clearHintShimmerTimers();
});

const isOutsideDialog = (event: PointerEvent, dialog: HTMLDialogElement) => {
  const rect = dialog.getBoundingClientRect();
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
};

const openHintImage = () => {
  clearHintShimmerTimers();
  const dialog = hintDialogRef.value;
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) {
      dialog.showModal();
    }
  } else {
    dialog.setAttribute('open', '');
  }
};

const closeHintImage = () => {
  const dialog = hintDialogRef.value;
  if (dialog) {
    if (typeof dialog.close === 'function') {
      if (dialog.open) {
        dialog.close();
      }
    } else {
      dialog.removeAttribute('open');
    }
  }
  scheduleHintShimmer();
};

const handleDialogPointerDown = (event: PointerEvent) => {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  const dialog = hintDialogRef.value;
  if (!dialog) return;
  pressedOutside = isOutsideDialog(event, dialog);
};

const handleDialogPointerUp = (event: PointerEvent) => {
  if ('closedBy' in HTMLDialogElement.prototype) return;
  const dialog = hintDialogRef.value;
  if (!dialog) return;
  if (pressedOutside && isOutsideDialog(event, dialog)) {
    closeHintImage();
  }
  pressedOutside = false;
};
</script>

<template>
  <div class="suggestions-wrapper">
    <template v-if="isHintImageBoard">
      <button
        type="button"
        class="suggestions-link-btn hint-image-btn"
        :class="{ 'is-shimmering': isHintShimmering }"
        @click="openHintImage"
      >
        <span class="btn-icon" aria-hidden="true">
          <AppIcon :path="mdiLightbulbOutline" class="btn-bulb-svg" />
        </span>
        <span class="btn-text">Отримати наступну підказку</span>
      </button>

      <dialog
        ref="hintDialogRef"
        class="hint-fullscreen-dialog"
        closedby="any"
        aria-label="Підказка"
        @close="scheduleHintShimmer"
        @pointerdown="handleDialogPointerDown"
        @pointerup="handleDialogPointerUp"
      >
        <div class="hint-dialog-content">
          <img src="/next-hint-9rusg.jpg" alt="Підказка" class="hint-fullscreen-img" />
          <button
            type="button"
            class="hint-close-btn"
            aria-label="Закрити підказку"
            title="Закрити підказку"
            @click="closeHintImage"
          >
            <AppIcon :path="mdiClose" class="hint-close-icon" />
          </button>
        </div>
      </dialog>
    </template>

    <template v-else>
      <!-- Toggle Link -->
      <button
        type="button"
        class="suggestions-link-btn"
        :class="{ 'is-open': isOpen, 'has-data': hasSuggestions }"
        :aria-expanded="isOpen"
        @click="toggleOpen"
      >
        <span class="btn-icon" aria-hidden="true">
          <AppIcon :path="mdiLightbulbOutline" class="btn-bulb-svg" />
        </span>
        <span class="btn-text">Ідеї для побачення на літеру «{{ letter }}»</span>
        <svg
          class="chevron-icon"
          :class="{ rotated: isOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Expandable Section -->
      <div v-if="isOpen" class="suggestions-drawer">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner" aria-hidden="true"></div>
          <p class="loading-text">Підбираємо романтичні ідеї на літеру «{{ letter }}»...</p>
          <p class="ai-disclaimer-loading">
            Ідеї генерує AI, тому вони можуть бути не завжди влучними.
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <AppAlert :message="error" type="error" class="error-text" />
          <AppButton
            type="button"
            class="retry-btn"
            variant="outline"
            size="sm"
            @click="() => fetchSuggestions(true)"
          >
            <span class="retry-btn-content">
              <AppIcon :path="mdiRefresh" class="retry-icon-svg" />
              <span>Спробувати знову</span>
            </span>
          </AppButton>
        </div>

        <!-- Suggestions List -->
        <div v-else-if="hasSuggestions" class="suggestions-content">
          <div class="ai-disclaimer">
            <span class="ai-sparkle" aria-hidden="true">
              <AppIcon :path="mdiCreation" class="ai-sparkle-svg" />
            </span>
            <span class="ai-disclaimer-text">
              Ці ідеї згенеровано штучним інтелектом — сміливо адаптуйте їх під ваші спільні смаки!
            </span>
          </div>
          <ul class="suggestions-list">
            <li v-for="(item, idx) in suggestions" :key="idx" class="suggestion-item">
              <h4 class="suggestion-title">{{ item.title }}</h4>
              <p class="suggestion-desc">{{ item.description }}</p>
            </li>
          </ul>
        </div>

        <!-- Empty fallback -->
        <div v-else class="empty-state">
          <p>Для цієї літери ще немає ідей.</p>
          <AppButton
            type="button"
            class="retry-btn"
            variant="outline"
            size="sm"
            @click="() => fetchSuggestions(true)"
          >
            Спробувати знову
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.suggestions-wrapper {
  width: 100%;
  max-width: 580px;
  margin: 0.5rem auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suggestions-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: transparent;
  border: none;
  padding: 0.35rem 0.65rem;
  color: var(--color-ink-muted, #718096);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  box-shadow: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.suggestions-link-btn .btn-text {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(113, 128, 150, 0.4);
  transition: text-decoration-color 0.15s ease;
}

.suggestions-link-btn:hover {
  color: var(--color-accent, #d97732);
}

.suggestions-link-btn:hover .btn-text {
  text-decoration-color: var(--color-accent, #d97732);
}

.suggestions-link-btn.is-open {
  color: var(--color-accent, #d97732);
}

.suggestions-link-btn.is-open .btn-text {
  text-decoration-color: var(--color-accent, #d97732);
}

.suggestions-link-btn:focus-visible {
  outline: 2px solid var(--color-accent, #d97732);
  outline-offset: 2px;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-bulb-svg {
  width: 1.1rem;
  height: 1.1rem;
}

.retry-btn-content {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.retry-icon-svg {
  width: 0.95rem;
  height: 0.95rem;
}

.chevron-icon {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.suggestions-drawer {
  margin-top: 1rem;
  width: 100%;
  box-sizing: border-box;
  padding-top: 1rem;
  border-top: 1px dashed #dfd5ca;
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  gap: 0.75rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(45, 55, 72, 0.12);
  border-top-color: var(--color-accent, #d97732);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-ink-muted, #718096);
  margin: 0;
}

.ai-disclaimer-loading {
  font-size: 0.8rem;
  color: var(--color-ink-muted, #718096);
  margin: 0;
  max-width: 340px;
  line-height: 1.35;
}

.error-text {
  width: 100%;
  max-width: 320px;
  margin: 0;
  text-align: center;
}

.ai-disclaimer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  gap: 0.8rem;
  background: #fffbf3;
  border: 1px dashed rgba(217, 119, 50, 0.3);
  border-radius: 10px;
  padding: 0.6rem 0.95rem;
  margin-bottom: 0.85rem;
  font-size: 0.82rem;
  color: var(--color-ink-muted, #718096);
  line-height: 1.4;
  box-shadow: 0 1px 3px rgba(45, 55, 72, 0.04);
}

.ai-sparkle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-accent, #d97732);
}

.ai-sparkle-svg {
  width: 1.1rem;
  height: 1.1rem;
}

.ai-disclaimer-text {
  flex: 1;
  text-align: left;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.suggestion-item {
  padding-bottom: 0.9rem;
  border-bottom: 1px solid #eee5dd;
}

.suggestion-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.suggestion-title {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-ink, #2d3748);
  line-height: 1.35;
}

.suggestion-desc {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-ink-muted, #718096);
}

.hint-image-btn {
  position: relative;
  overflow: hidden;
}

.hint-image-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 15%,
    rgba(217, 119, 50, 0.22) 42%,
    rgba(255, 255, 255, 0.78) 50%,
    rgba(217, 119, 50, 0.22) 58%,
    transparent 85%
  );
  transform: translateX(-130%);
  pointer-events: none;
}

.hint-image-btn.is-shimmering {
  color: var(--color-accent, #d97732);
  background-color: rgba(217, 119, 50, 0.08);
}

.hint-image-btn.is-shimmering::after {
  animation: hint-btn-shimmer 1.4s ease-in-out 1;
}

@keyframes hint-btn-shimmer {
  0% {
    transform: translateX(-130%);
  }
  100% {
    transform: translateX(130%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hint-image-btn.is-shimmering::after {
    animation: none;
  }
}

.hint-fullscreen-dialog[open] {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint-fullscreen-dialog:modal {
  width: fit-content;
  max-width: calc(100vw - 1.5rem);
  max-height: calc(100dvh - 1.5rem);
  padding: 0;
  border: none;
  background: transparent;
  margin: auto;
  overflow: hidden;
  box-sizing: border-box;
  overscroll-behavior: contain;
}

.hint-fullscreen-dialog::backdrop {
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(6px);
  overflow: hidden;
  overscroll-behavior: contain;
}

.hint-dialog-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: calc(100dvh - 1.5rem);
  overflow: hidden;
  box-sizing: border-box;
}

.hint-fullscreen-img {
  max-width: calc(100vw - 1.5rem);
  max-height: calc(100dvh - 1.5rem);
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  display: block;
  user-select: none;
}

.hint-close-btn {
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
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease;
  backdrop-filter: blur(6px);
}

.hint-close-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: scale(1.05);
}

.hint-close-btn:active {
  transform: scale(0.95);
}

.hint-close-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.hint-close-icon {
  width: 26px;
  height: 26px;
}
</style>
