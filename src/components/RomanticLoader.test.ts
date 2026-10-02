import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RomanticLoader from './RomanticLoader.vue';

describe('RomanticLoader.vue', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('does not render when visible is false', () => {
    const wrapper = mount(RomanticLoader, {
      props: { visible: false }
    });
    expect(wrapper.find('.romantic-loader-overlay').exists()).toBe(false);
  });

  it('renders with default texts when visible is true', () => {
    const wrapper = mount(RomanticLoader, {
      props: { visible: true }
    });
    expect(wrapper.find('.romantic-loader-overlay').exists()).toBe(true);
    expect(wrapper.find('.loader-title').text()).toBe('Зберігаємо побачення... 💕');
    expect(wrapper.find('.loader-submessage').text()).toBe(
      'Синхронізуємо ваші спогади з сервером...'
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('renders custom message and submessage when provided', () => {
    const wrapper = mount(RomanticLoader, {
      props: {
        visible: true,
        message: 'Оновлюємо дошку... ✨',
        submessage: 'Зачекайте декілька секунд'
      }
    });
    expect(wrapper.find('.loader-title').text()).toBe('Оновлюємо дошку... ✨');
    expect(wrapper.find('.loader-submessage').text()).toBe('Зачекайте декілька секунд');
  });

  it('restores body overflow when visibility changes from true to false', async () => {
    const wrapper = mount(RomanticLoader, {
      props: { visible: true }
    });
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ visible: false });
    expect(document.body.style.overflow).toBe('');
  });
});
