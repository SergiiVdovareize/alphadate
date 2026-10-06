import { watch, onUnmounted, getCurrentInstance, isRef, type Ref } from 'vue';

let lockCount = 0;
let originalOverflow = '';

export function _resetBodyScrollLockForTesting() {
  lockCount = 0;
  originalOverflow = '';
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

export function useBodyScrollLock(isLocked: Ref<boolean> | (() => boolean) | boolean) {
  const getIsLocked = () => {
    if (typeof isLocked === 'function') return isLocked();
    if (isRef(isLocked)) return isLocked.value;
    return isLocked;
  };

  let wasActive = false;

  const lock = () => {
    if (wasActive) return;
    if (typeof document === 'undefined') return;
    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
    wasActive = true;
  };

  const unlock = () => {
    if (!wasActive) return;
    if (typeof document === 'undefined') return;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = originalOverflow || '';
    }
    wasActive = false;
  };

  if (typeof isLocked === 'boolean') {
    if (isLocked) {
      lock();
    }
  } else {
    watch(
      getIsLocked,
      (locked) => {
        if (locked) {
          lock();
        } else {
          unlock();
        }
      },
      { immediate: true, flush: 'sync' }
    );
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      unlock();
    });
  }

  return { lock, unlock };
}
