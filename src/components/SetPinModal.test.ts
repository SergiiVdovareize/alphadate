import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SetPinModal from './SetPinModal.vue';
import { _resetBodyScrollLockForTesting } from '../composables/useBodyScrollLock';

describe('SetPinModal.vue', () => {
  afterEach(() => {
    _resetBodyScrollLockForTesting();
  });
  it('does not render content when isOpen is false', () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: false }
    });

    expect(wrapper.find('.set-pin-modal').exists()).toBe(false);
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders content when isOpen is true', () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    expect(wrapper.find('.set-pin-modal').exists()).toBe(true);
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe('Захистіть ваш щоденник');
    expect(wrapper.find('.description').text()).toContain('Встановіть 4-значний PIN-код');
    expect(wrapper.find('.pin-hidden-input').exists()).toBe(true);
    expect(wrapper.find('.cancel-btn').text()).toBe('Скасувати');
  });

  it('sanitizes input to only digits and max 4 characters', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    const input = wrapper.find<HTMLInputElement>('.pin-hidden-input');
    await input.setValue('98ab765');
    await input.trigger('input');

    expect(input.element.value).toBe('9876');
  });

  it('disables submit button when PIN is less than 4 digits or when loading', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true, isLoading: false }
    });

    const submitBtn = wrapper.find('.submit-btn');
    expect(submitBtn.attributes('disabled')).toBeDefined();

    const input = wrapper.find<HTMLInputElement>('.pin-hidden-input');
    await input.setValue('1234');
    expect(submitBtn.attributes('disabled')).toBeUndefined();

    await wrapper.setProps({ isLoading: true });
    expect(submitBtn.attributes('disabled')).toBeDefined();
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('emits set-pin event when 4-digit PIN is submitted', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    const input = wrapper.find<HTMLInputElement>('.pin-hidden-input');
    await input.setValue('4321');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('set-pin')).toBeTruthy();
    expect(wrapper.emitted('set-pin')![0]).toEqual(['4321']);
  });

  it('emits close event when cancel button is clicked', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    await wrapper.find('.cancel-btn').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not emit close event when overlay is clicked', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('displays error prop when provided', () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true, error: 'Помилка збереження PIN-коду' }
    });

    expect(wrapper.find('.pin-error').text()).toBe('Помилка збереження PIN-коду');
  });

  it('does not close on Escape key press', async () => {
    const wrapper = mount(SetPinModal, {
      props: { isOpen: true }
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('close')).toBeFalsy();
  });
});
