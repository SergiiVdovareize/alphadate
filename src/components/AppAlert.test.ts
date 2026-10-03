import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppAlert from './AppAlert.vue';

describe('AppAlert.vue', () => {
  it('renders message prop by default as error', () => {
    const wrapper = mount(AppAlert, {
      props: {
        message: 'Сталася помилка'
      }
    });

    expect(wrapper.text()).toBe('Сталася помилка');
    expect(wrapper.classes()).toContain('is-error');
    expect(wrapper.attributes('role')).toBe('alert');
  });

  it('renders slot content when provided', () => {
    const wrapper = mount(AppAlert, {
      props: {
        type: 'success'
      },
      slots: {
        default: '<span>Успішно збережено!</span>'
      }
    });

    expect(wrapper.find('span').text()).toBe('Успішно збережено!');
    expect(wrapper.classes()).toContain('is-success');
  });

  it('supports info and warning types', () => {
    const infoWrapper = mount(AppAlert, {
      props: { message: 'Інформація', type: 'info' }
    });
    expect(infoWrapper.classes()).toContain('is-info');

    const warningWrapper = mount(AppAlert, {
      props: { message: 'Попередження', type: 'warning' }
    });
    expect(warningWrapper.classes()).toContain('is-warning');
  });
});
