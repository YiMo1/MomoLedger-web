import { pick } from 'es-toolkit'

import { dayjs } from '@/utils/index.ts'

import type { Account } from './account.ts'
import type { Category } from '../index.ts'
import type { Data, Store } from '../utils.ts'

interface BillOptions {
  id: number
  note?: string
  createTime?: dayjs.ConfigType
  billTime: dayjs.ConfigType
  amount: number
  category: Category
}

abstract class Bill implements Data {
  readonly id: number
  note?: string
  amount: number
  billTime: dayjs.Dayjs
  createTime: dayjs.Dayjs
  category: Category
  abstract type: '支出' | '收入' | '转账'

  constructor({ amount, createTime, id, note, billTime, category }: BillOptions) {
    this.id = id
    this.note = note
    this.amount = amount
    this.category = category
    this.createTime = dayjs(createTime)
    this.billTime = dayjs(billTime)
  }

  structured() {
    const { billTime, createTime, category } = this
    return {
      ...pick(this, ['id', 'note', 'amount', 'type']),
      billTime: billTime.valueOf(),
      createTime: createTime.valueOf(),
      category: category.id!,
    }
  }
  abstract rollBack(store: Store<'account', 'readwrite'>): void
  abstract execute(store: Store<'account', 'readwrite'>): void
}

interface ExpensesBillOptions extends BillOptions {
  account: Account
  discount: number
}

export class ExpensesBill extends Bill {
  account: Account
  readonly type = '支出'
  discount: number

  constructor({ account, discount, ...superOptions }: ExpensesBillOptions) {
    super(superOptions)
    this.account = account
    this.discount = discount
  }

  structured() {
    const { account } = this
    return {
      ...super.structured(),
      ...pick(this, ['discount']),
      account: account.id,
    }
  }

  rollBack(store: Store<'account', 'readwrite'>) {
    this.account.income(this.amount)
    store.put(this.account.serialize())
  }

  execute(store: Store<'account', 'readwrite'>) {
    this.account.expense(this.amount)
    store.put(this.account.serialize())
  }
}

interface IncomeBillOptions extends BillOptions {
  account: Account
  commission: number
}

export class IncomeBill extends Bill {
  account: Account
  readonly type = '收入'
  commission: number

  constructor({ account, commission, ...superOptions }: IncomeBillOptions) {
    super(superOptions)
    this.account = account
    this.commission = commission
  }

  structured() {
    const { account } = this
    return {
      ...super.structured(),
      ...pick(this, ['commission']),
      account: account.id,
    }
  }

  rollBack(store: Store<'account', 'readwrite'>) {
    this.account.expense(this.amount)
    store.put(this.account.serialize())
  }

  execute(store: Store<'account', 'readwrite'>) {
    this.account.income(this.amount)
    store.put(this.account.serialize())
  }
}

interface TransferBillOptions extends BillOptions {
  paymentAccount: Account
  receivingAccount: Account
  commission: number
}

export class TransferBill extends Bill {
  paymentAccount: Account
  receivingAccount: Account
  readonly type = '转账'
  commission: number

  constructor({ paymentAccount, receivingAccount, commission, ...superOptions }:
  TransferBillOptions) {
    super(superOptions)
    this.paymentAccount = paymentAccount
    this.receivingAccount = receivingAccount
    this.commission = commission
  }

  structured() {
    const { paymentAccount, receivingAccount } = this
    return {
      ...super.structured(),
      ...pick(this, ['commission']),
      paymentAccount: paymentAccount.id,
      receivingAccount: receivingAccount.id,
    }
  }

  rollBack(store: Store<'account', 'readwrite'>) {
    this.paymentAccount.income(this.amount)
    this.receivingAccount.expense(this.amount)
    store.put(this.paymentAccount.serialize())
    store.put(this.receivingAccount.serialize())
  }

  execute(store: Store<'account', 'readwrite'>) {
    this.paymentAccount.expense(this.amount)
    this.receivingAccount.income(this.amount)
    store.put(this.paymentAccount.serialize())
    store.put(this.receivingAccount.serialize())
  }
}

type BillType = ExpensesBill | IncomeBill | TransferBill
export type { BillType as Bill }
export type BillDTO = ReturnType<BillType['structured']>
