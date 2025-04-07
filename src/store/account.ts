import { useDatabaseStore } from './database.ts'

import type { Account } from '../types/index.ts'

export const useAccountStore = defineStore('account', () => {
  const account = ref<Account[]>([])
  const { database } = storeToRefs(useDatabaseStore())

  database.value.then((res) => {
    res.getAll('account').then((res) => {
      account.value = res as Account[]
    })
  })

  async function createAccount(data: Omit<Account, 'id'>) {
    const db = await database.value
    const id = await db.add('account', data)
    account.value.push({ id, ...data })
    return id
  }

  return { account, createAccount }
})
