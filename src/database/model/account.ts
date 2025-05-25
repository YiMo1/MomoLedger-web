import { merge, pick } from 'es-toolkit'
import dayjs from 'dayjs'

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
  declare type: '资产' | '信贷'

  abstract expense(amount: number): void
  abstract income(amount: number): void

  serialize() {
    return {
      ...pick(this, ['id', 'name', 'note', 'type'] satisfies (keyof BaseAccount)[]),
      createTime: this.createTime.valueOf(),
    }
  }
}

export class AssetsAccount extends BaseAccount {
  declare balance: number
  readonly type = '资产'

  expense(amount: number) { this.balance -= amount }

  income(amount: number) { this.balance += amount }

  serialize() {
    return { ...super.serialize(), ...pick(this, ['balance'] satisfies (keyof AssetsAccount)[]) }
  }
}

export class CreditAccount extends BaseAccount {
  declare debt: number
  declare limit: number
  readonly type = '信贷'

  expense(amount: number) { this.debt += amount }

  income(amount: number) { this.debt -= amount }

  serialize() {
    return {
      ...super.serialize(),
      ...pick(this, ['debt', 'limit'] satisfies (keyof CreditAccount)[]),
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
