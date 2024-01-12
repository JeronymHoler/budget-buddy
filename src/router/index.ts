import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '',
        redirect: '/Home'
    },
    {
        path: '/Home',
        component: () => import ('../views/Home.vue')
    },
    {
        path: '/item/:id',
        component: () => import ('../views/ItemDetail.vue')
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
