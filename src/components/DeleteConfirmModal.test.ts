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
    expect(wrapper.find('h2').text()).toBe('Підтвердження');
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
  });
});
