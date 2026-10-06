import { APP_SEO } from '../constants/seo';

export function syncDocumentSeo(isNoindex: boolean): void {
  if (typeof document === 'undefined') return;

  // Title remains identical for every route
  document.title = APP_SEO.TITLE;

  // Description remains identical for every route
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', APP_SEO.DESCRIPTION);

  // Search engines indexing rules
  const robotsContent = isNoindex ? 'noindex, nofollow' : 'index, follow';

  let robotsTag = document.querySelector('meta[name="robots"]');
  if (!robotsTag) {
    robotsTag = document.createElement('meta');
    robotsTag.setAttribute('name', 'robots');
    document.head.appendChild(robotsTag);
  }
  robotsTag.setAttribute('content', robotsContent);

  let googlebotTag = document.querySelector('meta[name="googlebot"]');
  if (!googlebotTag) {
    googlebotTag = document.createElement('meta');
    googlebotTag.setAttribute('name', 'googlebot');
    document.head.appendChild(googlebotTag);
  }
  googlebotTag.setAttribute('content', robotsContent);
}
