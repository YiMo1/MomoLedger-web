import { openDB } from 'idb'

import type { Account } from '../types/index.ts'

export type Database = {
  account: { key: Account['id']; value: Omit<Account, 'id'> }
}

function initDatabase() {
  return openDB<Database>('momo-ledger', 1, {
    upgrade(database) {
      database.createObjectStore('account', { keyPath: 'id', autoIncrement: true })
    },
  })
}

export const useDatabaseStore = defineStore('database', () => {
  const database = ref(initDatabase())

  return { database }
})
