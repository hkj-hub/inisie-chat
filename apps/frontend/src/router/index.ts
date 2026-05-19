import { createRouter, createWebHistory } from 'vue-router'
import EntrancePage from '../features/entrance/EntrancePage.vue'
import ChatPage from '../features/chat/ChatPage.vue'
import LogPage from '../features/log/LogPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: EntrancePage,
    },
    {
      path: '/chat',
      component: ChatPage,
    },
    {
      path: '/log',
      component: LogPage,
    },
  ],
})

export default router
