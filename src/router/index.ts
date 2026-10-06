import { createRouter, createWebHashHistory } from 'vue-router';
import { syncDocumentSeo } from '../utils/seo';

// We use WebHashHistory for GitHub Pages compatibility without complex server rewriting.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/Home.vue'),
      meta: { noindex: false }
    },
    {
      path: '/recover',
      name: 'recover',
      component: () => import('../pages/Recover.vue'),
      meta: { noindex: true }
    },
    {
      path: '/:id/memories',
      name: 'memories',
      component: () => import('../pages/Memories.vue'),
      meta: { noindex: true }
    },
    {
      path: '/:id',
      name: 'board',
      component: () => import('../pages/Board.vue'),
      meta: { noindex: true }
    }
  ]
});

router.afterEach((to) => {
  syncDocumentSeo(Boolean(to.meta.noindex));
});

export default router;
