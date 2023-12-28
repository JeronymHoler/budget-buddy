import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/item/Inbox'
  },
  {
    path: '/item/:id',
    component: () => import ('../views/FolderPage.vue')
  },
  {
    path: '/item/New',
    component: () => import ('../views/NewItem.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
