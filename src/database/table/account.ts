import { pick } from 'es-toolkit'

import type { Data } from '../utils.ts'

interface AccountOptions {
  id: number
  name: string
  note: string
}
abstract class Account implements Data {
  readonly id: number
  name: string
  note: string

  constructor({ id, name, note }: AccountOptions) {
    this.id = id
    this.name = name
    this.note = note
  }

  abstract expenses(amount: number): void
  abstract income(amount: number): void
  abstract structured(): unknown
}

interface AssetsAccountOptions extends AccountOptions {
  balance: number
}
export class AssetsAccount extends Account {
  readonly type = '资产' as const
  balance: number

  constructor({ balance, ...superOptions }: AssetsAccountOptions) {
    super(superOptions)
    this.balance = balance
  }

  expenses(amount: number) {
    this.balance -= amount
  }

  income(amount: number) {
    this.balance += amount
  }

  structured() {
    return pick(this, ['balance', 'id', 'name', 'type', 'note'])
  }
}

interface CreditAccountOptions extends AccountOptions {
  debt: number
  limit: number
}
export class CreditAccount extends Account {
  readonly type = '信贷' as const
  debt: number
  limit: number

  constructor({ debt, limit, ...superOptions }: CreditAccountOptions) {
    super(superOptions)
    this.debt = debt
    this.limit = limit
  }

  expenses(amount: number) {
    this.debt -= amount
  }

  income(amount: number) {
    this.debt += amount
  }

  structured() {
    return pick(this, ['debt', 'id', 'type', 'limit', 'name', 'note'])
  }
}

type AccountType = AssetsAccount | CreditAccount
export type { AccountType as Account }
export type AccountDTO = ReturnType<AccountType['structured']>
