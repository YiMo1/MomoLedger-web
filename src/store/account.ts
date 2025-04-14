import { type Account, openDB } from '../utils/database.ts'

const DB = await openDB()

async function initAccountData(ref: Ref<Account[]>) {
  const data = await DB.getAll('account')
  ref.value = data
}

export const useAccountStore = defineStore('account', () => {
  const account = ref<Account[]>([])
  initAccountData(account)

  async function createAccount(data: Omit<Account, 'id'>) {
    const id = await DB.add('account', data)
    account.value.push({ ...data, id })
    return id
  }

  async function deleteAccount(id: Account['id']) {
    const index = account.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      account.value.splice(index, 1)
      return DB.delete('account', id)
    }
  }

  async function updateAccount(data: Omit<Account, 'id'> & { id: Account['id'] }) {
    const index = account.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const target = { ...account.value[index], ...data }
      account.value[index] = target
      return DB.put('account', target, target.id)
    }
  }

  return { account, createAccount, deleteAccount, updateAccount }
})
