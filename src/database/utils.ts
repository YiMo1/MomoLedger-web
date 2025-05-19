import type { DBSchema, IDBPObjectStore, StoreNames } from 'idb'

export interface Model { structured: () => unknown }
export type Store<
  Table extends StoreNames<DBSchema>,
  Mode extends IDBTransactionMode = 'readonly',
> = IDBPObjectStore<DBSchema, ArrayLike<StoreNames<DBSchema>>, Table, Mode>
