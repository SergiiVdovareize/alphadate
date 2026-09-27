import { ref, computed, onMounted, onUnmounted, type ComputedRef } from 'vue';

export interface CountdownInfo {
  expired: boolean;
  urgent: boolean;
  text: string;
}

export function useCountdown(
  selectedAtGetter: () => string | null | undefined,
  totalDays: number = 30
): ComputedRef<CountdownInfo | null> {
  const now = ref(Date.now());
  let interval: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now();
    }, 1000);
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

    const deadline = selectedTime + totalDays * 24 * 60 * 60 * 1000;
    const remaining = deadline - now.value;

    if (remaining <= 0) {
      return {
        expired: true,
        urgent: true,
        text: 'Час на побачення вичерпано!'
      };
    }

    // Prevent visual jump from 30 0 0 on initial open by offsetting by 5 seconds
    const maxRemaining = totalDays * 24 * 60 * 60 * 1000 - 5 * 1000;
    const effectiveRemaining = Math.min(remaining, maxRemaining);

    const days = Math.floor(effectiveRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((effectiveRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((effectiveRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((effectiveRemaining % (1000 * 60)) / 1000);

    const urgent = days < 3;

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
