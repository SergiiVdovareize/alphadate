import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppLogo from './AppLogo.vue';

describe('AppLogo.vue', () => {
  it('renders default logo with 40px height', () => {
    const wrapper = mount(AppLogo);
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('AlphaDate Logo');
    expect(img.attributes('style')).toContain('height: 40px;');
  });

  it('renders custom size when prop is provided', () => {
    const wrapper = mount(AppLogo, {
      props: { size: 64 }
    });
    const img = wrapper.find('img');
    expect(img.attributes('style')).toContain('height: 64px;');
  });
});
