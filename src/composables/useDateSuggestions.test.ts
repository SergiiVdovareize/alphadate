import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, nextTick } from 'vue';
import { useDateSuggestions } from './useDateSuggestions';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getSuggestions: vi.fn()
  }
}));

describe('useDateSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with closed state and empty suggestions', () => {
    const props = reactive({ boardId: 'test-board', letter: 'А' });
    const { isOpen, isLoading, error, suggestions, hasSuggestions } = useDateSuggestions(props);

    expect(isOpen.value).toBe(false);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(suggestions.value).toEqual([]);
    expect(hasSuggestions.value).toBe(false);
  });

  it('toggles open state and fetches suggestions on first open', async () => {
    const mockSuggestions = [{ title: 'Аквапарк', description: 'Поїздка в аквапарк' }];
    vi.mocked(api.getSuggestions).mockResolvedValue({
      success: true,
      letter: 'А',
      suggestions: mockSuggestions
    });

    const props = reactive({ boardId: 'test-board', letter: 'А' });
    const vm = useDateSuggestions(props);

    expect(vm.isOpen.value).toBe(false);
    vm.toggleOpen();
    expect(vm.isOpen.value).toBe(true);

    await nextTick();
    await vi.waitFor(() => expect(vm.isLoading.value).toBe(false));

    expect(api.getSuggestions).toHaveBeenCalledWith('test-board', 'А');
    expect(vm.suggestions.value).toEqual(mockSuggestions);
    expect(vm.hasSuggestions.value).toBe(true);
    expect(vm.error.value).toBeNull();
  });

  it('uses cached suggestions on subsequent calls for same letter', async () => {
    const mockSuggestions = [{ title: 'Аквапарк', description: 'Поїздка в аквапарк' }];
    vi.mocked(api.getSuggestions).mockResolvedValue({
      success: true,
      letter: 'А',
      suggestions: mockSuggestions
    });

    const props = reactive({ boardId: 'test-board', letter: 'А' });
    const vm = useDateSuggestions(props);

    await vm.fetchSuggestions();
    expect(api.getSuggestions).toHaveBeenCalledTimes(1);

    // Call again without force
    await vm.fetchSuggestions();
    expect(api.getSuggestions).toHaveBeenCalledTimes(1); // Cached!

    // Call with force=true
    await vm.fetchSuggestions(true);
    expect(api.getSuggestions).toHaveBeenCalledTimes(2);
  });

  it('sets error state when api fails', async () => {
    vi.mocked(api.getSuggestions).mockRejectedValue(new Error('Network failure'));

    const props = reactive({ boardId: 'test-board', letter: 'Б' });
    const vm = useDateSuggestions(props);

    await vm.fetchSuggestions();
    expect(vm.error.value).toBe('Network failure');
    expect(vm.suggestions.value).toEqual([]);
    expect(vm.isLoading.value).toBe(false);
  });

  it('fetches new suggestions when letter changes and panel is open', async () => {
    vi.mocked(api.getSuggestions).mockResolvedValue({
      success: true,
      letter: 'В',
      suggestions: [{ title: 'Вечеря', description: 'Романтична вечеря' }]
    });

    const props = reactive({ boardId: 'test-board', letter: 'Б' });
    const vm = useDateSuggestions(props);

    vm.isOpen.value = true;
    props.letter = 'В';

    await nextTick();
    await vi.waitFor(() => expect(api.getSuggestions).toHaveBeenCalledWith('test-board', 'В'));
  });
});
