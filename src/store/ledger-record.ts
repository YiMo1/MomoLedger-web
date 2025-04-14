import { type LedgerRecord, openDB } from '../utils/database.ts'

const DB = await openDB()

async function initList(ref: Ref<LedgerRecord[]>) {
  const data = await DB.getAll('ledger-record')
  ref.value = data
}

export const useLedgerRecordStore = defineStore('ledger-record', () => {
  const list = ref<LedgerRecord[]>([])
  initList(list)

  async function createLedgerRecord(data: Omit<LedgerRecord, 'id'>) {
    const id = await DB.add('ledger-record', data)
    list.value.push({ ...data, id })
    return id
  }

  async function deleteLedgerRecord(id: LedgerRecord['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      list.value.splice(index, 1)
      return DB.delete('ledger-record', id)
    }
  }

  async function updateLedgerRecord(data: Omit<LedgerRecord, 'id'> & { id: LedgerRecord['id'] }) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      const target = { ...list.value[index], ...data }
      list.value[index] = target
      return DB.put('ledger-record', target, target.id)
    }
  }

  return { list, createLedgerRecord, deleteLedgerRecord, updateLedgerRecord }
})
