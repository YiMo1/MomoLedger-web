import {
  deleteAccount as deleteAccountAPI,
  insertAccount,
  queryAllAccount,
  updateAccount as updateAccountAPI,
} from '@/api/index.ts'
import { useAssetsStore } from './assets.ts'
import { useBillStore } from './bill.ts'

import type { Account, AccountDTO } from '../database/index.ts'
import type { DistributedOmit, SetRequired } from 'type-fest'

export const useAccountStore = defineStore('account', () => {
  const list = ref<Account[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id, item])))

  async function loadAccounts() {
    list.value = await queryAllAccount()
  }

  async function createAccount(data: DistributedOmit<AccountDTO, 'id' | 'createTime'>) {
    const newAccount = await insertAccount(data)
    list.value.push(newAccount)
    useAssetsStore().refresh()
    return newAccount
  }

  async function deleteAccount(id: Account['id']) {
    await deleteAccountAPI(id)
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) list.value.splice(index, 1)
    useAssetsStore().refresh()
    useBillStore().loadBill()
  }

  async function updateAccount(data: SetRequired<Partial<AccountDTO>, 'id' | 'type'>) {
    const updated = await updateAccountAPI(data)
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) list.value.splice(index, 1, updated)
    useAssetsStore().refresh()
    return updated
  }

  return { list, map, createAccount, deleteAccount, updateAccount, loadAccounts }
})
