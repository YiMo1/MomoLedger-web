import {
  type Account,
  type AccountDTO,
  AssetsAccount,
  CreditAccount,
  DB,
} from '../database/index.ts'

import type { DistributedOmit } from 'type-fest'

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
    const id = await DB.add('account', options as AccountDTO)
    const account = buildAccount({ ...options, id, createTime: Date.now() })
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

  function updateAccount(data: Account) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      list.value[index] = data
      return DB.put('account', data.structured())
    }
  }

  return { list, map, createAccount, deleteAccount, updateAccount, loadAccounts }
})
