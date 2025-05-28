import { createRouter, createWebHistory } from 'vue-router'
import { toNumber } from 'es-toolkit/compat'

import { useAccountStore, useBillStore } from './store/index.ts'
import CreateAccount from './view/CreateAccount.vue'
import Home from './view/home/Index.vue'
import CreateBill from './view/create-bill/CreateBillView.vue'
import AccountDetail from './view/AccountDetail.vue'
import AccountEdit from './view/AccountEdit.vue'
import EditTransferBill from './view/EditTransferBill.vue'
import BillDetail from './view/BillDetail.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    {
      path: '/account/create',
      component: CreateAccount,
      props(to) {
        const type = to.query.type
        return { type }
      },
    },
    { path: '/create_bill', component: CreateBill },
    {
      path: '/account/detail/:id',
      component: AccountDetail,
      props({ params }) {
        return { id: toNumber(params.id) }
      },
    },
    {
      path: '/account/edit/:id',
      component: AccountEdit,
      beforeEnter(to) {
        if (!useAccountStore().map.has(Number(to.params.id))) return '/'
      },
    },
    {
      path: '/edit_transfer_bill/:id',
      component: EditTransferBill,
      beforeEnter(to) {
        if (!useBillStore().map.has(Number(to.params.id))) return '/'
      },
    },
    { path: '/bill/detail/:id', component: BillDetail },
  ],
})
