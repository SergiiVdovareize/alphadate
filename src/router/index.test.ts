import { describe, it, expect, beforeEach } from 'vitest';
import router from './index';
import { APP_SEO } from '../constants/seo';

describe('Router SEO and indexing guards', () => {
  beforeEach(async () => {
    // Reset router state and meta
    await router.push('/');
    await router.isReady();
  });

  it('keeps document.title identical on home route and sets index, follow', async () => {
    await router.push('/');
    await router.isReady();

    expect(document.title).toBe(APP_SEO.TITLE);
    const robotsTag = document.querySelector('meta[name="robots"]');
    expect(robotsTag?.getAttribute('content')).toBe('index, follow');
  });

  it('sets noindex, nofollow on specific board route while keeping identical title', async () => {
    await router.push('/secret-board-key');
    await router.isReady();

    expect(document.title).toBe(APP_SEO.TITLE);
    const robotsTag = document.querySelector('meta[name="robots"]');
    expect(robotsTag?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('sets noindex, nofollow on board memories route while keeping identical title', async () => {
    await router.push('/secret-board-key/memories');
    await router.isReady();

    expect(document.title).toBe(APP_SEO.TITLE);
    const robotsTag = document.querySelector('meta[name="robots"]');
    expect(robotsTag?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('sets noindex, nofollow on recover route while keeping identical title', async () => {
    await router.push('/recover');
    await router.isReady();

    expect(document.title).toBe(APP_SEO.TITLE);
    const robotsTag = document.querySelector('meta[name="robots"]');
    expect(robotsTag?.getAttribute('content')).toBe('noindex, nofollow');
  });
});
