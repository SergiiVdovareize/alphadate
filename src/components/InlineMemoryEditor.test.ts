import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InlineMemoryEditor from './InlineMemoryEditor.vue';
import * as imageUtils from '../utils/image';

describe('InlineMemoryEditor.vue', () => {
  it('renders with initial values for note and photo', () => {
    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'К',
        initialNote: 'Кава у парку',
        initialPhoto: 'https://cdn.example.com/photo.webp'
      }
    });

    expect(wrapper.find('textarea').attributes('aria-label')).toBe('Враження від побачення');
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('Кава у парку');
    expect(wrapper.find('.photo-thumbnail').exists()).toBe(true);
    expect(wrapper.find('.photo-thumbnail').attributes('src')).toBe('https://cdn.example.com/photo.webp');
  });

  it('removes photo when remove button is clicked', async () => {
    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'В',
        initialPhoto: 'https://cdn.example.com/photo.webp'
      }
    });

    expect(wrapper.find('.inline-photo-preview').exists()).toBe(true);
    await wrapper.find('.remove-photo-badge').trigger('click');
    expect(wrapper.find('.inline-photo-preview').exists()).toBe(false);
    expect(wrapper.find('.attach-photo-btn').exists()).toBe(true);
  });

  it('emits save with updated note and photo on save click', async () => {
    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'М',
        initialNote: 'Старий коментар',
        initialPhoto: 'https://cdn.example.com/old.webp'
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Новий коментар');

    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Зберегти'));
    expect(saveBtn).toBeDefined();
    await saveBtn!.trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')![0]).toEqual([
      {
        note: 'Новий коментар',
        photo: 'https://cdn.example.com/old.webp'
      }
    ]);
  });

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'А'
      }
    });

    const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('Скасувати'));
    expect(cancelBtn).toBeDefined();
    await cancelBtn!.trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('compresses chosen image file and updates photo preview', async () => {
    vi.spyOn(imageUtils, 'compressImageFile').mockResolvedValue('data:image/webp;base64,new_compressed');

    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'А'
      }
    });

    const input = wrapper.find('input[type="file"]');
    const fakeFile = new File(['content'], 'test.png', { type: 'image/png' });

    Object.defineProperty(input.element, 'files', {
      value: [fakeFile],
      configurable: true
    });

    await input.trigger('change');
    await wrapper.vm.$nextTick();

    expect(imageUtils.compressImageFile).toHaveBeenCalledWith(fakeFile);
    expect(wrapper.find('.photo-thumbnail').exists()).toBe(true);
    expect(wrapper.find('.photo-thumbnail').attributes('src')).toBe('data:image/webp;base64,new_compressed');
  });

  it('shows error banner when error prop is provided', () => {
    const wrapper = mount(InlineMemoryEditor, {
      props: {
        letter: 'А',
        error: 'Помилка при збереженні'
      }
    });

    expect(wrapper.text()).toContain('Помилка при збереженні');
  });
});
