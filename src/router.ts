import { createRouter, createWebHistory } from 'vue-router'

import CreateAccount from './view/CreateAccount.vue'
import Home from './view/home/Index.vue'
import CreateBill from './view/create-bill/Index.vue'
import AccountDetail from './view/AccountDetail.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/create_account', component: CreateAccount },
    { path: '/create_bill', component: CreateBill },
    {
      path: '/account_detail/:id',
      component: AccountDetail,
      beforeEnter(to) {
        const id = parseInt(Array.isArray(to.params.id) ? to.params.id[0] : to.params.id)
        if (isNaN(id)) return '/'
      },
    },
  ],
})
