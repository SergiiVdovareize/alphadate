import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DeleteConfirmModal from './DeleteConfirmModal.vue';

describe('DeleteConfirmModal.vue', () => {
  it('does not render content when isOpen is false', () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: false }
    });

    expect(wrapper.find('.modal-content').exists()).toBe(false);
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('renders content when isOpen is true', () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true }
    });

    expect(wrapper.find('.modal-content').exists()).toBe(true);
    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('dialog').attributes('aria-modal')).toBe('true');
    expect(wrapper.find('dialog').attributes('aria-labelledby')).toBe('delete-dialog-title');
    expect(wrapper.find('h2').text()).toBe('Видалити щоденник?');
  });

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true }
    });

    await wrapper.find('.button.danger').trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel when cancel button or overlay is clicked', async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true }
    });

    await wrapper.find('.cancel-btn').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(2);
  });

  it('emits cancel when Escape key is pressed while open', async () => {
    const wrapper = mount(DeleteConfirmModal, {
      props: { isOpen: true }
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    // Other keys do nothing
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('updates document body overflow when isOpen changes and cleans up on unmount', async () => {
    const wrapper = mount(DeleteConfirmModal, {
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
