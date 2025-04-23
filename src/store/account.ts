import { type Account, DB } from '../database/index.ts'

export const useAccountStore = defineStore('account', () => {
  const isLoaded = ref(false)
  const list = ref<Account[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id, item])))

  async function loadAccounts() {
    if (isLoaded.value) return
    isLoaded.value = true
    list.value = await DB.getAll('account')
  }

  async function createAccount(data: DistributiveOmit<Account, 'id'>) {
    const id = await DB.add('account', data as Account)
    list.value.push({ ...data, id })
    return id
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
      return DB.put('account', data)
    }
  }

  /**
   * 对不同类型的账户进行统一交易。
   * @param account 交易账户。
   * @param amount 交易金额，金额正数为收入，金额负数为支出。
   */
  function transaction(account: Account, amount: number) {
    switch (account.type) {
      case '信贷': { account.debt += amount; break }
      case '资产': { account.balance += amount; break }
      default: { const _: never = account }
    }
  }

  return { list, map, createAccount, deleteAccount, updateAccount, transaction, loadAccounts }
})
