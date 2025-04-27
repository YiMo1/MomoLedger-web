import type { IDBPObjectStore, StoreNames } from 'idb'
import type { Database } from './index.ts'

export interface Data { structured: () => unknown }
export type Store<
  Table extends StoreNames<Database>,
  Mode extends IDBTransactionMode = 'readonly',
> = IDBPObjectStore<Database, ArrayLike<StoreNames<Database>>, Table, Mode>
