import {
  type Account,
  type Category,
  type LedgerRecord as RawLedgerRecord,
  openDB,
} from '../utils/database.ts'
import { useCategoryStore } from './category.ts'
import { useAccountStore } from './account.ts'

const DB = await openDB()

export type LedgerRecord = Omit<RawLedgerRecord, 'account' | 'category'> & {
  account?: Account
  category?: Category
}
export const useLedgerRecordStore = defineStore('ledger-record', () => {
  const { map: category } = storeToRefs(useCategoryStore())
  const { map: account } = storeToRefs(useAccountStore())
  const rawList = ref<RawLedgerRecord[]>([])
  const list = computed(() => rawList.value.map<LedgerRecord>((item) => {
    return {
      ...item, category:
      category.value.get(item.category!),
      account: account.value.get(item.account!),
    }
  }))

  DB.getAll('ledger-record').then((list) => {
    rawList.value = list
  })

  async function createLedgerRecord(data: Omit<RawLedgerRecord, 'id'>) {
    const id = await DB.add('ledger-record', data)
    rawList.value.push({ ...data, id })
    return id
  }

  async function deleteLedgerRecord(id: RawLedgerRecord['id']) {
    const index = rawList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      rawList.value.splice(index, 1)
      return DB.delete('ledger-record', id)
    }
  }

  async function updateLedgerRecord(data: Omit<RawLedgerRecord, 'id'> &
    { id: RawLedgerRecord['id'] }) {
    const index = rawList.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const target = { ...rawList.value[index], ...data }
      rawList.value[index] = target
      return DB.put('ledger-record', target, target.id)
    }
  }

  return { rawList, createLedgerRecord, deleteLedgerRecord, updateLedgerRecord, list }
})
