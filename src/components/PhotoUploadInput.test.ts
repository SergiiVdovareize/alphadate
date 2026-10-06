import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PhotoUploadInput from './PhotoUploadInput.vue';
import * as imageUtils from '../utils/image';

describe('PhotoUploadInput.vue', () => {
  it('renders trigger button when no photo is attached', () => {
    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: null
      }
    });

    expect(wrapper.find('.attach-photo-btn').exists()).toBe(true);
    expect(wrapper.find('.attach-photo-btn').text()).toContain('Прикріпити фото');
    expect(wrapper.find('.photo-preview-card').exists()).toBe(false);
  });

  it('renders preview card with thumbnail when modelValue is present', () => {
    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: 'data:image/webp;base64,sample'
      }
    });

    expect(wrapper.find('.photo-preview-card').exists()).toBe(true);
    expect(wrapper.find('.photo-thumbnail').attributes('src')).toBe('data:image/webp;base64,sample');
    expect(wrapper.find('.photo-success-label').text()).toContain('📸 Фото прикріплено');
  });

  it('emits update:modelValue null when remove button is clicked', async () => {
    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: 'data:image/webp;base64,sample'
      }
    });

    await wrapper.find('.remove-photo-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('triggers hidden file input when change or trigger button is clicked', async () => {
    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: null
      }
    });

    const fileInput = wrapper.find('input[type="file"]').element as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    await wrapper.find('.attach-photo-btn').trigger('click');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('compresses chosen file and emits update:modelValue with result', async () => {
    vi.spyOn(imageUtils, 'compressImageFile').mockResolvedValue('data:image/webp;base64,compressed');

    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: null
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
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['data:image/webp;base64,compressed']);
  });

  it('displays error and emits error event when compression fails', async () => {
    vi.spyOn(imageUtils, 'compressImageFile').mockRejectedValue(new Error('Невірний формат'));

    const wrapper = mount(PhotoUploadInput, {
      props: {
        modelValue: null
      }
    });

    const input = wrapper.find('input[type="file"]');
    const fakeFile = new File(['content'], 'bad.txt', { type: 'text/plain' });

    Object.defineProperty(input.element, 'files', {
      value: [fakeFile],
      configurable: true
    });

    await input.trigger('change');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.photo-error-msg').exists()).toBe(true);
    expect(wrapper.find('.photo-error-msg').text()).toContain('Невірний формат');
    expect(wrapper.emitted('error')).toBeTruthy();
    expect(wrapper.emitted('error')![1]).toEqual(['Невірний формат']);
  });
});
