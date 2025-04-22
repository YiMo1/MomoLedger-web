import dayjs from 'dayjs'

import {
  type Account,
  type Category,
  type LedgerRecord as RawLedgerRecord,
  openDB,
} from '../utils/database.ts'
import { useCategoryStore } from './category.ts'
import { useAccountStore } from './account.ts'

const DB = await openDB()

export type LedgerRecord = Omit<
  RawLedgerRecord, 'paymentAccount' | 'category' | 'receivingAccount' | 'statementDate'
> & {
  paymentAccount?: Account
  receivingAccount?: Account
  category?: Category
  statementDate?: dayjs.Dayjs
}
export const useLedgerRecordStore = defineStore('ledger-record', () => {
  const { map: category } = storeToRefs(useCategoryStore())
  const { map: accountMap } = storeToRefs(useAccountStore())
  const rawList = ref<RawLedgerRecord[]>([])
  const list = computed(() => rawList.value.map<LedgerRecord>((item) => {
    return {
      ...item, category:
      category.value.get(item.category!),
      paymentAccount: accountMap.value.get(item.paymentAccount!),
      receivingAccount: accountMap.value.get(item.receivingAccount!),
      statementDate: dayjs(item.statementDate),
    }
  }))

  DB.getAll('ledger-record').then((list) => {
    rawList.value = list
  })

  async function createLedgerRecord(data: Omit<RawLedgerRecord, 'id'>) {
    const promises: Promise<number>[] = []
    const transaction = DB.transaction(['ledger-record', 'account'], 'readwrite')
    promises.push(transaction.objectStore('ledger-record').add(data))
    const type = data.type!
    switch (type) {
      case '支出': {
        const paymentAccount = accountMap.value.get(data.paymentAccount!)!
        paymentAccount.balance! -= data.expenses!
        promises.push(transaction.objectStore('account').put(toRaw(paymentAccount)))
        break
      }
      case '收入': {
        const receivingAccount = accountMap.value.get(data.receivingAccount!)!
        receivingAccount.balance! += data.expenses!
        promises.push(transaction.objectStore('account').put(toRaw(receivingAccount)))
        break
      }
      case '转账': {
        const paymentAccount = accountMap.value.get(data.paymentAccount!)!
        paymentAccount.balance! -= data.expenses!
        promises.push(transaction.objectStore('account').put(toRaw(paymentAccount)))
        const receivingAccount = accountMap.value.get(data.receivingAccount!)!
        receivingAccount.balance! += data.expenses!
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
