import { ref, computed, onMounted, onUnmounted, type ComputedRef } from 'vue';
import {
  DEFAULT_COUNTDOWN_DAYS,
  URGENT_DAYS_THRESHOLD,
  INITIAL_SELECTION_OFFSET_MS,
  COUNTDOWN_TICK_INTERVAL_MS,
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND
} from '../constants';

export interface CountdownInfo {
  expired: boolean;
  urgent: boolean;
  text: string;
}

export function useCountdown(
  selectedAtGetter: () => string | null | undefined,
  totalDays: number = DEFAULT_COUNTDOWN_DAYS
): ComputedRef<CountdownInfo | null> {
  const now = ref(Date.now());
  let interval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now();
    }, COUNTDOWN_TICK_INTERVAL_MS);
  });

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  return computed(() => {
    const selectedAt = selectedAtGetter();
    if (!selectedAt) return null;

    const selectedTime = new Date(selectedAt).getTime();
    if (isNaN(selectedTime)) return null;

    const deadline = selectedTime + totalDays * MS_PER_DAY;
    const remaining = deadline - now.value;

    if (remaining <= 0) {
      return {
        expired: true,
        urgent: true,
        text: 'Час на побачення вичерпано!'
      };
    }

    // Prevent visual jump from 30 0 0 on initial open by offsetting initial seconds
    const maxRemaining = totalDays * MS_PER_DAY - INITIAL_SELECTION_OFFSET_MS;
    const effectiveRemaining = Math.min(remaining, maxRemaining);

    const days = Math.floor(effectiveRemaining / MS_PER_DAY);
    const hours = Math.floor((effectiveRemaining % MS_PER_DAY) / MS_PER_HOUR);
    const minutes = Math.floor((effectiveRemaining % MS_PER_HOUR) / MS_PER_MINUTE);
    const seconds = Math.floor((effectiveRemaining % MS_PER_MINUTE) / MS_PER_SECOND);

    const urgent = days < URGENT_DAYS_THRESHOLD;

    let text = '';
    if (days > 0) {
      text = `Залишилось: ${days} дн. ${hours} год. ${minutes} хв`;
    } else if (hours > 0) {
      text = `Залишилось: ${hours} год. ${minutes} хв ${seconds} с`;
    } else {
      text = `Залишилось: ${minutes} хв ${seconds} с`;
    }

    return {
      expired: false,
      urgent,
      text
    };
  });
}
