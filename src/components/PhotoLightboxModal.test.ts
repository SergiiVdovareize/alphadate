import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import PhotoLightboxModal from './PhotoLightboxModal.vue';
import { _resetBodyScrollLockForTesting } from '../composables/useBodyScrollLock';

describe('PhotoLightboxModal.vue', () => {
  beforeEach(() => {
    _resetBodyScrollLockForTesting();
  });

  afterEach(() => {
    _resetBodyScrollLockForTesting();
  });

  it('does not render when photo prop is null', () => {
    const wrapper = mount(PhotoLightboxModal, {
      props: {
        photo: null
      }
    });

    expect(wrapper.find('.lightbox-overlay').exists()).toBe(false);
  });

  it('renders photo and alt text when photo prop is provided', () => {
    const wrapper = mount(PhotoLightboxModal, {
      props: {
        photo: {
          src: 'https://example.com/test.webp',
          alt: 'Тестове фото'
        }
      },
      attachTo: document.body
    });

    const overlay = document.body.querySelector('.lightbox-overlay');
    expect(overlay).toBeTruthy();

    const img = document.body.querySelector('.lightbox-img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/test.webp');
    expect(img.getAttribute('alt')).toBe('Тестове фото');

    wrapper.unmount();
  });

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(PhotoLightboxModal, {
      props: {
        photo: {
          src: 'https://example.com/test.webp',
          alt: 'Тестове фото'
        }
      },
      attachTo: document.body
    });

    const closeBtn = document.body.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')!.length).toBe(1);

    wrapper.unmount();
  });

  it('emits close event when backdrop is clicked', async () => {
    const wrapper = mount(PhotoLightboxModal, {
      props: {
        photo: {
          src: 'https://example.com/test.webp'
        }
      },
      attachTo: document.body
    });

    const backdrop = document.body.querySelector('.lightbox-backdrop') as HTMLButtonElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();

    expect(wrapper.emitted('close')).toBeTruthy();

    wrapper.unmount();
  });

  it('emits close on Escape keydown', async () => {
    const wrapper = mount(PhotoLightboxModal, {
      props: {
        photo: {
          src: 'https://example.com/test.webp'
        }
      },
      attachTo: document.body
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(wrapper.emitted('close')).toBeTruthy();

    wrapper.unmount();
  });
});
