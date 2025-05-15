import { merge, pick } from 'es-toolkit'

import { emitter } from '@/utils/index.ts'
import {
  type Account,
  type AccountDTO,
  AssetsAccount,
  CreditAccount,
  DB,
} from '../database/index.ts'
import { deleteAccount as deleteAccountAPI } from '@/api/index.ts'

import type { DistributedOmit, SetRequired } from 'type-fest'

function buildAccount(options: AccountDTO) {
  switch (options.type) {
    case '资产': { return new AssetsAccount(options) }
    case '信贷': { return new CreditAccount(options) }
    default: { const never: never = options; return never }
  }
}

export const useAccountStore = defineStore('account', () => {
  const map = ref(new Map<Account['id'], Account>())

  async function loadAccounts() {
    if (map.value.size > 0) { map.value.clear() }
    const list = await DB.getAll('account')
    for (const item of list) {
      map.value.set(item.id, buildAccount(item))
    }
  }

  async function createAccount(options: DistributedOmit<AccountDTO, 'id' | 'createTime'>) {
    const transaction = DB.transaction('account', 'readwrite')
    const store = transaction.objectStore('account')
    const id = await store.add({} as any)
    const account = buildAccount({ ...options, id, createTime: Date.now() })
    await store.put(account.structured())
    map.value.set(account.id, account)
    emitter.emit('create-account')
    return account
  }

  async function deleteAccount(id: Account['id']) {
    await deleteAccountAPI(id)
    await loadAccounts()
    emitter.emit('delete-account')
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

  return { map, createAccount, deleteAccount, updateAccount, loadAccounts }
})
