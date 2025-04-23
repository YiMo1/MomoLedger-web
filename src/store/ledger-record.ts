import dayjs from 'dayjs'

import {
  type Account,
  type Category,
  DB,
  type LedgerRecord as RawLedgerRecord,
} from '../database/index.ts'
import { useCategoryStore } from './category.ts'
import { useAccountStore } from './account.ts'

export type LedgerRecord = Omit<
  RawLedgerRecord, 'paymentAccount' | 'category' | 'receivingAccount' | 'statementDate'
> & {
  paymentAccount?: Account
  receivingAccount?: Account
  category?: Category
  statementDate?: dayjs.Dayjs
}

async function queryAll() {
  const transaction = DB.transaction('ledger-record', 'readonly')
  const store = transaction.objectStore('ledger-record')
  const index = store.index('idx_statementDate')
  const results: RawLedgerRecord[] = []
  let cursor = await index.openCursor(null, 'prev')
  while (cursor) {
    results.push(cursor.value)
    cursor = await cursor.continue()
  }
  return results
}

const records = await queryAll()

export const useLedgerRecordStore = defineStore('ledger-record', () => {
  const { map: category } = storeToRefs(useCategoryStore())
  const accountStore = useAccountStore()

  const rawList = ref(records)
  const list = computed(() => rawList.value.map<LedgerRecord>((item) => {
    return {
      ...item, category:
      category.value.get(item.category!),
      paymentAccount: accountStore.map.get(item.paymentAccount!),
      receivingAccount: accountStore.map.get(item.receivingAccount!),
      statementDate: dayjs(item.statementDate),
    }
  }))

  async function createLedgerRecord(data: Omit<RawLedgerRecord, 'id'>) {
    const promises: Promise<number>[] = []
    const transaction = DB.transaction(['ledger-record', 'account'], 'readwrite')
    promises.push(transaction.objectStore('ledger-record').add(data))
    const type = data.type!
    switch (type) {
      case '支出': {
        const paymentAccount = accountStore.map.get(data.paymentAccount!)!
        accountStore.transaction(paymentAccount, -(data.expenses ?? 0))
        promises.push(transaction.objectStore('account').put(toRaw(paymentAccount)))
        break
      }
      case '收入': {
        const receivingAccount = accountStore.map.get(data.receivingAccount!)!
        accountStore.transaction(receivingAccount, data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(toRaw(receivingAccount)))
        break
      }
      case '转账': {
        const paymentAccount = accountStore.map.get(data.paymentAccount!)!
        accountStore.transaction(paymentAccount, -(data.expenses ?? 0))
        promises.push(transaction.objectStore('account').put(toRaw(paymentAccount)))
        const receivingAccount = accountStore.map.get(data.receivingAccount!)!
        accountStore.transaction(receivingAccount, data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(toRaw(receivingAccount)))
        break
      }
      default: { const _: never = type }
    }
    const [id] = await Promise.all([...promises, transaction.done])
    rawList.value.push({ ...data, id: id! })
    return id
  }

  async function deleteLedgerRecord(id: NonNullable<RawLedgerRecord['id']>) {
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
