import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteAccount } from '../index.ts'
import { open } from '@/database/index.ts'

import type { AccountDTO, BillDTO, CreditAccount, Database } from '@/database/index.ts'
import type { IDBPDatabase } from 'idb'

let DB: IDBPDatabase<Database>

beforeEach(async () => {
  vi.stubGlobal('indexedDB', new IDBFactory())
  DB = await open()
})

describe(deleteAccount.name, () => {
  it('应成功删除账户', async () => {
    const id = await DB.add('account', {} as AccountDTO)
    expect(await DB.get('account', id)).not.toBeUndefined()

    await deleteAccount(id)
    expect(await DB.get('account', id)).toBeUndefined()
  })

  it('应删除账户并清除关联账单', async () => {
    const aid = await DB.add('account', {} as AccountDTO)
    const bid = await DB.add('bill', { type: '支出', account: aid } as BillDTO)

    expect(await DB.get('bill', bid)).not.toBeUndefined()

    await deleteAccount(aid)
    expect(await DB.get('bill', bid)).toBeUndefined()
  })

  it('应删除付款账户并更新收款账户', async () => {
    const paymentAccount = await DB.add('account', { balance: 1000, type: '资金' } as AccountDTO)
    const receivingAccount = await DB.add('account', { debt: 1000, type: '信贷' } as AccountDTO)
    const bid = await DB.add('bill', {
      type: '转账',
      amount: 100,
      paymentAccount,
      receivingAccount,
    } as BillDTO)

    await deleteAccount(paymentAccount)

    expect(await DB.get('account', paymentAccount)).toBeUndefined()
    expect(await DB.get('bill', bid)).toBeUndefined()
    const account = (await DB.get('account', receivingAccount)) as ReturnType<
      CreditAccount['serialize']
    >
    expect(account.debt).toBe(1100)
  })
})
