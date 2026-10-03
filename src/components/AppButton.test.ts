import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppButton from './AppButton.vue';

describe('AppButton.vue', () => {
  it('renders default button with primary variant and md size', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Натисни мене'
      }
    });

    expect(wrapper.text()).toBe('Натисни мене');
    expect(wrapper.classes()).toContain('variant-primary');
    expect(wrapper.classes()).toContain('size-md');
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('renders variants and block class correctly', () => {
    const wrapper = mount(AppButton, {
      props: {
        variant: 'success',
        size: 'lg',
        block: true
      },
      slots: {
        default: 'Підтвердити'
      }
    });

    expect(wrapper.classes()).toContain('variant-success');
    expect(wrapper.classes()).toContain('size-lg');
    expect(wrapper.classes()).toContain('is-block');
  });

  it('handles click events when active', async () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Клік'
      }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Заблоковано'
      }
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders loading spinner and disables click when loading', async () => {
    const wrapper = mount(AppButton, {
      props: {
        loading: true,
        loadingText: 'Збереження...'
      },
      slots: {
        default: 'Зберегти'
      }
    });

    expect(wrapper.classes()).toContain('is-loading');
    expect(wrapper.find('.button-spinner').exists()).toBe(true);
    expect(wrapper.text()).toContain('Збереження...');

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('prevents default event when disabled or loading', async () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true }
    });
    const event = new MouseEvent('click', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    wrapper.element.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
