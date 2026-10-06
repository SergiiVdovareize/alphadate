import { describe, it, expect, beforeEach } from 'vitest';
import { syncDocumentSeo } from './seo';
import { APP_SEO } from '../constants/seo';

describe('syncDocumentSeo', () => {
  beforeEach(() => {
    // Reset head elements
    document.title = '';
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach((tag) => tag.remove());
  });

  it('sets document.title to APP_SEO.TITLE for any route', () => {
    syncDocumentSeo(false);
    expect(document.title).toBe(APP_SEO.TITLE);

    document.title = 'Some other title';
    syncDocumentSeo(true);
    expect(document.title).toBe(APP_SEO.TITLE);
  });

  it('creates and maintains description meta tag with APP_SEO.DESCRIPTION', () => {
    syncDocumentSeo(false);
    const descTag = document.querySelector('meta[name="description"]');
    expect(descTag).not.toBeNull();
    expect(descTag?.getAttribute('content')).toBe(APP_SEO.DESCRIPTION);

    syncDocumentSeo(true);
    expect(descTag?.getAttribute('content')).toBe(APP_SEO.DESCRIPTION);
  });

  it('sets robots and googlebot to "index, follow" when isNoindex is false', () => {
    syncDocumentSeo(false);
    const robotsTag = document.querySelector('meta[name="robots"]');
    const googlebotTag = document.querySelector('meta[name="googlebot"]');

    expect(robotsTag?.getAttribute('content')).toBe('index, follow');
    expect(googlebotTag?.getAttribute('content')).toBe('index, follow');
  });

  it('sets robots and googlebot to "noindex, nofollow" when isNoindex is true', () => {
    syncDocumentSeo(true);
    const robotsTag = document.querySelector('meta[name="robots"]');
    const googlebotTag = document.querySelector('meta[name="googlebot"]');

    expect(robotsTag?.getAttribute('content')).toBe('noindex, nofollow');
    expect(googlebotTag?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('updates existing meta tags rather than duplicating them', () => {
    syncDocumentSeo(false);
    expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="googlebot"]')).toHaveLength(1);

    syncDocumentSeo(true);
    expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="googlebot"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow'
    );
  });
});
