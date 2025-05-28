import { merge, pick } from 'es-toolkit'

import { dayjs } from '@/utils/index.ts'

declare module 'idb' {
  interface DBSchema {
    account: { key: AccountDTO['id']; value: AccountDTO }
  }
}

abstract class BaseAccount {
  declare id: number
  declare name: string
  declare createTime: dayjs.Dayjs
  declare note?: string

  abstract expense(amount: number): void
  abstract income(amount: number): void
  abstract serialize(): unknown
}

export class AssetsAccount extends BaseAccount {
  declare type: '资产'
  declare balance: number

  expense(amount: number) { this.balance -= amount }

  income(amount: number) { this.balance += amount }

  serialize() {
    return {
      ...pick(this, [
        'id',
        'name',
        'note',
        'type',
        'balance',
      ] satisfies (keyof AssetsAccount)[]),
      createTime: this.createTime.valueOf(),
    }
  }
}

export class CreditAccount extends BaseAccount {
  declare type: '信贷'
  declare debt: number
  declare limit: number

  expense(amount: number) { this.debt += amount }

  income(amount: number) { this.debt -= amount }

  serialize() {
    return {
      ...pick(this, [
        'id',
        'name',
        'note',
        'type',
        'debt',
        'limit',
      ] satisfies (keyof CreditAccount)[]),
      createTime: this.createTime.valueOf(),
    }
  }
}

export type Account = AssetsAccount | CreditAccount
export type AccountDTO = ReturnType<Account['serialize']>

// eslint-disable-next-line ts/no-extraneous-class
export class AccountFactory {
  static build(data: AccountDTO): Account {
    let account: Account
    switch (data.type) {
      case '资产': { account = new AssetsAccount(); break }
      case '信贷': { account = new CreditAccount(); break }
      default: { account = data }
    }
    merge(account, { ...data, createTime: dayjs(data.createTime) })
    return account
  }
}
