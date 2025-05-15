import { pick } from 'es-toolkit'
import dayjs from 'dayjs'

import type { Data } from '../utils.ts'

interface AccountOptions {
  id: number
  name: string
  note: string
  createTime?: dayjs.ConfigType
}
abstract class Account implements Data {
  readonly id: number
  name: string
  note: string
  createTime: dayjs.Dayjs
  abstract type: '资产' | '信贷'

  constructor({ id, name, note, createTime }: AccountOptions) {
    this.id = id
    this.name = name
    this.note = note
    this.createTime = dayjs(createTime)
  }

  abstract expenses(amount: number): void
  abstract income(amount: number): void
  structured() {
    const { createTime } = this
    return {
      ...pick(this, ['id', 'name', 'note', 'type']),
      createTime: createTime.valueOf(),
    }
  }
}

interface AssetsAccountOptions extends AccountOptions {
  balance: number
}
export class AssetsAccount extends Account {
  readonly type = '资产'
  balance: number

  get displayBalance() { return (this.balance / 100).toFixed(2) }

  constructor({ balance, ...superOptions }: AssetsAccountOptions) {
    super(superOptions)
    this.balance = balance
  }

  expenses(amount: number) { this.balance -= amount }

  income(amount: number) { this.balance += amount }

  structured() { return { ...super.structured(), ...pick(this, ['balance']) } }
}

interface CreditAccountOptions extends AccountOptions {
  debt: number
  limit: number
}
export class CreditAccount extends Account {
  readonly type = '信贷'
  debt: number
  limit: number

  get displayDebt() { return (this.debt / 100).toFixed(2) }

  get displayLimit() { return (this.limit / 100).toFixed(2) }

  constructor({ debt, limit, ...superOptions }: CreditAccountOptions) {
    super(superOptions)
    this.debt = debt
    this.limit = limit
  }

  expenses(amount: number) { this.debt -= amount }

  income(amount: number) { this.debt += amount }

  structured() { return { ...super.structured(), ...pick(this, ['debt', 'limit']) } }
}

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
