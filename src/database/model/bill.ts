import { merge, pick } from 'es-toolkit'
import dayjs from 'dayjs'

import type { DistributedOmit } from 'type-fest'
import type { Account } from './account.ts'
import type { Category } from '../index.ts'

abstract class BaseBill {
  declare id: number
  declare note?: string
  declare amount: number
  declare billTime: dayjs.Dayjs
  declare createTime: dayjs.Dayjs
  declare category: Category
  declare type: '支出' | '收入' | '转账'
  declare discount: number

  serialize() {
    const { billTime, createTime, category } = this
    return {
      ...pick(this, ['id', 'note', 'amount', 'type', 'discount'] satisfies (keyof BaseBill)[]),
      billTime: billTime.valueOf(),
      createTime: createTime.valueOf(),
      /** 分类ID */
      cid: category.id,
    }
  }
}

export class SingleAccountBill extends BaseBill {
  declare account: Account
  declare type: '支出' | '收入'

  serialize() {
    const { account } = this
    return {
      ...super.serialize(),
      /** 收支账户ID */
      aid: account.id,
    }
  }
}

export class DoubleAccountBill extends BaseBill {
  declare fromAccount: Account
  declare toAccount: Account
  type = '转账' as const

  serialize() {
    const { fromAccount, toAccount } = this
    return {
      ...super.serialize(),
      /** 支出账户ID */
      faid: fromAccount.id,
      /** 收入账户ID */
      taid: toAccount.id,
    }
  }
}

export type Bill = SingleAccountBill | DoubleAccountBill
export type BillDTO = ReturnType<Bill['serialize']>

// eslint-disable-next-line ts/no-extraneous-class
export class BillFactory {
  static build(data: DistributedOmit<BillDTO, 'aid' | 'cid' | 'faid' | 'taid'>): Bill {
    let account: Bill
    switch (data.type) {
      case '支出':
      case '收入': { account = new SingleAccountBill(); break }
      case '转账': { account = new DoubleAccountBill(); break }
      default: { account = data }
    }
    merge(account, {
      ...data,
      createTime: dayjs(data.createTime),
      billTime: dayjs(data.billTime),
    })
    return account
  }
}
