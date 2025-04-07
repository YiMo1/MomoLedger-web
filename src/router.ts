import { createRouter, createWebHistory } from 'vue-router'

import CreateAccount from './view/home/CreateAccount.vue'
import Home from './view/home/Index.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/create_account',
      component: CreateAccount,
    },
  ],
})
