import { type Account, openDB } from '../utils/database.ts'

const DB = await openDB()

export const useAccountStore = defineStore('account', () => {
  const list = ref<Account[]>([])
  const map = computed(() => new Map(list.value.map((item) => [item.id!, item])))

  DB.getAll('account').then((data) => {
    list.value = data
  })

  async function createAccount(data: Omit<Account, 'id'>) {
    const id = await DB.add('account', data)
    list.value.push({ ...data, id })
    return id
  }

  async function deleteAccount(id: Account['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      return DB.delete('account', id)
    }
  }

  async function updateAccount(data: Omit<Account, 'id'> & { id: Account['id'] }) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const target = { ...list.value[index], ...data }
      list.value[index] = target
      return DB.put('account', target, target.id)
    }
  }

  return { list, map, createAccount, deleteAccount, updateAccount }
})
