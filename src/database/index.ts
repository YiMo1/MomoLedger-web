import { type DBSchema, type IDBPDatabase, type StoreNames, deleteDB, openDB } from 'idb'

import { category } from './init-data/v1.ts'

import type { AssetsAccount, CreditAccount } from './type.d.ts'

export type * from './type.d.ts'
export type Account = AssetsAccount | CreditAccount

export const DB_VERSION = 1
export const DB_NAME = 'momo-ledger'

export const DB = await initDB()

export type LedgerRecord = {
  id?: number
  expenses?: number
  note?: string
  statementDate?: number
  paymentAccount?: Account['id']
  createTime?: number
  discount?: number
  category?: Category['id']
  type?: '支出' | '收入' | '转账'
  receivingAccount?: Account['id']
}

export type Category = {
  id?: number
  text?: string
  parent?: number
  type?: '支出' | '收入'
}

async function initDB() {
  const DB = await open()

  if (import.meta.env.DEV) {
    const tables: StoreNames<Database>[] = ['account', 'category', 'ledger-record']
    const resultMap = new Map<StoreNames<Database>, Promise<any[]>>()
    const transaction = DB.transaction(tables, 'readonly')

    for (const table of tables) {
      resultMap.set(table, transaction.objectStore(table).getAll())
    }

    await transaction.done
    DB.close()
    await deleteDB(DB_NAME)

    const newDB = await open()
    const newTransaction = newDB.transaction(tables, 'readwrite')

    for (const table of tables) {
      const store = newTransaction.objectStore(table)
      const data = await resultMap.get(table)!
      for (const item of data) {
        store.put(item)
      }
    }

    await newTransaction.done
    return newDB
  }

  return DB
}

function open() {
  return openDB<Database>(DB_NAME, DB_VERSION, { upgrade: upgradeDB })
}

interface Database extends DBSchema {
  account: { key: Account['id']; value: Account }
  'ledger-record': {
    key: NonNullable <LedgerRecord['id']>
    value: LedgerRecord
    indexes: {
      idx_statementDate: NonNullable<LedgerRecord['statementDate']>
    }
  }
  category: { key: NonNullable<LedgerRecord['id']>; value: Category }
}

function upgradeDB(database: IDBPDatabase<Database>) {
  database.createObjectStore('account', { keyPath: 'id', autoIncrement: true })

  const ledgerRecordStore = database.createObjectStore(
    'ledger-record',
    { keyPath: 'id', autoIncrement: true },
  )
  ledgerRecordStore.createIndex('idx_statementDate', 'statementDate')

  const categoryStore = database.createObjectStore(
    'category',
    { keyPath: 'id', autoIncrement: true },
  )
  for (const item of category) {
    categoryStore.add(item)
  }
}
