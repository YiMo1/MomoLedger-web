import { type DBSchema, openDB as _openDB } from 'idb'

export type Account = {
  id?: number
  name?: string
  balance?: number
  note?: string
  type?: '资产' | '信贷'
  limit?: number
}

export type LedgerRecord = {
  id?: number
  expenses?: number
  note?: string
  statementDate?: number
  account?: Account['id']
  createTime?: number
  discount?: number
  category?: Category['id']
  type?: '支出' | '收入' | '转账'
}

export type Category = {
  id?: number
  text?: string
  parent?: number
}

export type Database = {
  account: { key: Account['id']; value: Account }
  'ledger-record': { key: LedgerRecord['id']; value: LedgerRecord }
  category: { key: LedgerRecord['id']; value: Category }
} & DBSchema

export function openDB() {
  return _openDB<Database>('momo-ledger', 1, {
    upgrade(database) {
      database.createObjectStore('account', { keyPath: 'id', autoIncrement: true })
      database.createObjectStore('ledger-record', { keyPath: 'id', autoIncrement: true })
      database.createObjectStore('category', { keyPath: 'id', autoIncrement: true })
    },
  })
}
