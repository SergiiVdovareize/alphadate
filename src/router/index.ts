import { createRouter, createWebHashHistory } from 'vue-router';

// We use WebHashHistory for GitHub Pages compatibility without complex server rewriting.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/Home.vue')
    },
    {
      path: '/:id',
      name: 'board',
      component: () => import('../pages/Board.vue')
    }
  ]
});

export default router;
