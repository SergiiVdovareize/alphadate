import { ref, computed, watch } from 'vue';
import { api, type DateSuggestion } from '../services/api';

export interface DateSuggestionsProps {
  boardId: string;
  letter: string;
}

export function useDateSuggestions(props: DateSuggestionsProps) {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const suggestions = ref<DateSuggestion[]>([]);
  const cache = new Map<string, DateSuggestion[]>();

  const fetchSuggestions = async (force: boolean = false) => {
    if (!props.letter) return;

    const cacheKey = `${props.boardId}_${props.letter}`;
    if (!force && cache.has(cacheKey)) {
      suggestions.value = cache.get(cacheKey)!;
      error.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const res = await api.getSuggestions(props.boardId, props.letter);
      if (res && Array.isArray(res.suggestions)) {
        suggestions.value = res.suggestions;
        cache.set(cacheKey, res.suggestions);
      } else {
        suggestions.value = [];
      }
    } catch (err: unknown) {
      console.error('Failed to load suggestions:', err);
      error.value = err instanceof Error ? err.message : 'Не вдалося завантажити ідеї побачень.';
    } finally {
      isLoading.value = false;
    }
  };

  const toggleOpen = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value && suggestions.value.length === 0 && !isLoading.value) {
      fetchSuggestions();
    }
  };

  watch(
    () => props.letter,
    (newLetter, oldLetter) => {
      if (newLetter !== oldLetter) {
        if (isOpen.value) {
          fetchSuggestions();
        } else {
          const cacheKey = `${props.boardId}_${newLetter}`;
          if (cache.has(cacheKey)) {
            suggestions.value = cache.get(cacheKey)!;
          } else {
            suggestions.value = [];
          }
        }
      }
    }
  );

  const hasSuggestions = computed(() => suggestions.value.length > 0);

  return {
    isOpen,
    isLoading,
    error,
    suggestions,
    hasSuggestions,
    toggleOpen,
    fetchSuggestions
  };
}
