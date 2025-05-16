import { pick } from 'es-toolkit'

import type dayjs from 'dayjs'

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

class AssetsAccount extends BaseAccount {
  declare balance: number
  type = '资产' as const

  expense(amount: number) { this.balance -= amount }

  income(amount: number) { this.balance += amount }

  serialize() {
    return { ...super.serialize(), ...pick(this, ['balance'] satisfies (keyof AssetsAccount)[]) }
  }
}

class CreditAccount extends BaseAccount {
  declare debt: number
  declare limit: number
  type = '信贷' as const

  expense(amount: number) { this.debt -= amount }

  income(amount: number): void { this.limit += amount }

  serialize() {
    return {
      ...super.serialize(),
      ...pick(this, ['debt', 'limit'] satisfies (keyof CreditAccount)[]),
    }
  }
}

export type Account = AssetsAccount | CreditAccount

// eslint-disable-next-line ts/no-extraneous-class
export class AccountFactory {
  static build(data: ReturnType<Account['serialize']>) {
    switch (data.type) {
      case '资产': { Object.setPrototypeOf(data, AssetsAccount.prototype); break }
      case '信贷': { Object.setPrototypeOf(data, CreditAccount.prototype); break }
      default: { throw new Error('账户序列化异常') }
    }
    return data as unknown as Account
  }
}

// interface AccountOptions {
//   id: number
//   name: string
//   note: string
//   createTime?: dayjs.ConfigType
// }
// abstract class Account extends Model {
//   declare static tableName: 'account'
//   declare id: number
//   declare name: string
//   declare note: string
//   declare createTime: dayjs.Dayjs
//   declare type: '资产' | '信贷'

//   abstract expenses(amount: number): void
//   abstract income(amount: number): void

//   static initialization(database: IDBPDatabase<DBSchema>) {
//     super.init({ database, tableName: 'account' })
//   }

//   save() {
//     const { createTime } = this
//     return {
//       ...pick(this, ['id', 'name', 'note', 'type'] satisfies (keyof Account)[]),
//       createTime: createTime.valueOf(),
//     }
//   }
// }

// interface AssetsAccountOptions extends AccountOptions {
//   balance: number
// }
// export class AssetsAccount extends Account {
//   readonly type = '资产'
//   balance: number

//   get displayBalance() { return (this.balance / 100).toFixed(2) }

//   expenses(amount: number) { this.balance -= amount }

//   income(amount: number) { this.balance += amount }

//   structured() { return { ...pick(this, ['balance']) } }
// }

// interface CreditAccountOptions extends AccountOptions {
//   debt: number
//   limit: number
// }
// export class CreditAccount extends Account {
//   readonly type = '信贷'
//   debt: number
//   limit: number

//   get displayDebt() { return (this.debt / 100).toFixed(2) }

//   get displayLimit() { return (this.limit / 100).toFixed(2) }

//   expenses(amount: number) { this.debt -= amount }

//   income(amount: number) { this.debt += amount }

//   structured() { return { ...pick(this, ['debt', 'limit']) } }
// }

type AccountType = AssetsAccount | CreditAccount
export type { AccountType as Account }
export type AccountDTO = ReturnType<AccountType['structured']>

export function buildAccount(options: AccountDTO) {
  switch (options.type) {
    case '资产': { return new AssetsAccount(options) }
    case '信贷': { return new CreditAccount(options) }
    default: { const never: never = options; return never }
  }
}
