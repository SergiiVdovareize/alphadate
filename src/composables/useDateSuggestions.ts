import { ref, computed, watch } from 'vue';
import { api, type DateSuggestion } from '../services/api';
import { getErrorMessage } from '../utils/errors';

export interface DateSuggestionsProps {
  boardId: string;
  letter: string;
}

const suggestionsCache = new Map<string, DateSuggestion[]>();

export function clearSuggestionsCache() {
  suggestionsCache.clear();
}

export function useDateSuggestions(props: DateSuggestionsProps) {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const suggestions = ref<DateSuggestion[]>([]);

  const fetchSuggestions = async (force: boolean = false) => {
    if (!props.letter) return;

    const cacheKey = `${props.boardId}_${props.letter}`;
    if (!force && suggestionsCache.has(cacheKey)) {
      suggestions.value = suggestionsCache.get(cacheKey)!;
      error.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const res = await api.getSuggestions(props.boardId, props.letter);
      if (res && Array.isArray(res.suggestions)) {
        suggestions.value = res.suggestions;
        suggestionsCache.set(cacheKey, res.suggestions);
      } else {
        suggestions.value = [];
      }
    } catch (err: unknown) {
      console.error('Failed to load suggestions:', err);
      error.value = getErrorMessage(err, 'Не вдалося завантажити ідеї побачень.');
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
          if (suggestionsCache.has(cacheKey)) {
            suggestions.value = suggestionsCache.get(cacheKey)!;
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
