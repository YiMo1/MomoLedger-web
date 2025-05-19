import { pick } from 'es-toolkit'

import type dayjs from 'dayjs'
import type { Account } from './account.ts'
import type { Category } from '../index.ts'
import type { Store } from '../utils.ts'

abstract class Bill {
  declare id: number
  declare note?: string
  declare amount: number
  declare billTime: dayjs.Dayjs
  declare createTime: dayjs.Dayjs
  declare category: Category
  declare type: '支出' | '收入' | '转账'

  serialize() {
    const { billTime, createTime, category } = this
    return {
      ...pick(this, ['id', 'note', 'amount', 'type'] satisfies (keyof Bill)[]),
      billTime: billTime.valueOf(),
      createTime: createTime.valueOf(),
      category: category.id,
    }
  }
}

export class ExpensesBill extends Bill {
  declare account: Account
  readonly type = '支出'
  declare discount: number

  get displayDiscount() { return (this.discount / 100).toFixed(2) }

  serialize() {
    const { account } = this
    return {
      ...super.serialize(),
      ...pick(this, ['discount'] satisfies (keyof ExpensesBill)[]),
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

export class IncomeBill extends Bill {
  declare account: Account
  readonly type = '收入'
  declare commission: number

  get displayCommission() { return (this.commission / 100).toFixed(2) }

  serialize() {
    const { account } = this
    return {
      ...super.serialize(),
      ...pick(this, ['commission'] satisfies (keyof IncomeBill)[]),
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

export class TransferBill extends Bill {
  declare paymentAccount: Account
  declare receivingAccount: Account
  readonly type = '转账'
  declare commission: number

  get displayCommission() { return (this.commission / 100).toFixed(2) }

  serialize() {
    const { paymentAccount, receivingAccount } = this
    return {
      ...super.serialize(),
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
export type BillDTO = ReturnType<BillType['serialize']>
