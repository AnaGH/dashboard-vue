import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: { name: 'dashboard' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Production Dashboard' },
  },
  {
    path: '/warehouse',
    name: 'warehouse',
    component: () => import('@/views/WarehouseView.vue'),
    meta: { title: 'Warehouse' },
  },
  {
    path: '/quality-control',
    name: 'quality-control',
    component: () => import('@/views/QualityView.vue'),
    meta: { title: 'Quality Control' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
] satisfies RouteRecordRaw[]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
