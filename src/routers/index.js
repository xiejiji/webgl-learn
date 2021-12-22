import {
  createRouter,
  createWebHistory
} from 'vue-router';
const routes = [
  {
    path: '/',
    component: () => import('@/views/home.vue'),
    children: [
      {
        path: 'drawCircle',
        name: 'drawCircle',
        component: () => import('@/views/learn1/draw-circle.vue')
      }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});
export default router;