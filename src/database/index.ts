import { type DBSchema, type IDBPDatabase, type StoreNames, deleteDB, openDB } from 'idb'

import { category } from './init-data/v1.ts'

import type { AccountDTO, BillDTO, CategoryDTO } from './table/index.ts'

export * from './table/index.ts'

export const DB_VERSION = 1
export const DB_NAME = 'momo-ledger'

export const DB = await initDB()

async function initDB() {
  const DB = await open()

  if (import.meta.env.DEV) {
    const tables: StoreNames<Database>[] = ['account', 'category', 'bill']
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

export interface Database extends DBSchema {
  account: { key: AccountDTO['id']; value: AccountDTO }
  bill: {
    key: BillDTO['id']
    value: BillDTO
    indexes: {
      idx_billTime: BillDTO['billTime']
    }
  }
  category: { key: CategoryDTO['id']; value: CategoryDTO }
}

function upgradeDB(database: IDBPDatabase<Database>) {
  database.createObjectStore('account', { keyPath: 'id', autoIncrement: true })

  const ledgerRecordStore = database.createObjectStore(
    'bill',
    { keyPath: 'id', autoIncrement: true },
  )
  ledgerRecordStore.createIndex('idx_billTime', 'billTime')

  const categoryStore = database.createObjectStore(
    'category',
    { keyPath: 'id', autoIncrement: true },
  )
  for (const item of category) {
    categoryStore.add(item)
  }
}
