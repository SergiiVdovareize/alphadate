import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { useBodyScrollLock, _resetBodyScrollLockForTesting } from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    _resetBodyScrollLockForTesting();
  });

  afterEach(() => {
    _resetBodyScrollLockForTesting();
  });

  it('locks body scroll when boolean is true and unlocks via returned method', () => {
    const { unlock } = useBodyScrollLock(true);
    expect(document.body.style.overflow).toBe('hidden');

    unlock();
    expect(document.body.style.overflow).toBe('');
  });

  it('reacts to Ref value changes synchronously', () => {
    const isLocked = ref(false);
    const { unlock } = useBodyScrollLock(isLocked);

    expect(document.body.style.overflow).toBe('');

    isLocked.value = true;
    expect(document.body.style.overflow).toBe('hidden');

    isLocked.value = false;
    expect(document.body.style.overflow).toBe('');

    unlock();
  });

  it('handles nested locks gracefully with ref count', () => {
    const lock1 = useBodyScrollLock(true);
    const lock2 = useBodyScrollLock(true);

    expect(document.body.style.overflow).toBe('hidden');

    lock1.unlock();
    // Still locked by lock2
    expect(document.body.style.overflow).toBe('hidden');

    lock2.unlock();
    // Now fully unlocked
    expect(document.body.style.overflow).toBe('');
  });
});
