import { sortedIndexBy } from 'es-toolkit/compat'

import {
  type Bill,
  type BillDTO,
  DB,
  ExpensesBill,
  IncomeBill,
  TransferBill,
} from '../database/index.ts'
import { useCategoryStore } from './category.ts'
import { useAccountStore } from './account.ts'

import type { DistributedOmit } from 'type-fest'

export const useBillStore = defineStore('bill', () => {
  const { map: category } = storeToRefs(useCategoryStore())
  const { map: account } = storeToRefs(useAccountStore())

  const list = ref<Bill[]>([])

  async function loadBill() {
    const transaction = DB.transaction('bill', 'readonly')
    const store = transaction.objectStore('bill')
    const index = store.index('idx_billTime')
    let cursor = await index.openCursor(null, 'prev')
    while (cursor) {
      list.value.push(buildBill(cursor.value))
      cursor = await cursor.continue()
    }
  }

  function buildBill(options: BillDTO) {
    switch (options.type) {
      case '支出': {
        return new ExpensesBill({
          ...options,
          account: account.value.get(options.account)!,
          category: category.value.get(options.category)!,
        })
      }
      case '收入': {
        return new IncomeBill({
          ...options,
          account: account.value.get(options.account)!,
          category: category.value.get(options.category)!,
        })
      }
      case '转账': {
        return new TransferBill({
          ...options,
          paymentAccount: account.value.get(options.paymentAccount)!,
          receivingAccount: account.value.get(options.receivingAccount)!,
          category: category.value.get(options.category)!,
        })
      }
      default: { const never: never = options; return never }
    }
  }

  async function createLedgerRecord(options: DistributedOmit<BillDTO, 'id' | 'createTime'>) {
    const transaction = DB.transaction(['bill', 'account'], 'readwrite')
    const id = await transaction.objectStore('bill').add(options as BillDTO)
    const bill = buildBill({ ...options, id, createTime: Date.now() })
    bill.execute(transaction.objectStore('account'))
    await transaction.done
    const index = sortedIndexBy(
      list.value,
      bill,
      (item) => -item.billTime.valueOf(),
      false,
    )
    list.value.splice(index, 0, bill)
    return bill
  }

  async function deleteLedgerRecord(id: BillDTO['id']) {
    const index = list.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      const bill = list.value[index]
      list.value.splice(index, 1)
      const transaction = DB.transaction(['bill', 'account'], 'readwrite')
      transaction.objectStore('bill').delete(bill.id)
      bill.rollBack(transaction.objectStore('account'))
      return transaction.done
    }
  }

  async function updateLedgerRecord(bill: Bill) {
    const index = list.value.findIndex((item) => item.id === bill.id)
    if (index !== -1) {
      list.value[index] = bill
      return DB.put('bill', bill.structured())
    }
  }

  return {
    createLedgerRecord,
    deleteLedgerRecord,
    updateLedgerRecord,
    list,
    loadBill,
  }
})
