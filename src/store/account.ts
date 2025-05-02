import { merge, pick } from 'es-toolkit'

import {
  type Account,
  type AccountDTO,
  AssetsAccount,
  CreditAccount,
  DB,
} from '../database/index.ts'

import type { DistributedOmit, SetRequired } from 'type-fest'

function buildAccount(options: AccountDTO) {
  switch (options.type) {
    case '资产': { return new AssetsAccount(options) }
    case '信贷': { return new CreditAccount(options) }
    default: { const never: never = options; return never }
  }
}

export const useAccountStore = defineStore('account', () => {
  const list = ref<Account[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id, item])))

  async function loadAccounts() {
    list.value = (await DB.getAll('account')).map((item) => buildAccount(item))
  }

  async function createAccount(options: DistributedOmit<AccountDTO, 'id' | 'createTime'>) {
    const transaction = DB.transaction('account', 'readwrite')
    const store = transaction.objectStore('account')
    const id = await store.add({} as any)
    const account = buildAccount({ ...options, id, createTime: Date.now() })
    await store.put(account.structured())
    list.value.push(account)
    return account
  }

  function deleteAccount(id: Account['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      return DB.delete('account', id)
    }
  }

  function updateAccount(options: SetRequired<Partial<AccountDTO>, 'id' | 'type'>) {
    const account = map.value.get(options.id)
    if (!account) return
    if (account.type === '信贷' && options.type === '信贷') {
      merge(account, pick(options, ['name', 'debt', 'limit', 'note']))
    }
    if (account.type === '资产' && options.type === '资产') {
      merge(account, pick(options, ['name', 'balance', 'note']))
    }
    return DB.put('account', account.structured())
  }

  return { list, map, createAccount, deleteAccount, updateAccount, loadAccounts }
})
