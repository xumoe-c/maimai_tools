import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/generator/preference-table',
            name: 'preference-table',
            component: () => import('../views/GeneratorView.vue')
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue')
        },
        {
            path: '/music',
            name: 'music',
            component: () => import('../views/MusicView.vue')
        },
        {
            path: '/b50',
            name: 'b50',
            component: () => import('../views/B50View.vue')
        },
        {
            path: '/song/:id',
            name: 'song-detail',
            component: () => import('../views/SongDetailView.vue')
        }
    ]
})

export default router
