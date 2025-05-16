import type { DBSchema, IDBPDatabase, IDBPTransaction } from 'idb'
import type { OmitIndexSignature } from 'type-fest'

type ModelInitOptions = {
  database: IDBPDatabase<DBSchema>
  tableName: keyof OmitIndexSignature<DBSchema>
}

interface TransactionOptions<T extends ModelInitOptions['tableName']> {
  transaction?: IDBPTransaction<
    DBSchema,
    ArrayLike<T>,
    'readonly' | 'readwrite'
  >
}

export abstract class Model {
  static database: ModelInitOptions['database']
  static tableName: ModelInitOptions['tableName']

  static init({ database, tableName }: ModelInitOptions) {
    this.database = database
    this.tableName = tableName
    return this
  }

  static findAll<M extends typeof Model>(
    this: M,
    { transaction }: TransactionOptions<M['tableName']> = {},
  ): Promise<DBSchema[M['tableName']]['value'][]> {
    if (transaction) {
      return transaction.objectStore(this.tableName).getAll()
    }
    return this.database.getAll(this.tableName)
  }

  static findByPk<M extends typeof Model>(
    this: M,
    key: DBSchema[M['tableName']]['key'],
    { transaction }: TransactionOptions<M['tableName']> = {},
  ) {
    if (transaction) {
      return transaction.objectStore(this.tableName).get(key)
    }
    return this.database.get(this.tableName, key)
  }

  toJSON() { return JSON.stringify({ ...this }) }

  abstract from<M extends typeof Model>(
    this: M,
    value: DBSchema[M['tableName']]['value'],
  ): InstanceType<M>

  abstract save<M extends typeof Model>(options: TransactionOptions<M['tableName']>): void
}
