import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DivinationView from '../views/DivinationView.vue'
import FortuneView from '../views/FortuneView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  { path: '/divination', name: 'divination', component: DivinationView, meta: { title: '问卦' } },
  { path: '/fortune', name: 'fortune', component: FortuneView, meta: { title: '运势' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { title: '我的' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
