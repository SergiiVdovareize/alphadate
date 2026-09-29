import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PinModal from './PinModal.vue';

describe('PinModal.vue', () => {
  it('does not render content when isOpen is false', () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: false }
    });

    expect(wrapper.find('.pin-modal').exists()).toBe(false);
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders content when isOpen is true', () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true }
    });

    expect(wrapper.find('.pin-modal').exists()).toBe(true);
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('h2').text()).toBe('Доступ захищено');
    expect(wrapper.find('.pin-input').exists()).toBe(true);
  });

  it('sanitizes input to only digits and max 4 characters', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true }
    });

    const input = wrapper.find<HTMLInputElement>('.pin-input');
    await input.setValue('12ab345');
    await input.trigger('input');

    expect(input.element.value).toBe('1234');
  });

  it('disables unlock button when PIN length is less than 4 or when isLoading is true', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true, isLoading: false }
    });

    const unlockBtn = wrapper.find('.unlock-btn');
    expect(unlockBtn.attributes('disabled')).toBeDefined();

    const input = wrapper.find<HTMLInputElement>('.pin-input');
    await input.setValue('1234');
    expect(unlockBtn.attributes('disabled')).toBeUndefined();

    await wrapper.setProps({ isLoading: true });
    expect(unlockBtn.attributes('disabled')).toBeDefined();
    expect(unlockBtn.text()).toBe('Перевірка...');
  });

  it('emits unlock with 4-digit PIN on submit', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true }
    });

    const input = wrapper.find<HTMLInputElement>('.pin-input');
    await input.setValue('4321');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('unlock')).toBeTruthy();
    expect(wrapper.emitted('unlock')![0]).toEqual(['4321']);
  });

  it('emits cancel on cancel button or overlay click', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true }
    });

    await wrapper.find('.cancel-btn').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });

  it('emits cancel when Escape is pressed while open', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true }
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('displays error message when error prop is present', () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: true, error: 'Невірний PIN-код' }
    });

    const errorBanner = wrapper.find('.pin-error-banner');
    expect(errorBanner.exists()).toBe(true);
    expect(errorBanner.text()).toBe('Невірний PIN-код');
  });

  it('toggles body overflow and cleans up on unmount', async () => {
    const wrapper = mount(PinModal, {
      props: { isOpen: false }
    });

    expect(document.body.style.overflow).toBe('');

    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ isOpen: false });
    expect(document.body.style.overflow).toBe('');

    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');

    wrapper.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
