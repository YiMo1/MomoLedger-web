import { createRouter, createWebHistory } from 'vue-router'

import CreateAccount from './view/CreateAccount.vue'
import Home from './view/home/Index.vue'
import CreateRecord from './view/create-record/Index.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/create_account', component: CreateAccount },
    { path: '/create_record', component: CreateRecord },
  ],
})
