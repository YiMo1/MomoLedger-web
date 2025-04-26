import dayjs from 'dayjs'
import { sortedIndexBy } from 'es-toolkit/compat'

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

export const useLedgerRecordStore = defineStore('ledger-record', () => {
  const { map: category } = storeToRefs(useCategoryStore())
  const { map: account } = storeToRefs(useAccountStore())

  const list = ref<LedgerRecord[]>([])

  async function loadLedgerRecord() {
    const transaction = DB.transaction('ledger-record', 'readonly')
    const store = transaction.objectStore('ledger-record')
    const index = store.index('idx_statementDate')
    let cursor = await index.openCursor(null, 'prev')
    while (cursor) {
      list.value.push(normalizeLedgerRecord(cursor.value))
      cursor = await cursor.continue()
    }
  }

  function normalizeLedgerRecord(raw: RawLedgerRecord): LedgerRecord {
    return {
      ...raw,
      category: category.value.get(raw.category!),
      paymentAccount: account.value.get(raw.paymentAccount!),
      receivingAccount: account.value.get(raw.receivingAccount!),
      statementDate: dayjs(raw.statementDate),
    }
  }

  async function createLedgerRecord(data: Omit<RawLedgerRecord, 'id'>) {
    const promises: Promise<number>[] = []
    const transaction = DB.transaction(['ledger-record', 'account'], 'readwrite')
    promises.push(transaction.objectStore('ledger-record').add(data))
    const type = data.type!
    switch (type) {
      case '支出': {
        const paymentAccount = account.value.get(data.paymentAccount!)!
        paymentAccount.expenses(data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(paymentAccount.structured()))
        break
      }
      case '收入': {
        const receivingAccount = account.value.get(data.receivingAccount!)!
        receivingAccount.income(data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(receivingAccount.structured()))
        break
      }
      case '转账': {
        const paymentAccount = account.value.get(data.paymentAccount!)!
        paymentAccount.expenses(data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(paymentAccount.structured()))
        const receivingAccount = account.value.get(data.receivingAccount!)!
        receivingAccount.income(data.expenses ?? 0)
        promises.push(transaction.objectStore('account').put(receivingAccount.structured()))
        break
      }
      default: { const _: never = type }
    }
    await transaction.done
    const record = normalizeLedgerRecord({ ...data, id: await promises[0]! })
    const index = sortedIndexBy(
      list.value,
      record,
      (item) => -item.statementDate!.valueOf(),
      false,
    )
    list.value.splice(index, 0, record)
    return record.id!
  }

  async function deleteLedgerRecord(id: NonNullable<RawLedgerRecord['id']>) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      const record = list.value[index]
      list.value.splice(index, 1)
      const transaction = DB.transaction(['ledger-record', 'account'], 'readwrite')
      transaction.objectStore('ledger-record').delete(record.id!)
      const type = record.type!
      switch (type) {
        case '支出': {
          record.paymentAccount?.income(record.expenses ?? 0)
          transaction.objectStore('account').put(record.paymentAccount!.structured())
          break
        }
        case '收入': {
          record.receivingAccount?.expenses(record.expenses ?? 0)
          transaction.objectStore('account').put(record.receivingAccount!.structured())
          break
        }
        case '转账': {
          record.paymentAccount?.income(record.expenses ?? 0)
          transaction.objectStore('account').put(record.paymentAccount!.structured())
          record.receivingAccount?.expenses(record.expenses ?? 0)
          transaction.objectStore('account').put(record.receivingAccount!.structured())
          break
        }
        default: { const _: never = type }
      }
      return transaction.done
    }
  }

  async function updateLedgerRecord(data: Omit<RawLedgerRecord, 'id'> &
    { id: RawLedgerRecord['id'] }) {
    const index = list.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      list.value[index] = normalizeLedgerRecord(data)
      return DB.put('ledger-record', data)
    }
  }

  return {
    createLedgerRecord,
    deleteLedgerRecord,
    updateLedgerRecord,
    list,
    loadLedgerRecord,
    normalizeLedgerRecord,
  }
})
