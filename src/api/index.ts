import { merge } from 'es-toolkit'

import { type Account, type AccountDTO, AccountFactory, DB } from '@/database/index.ts'

import type { DistributedOmit, SetRequired } from 'type-fest'

export async function deleteAccount(id: number) {
  const transaction = DB.transaction(['bill', 'account'], 'readwrite')
  const accountStore = transaction.objectStore('account')
  const billStore = transaction.objectStore('bill')

  let cursor = await billStore.openCursor()

  while (cursor) {
    const billDTO = cursor.value
    switch (billDTO.type) {
      case '支出':
      case '收入': {
        if (billDTO.account === id) { cursor.delete() }
        break
      }
      case '转账': {
        if (billDTO.paymentAccount === id || billDTO.receivingAccount === id) {
          let account: Account | null = null
          if (billDTO.paymentAccount === id) {
            const accountDTO = await accountStore.get(billDTO.receivingAccount)
            if (accountDTO) {
              account = AccountFactory.build(accountDTO)
              account.expense(billDTO.amount)
            }
          }
          if (billDTO.receivingAccount === id) {
            const accountDTO = await accountStore.get(billDTO.paymentAccount)
            if (accountDTO) {
              account = AccountFactory.build(accountDTO)
              account.income(billDTO.amount)
            }
          }
          account && await accountStore.put(account.serialize())
          cursor.delete()
        }
        break
      }
      default: { const _: never = billDTO }
    }
    cursor = await cursor.continue()
  }

  accountStore.delete(id)
  return transaction.done
}

export async function queryAllAccount() {
  const dto = await DB.getAll('account')
  return dto.map((item) => AccountFactory.build(item))
}

export async function queryAccountById(id: number) {
  const dto = await DB.get('account', id)
  return dto && AccountFactory.build(dto)
}

export async function insertAccount(data: DistributedOmit<AccountDTO, 'id' | 'createTime'>) {
  const transaction = DB.transaction('account', 'readwrite')
  const store = transaction.objectStore('account')
  const id = await store.add({} as any)
  const dto = { ...data, id, createTime: Date.now() } satisfies AccountDTO
  store.put(dto)
  await transaction.done
  return AccountFactory.build(dto)
}

export async function updateAccount(data: SetRequired<Partial<AccountDTO>, 'id'>) {
  const transaction = DB.transaction('account', 'readwrite')
  const store = transaction.objectStore('account')
  const dto = await store.get(data.id)
  if (!dto) { throw new Error(`更新账户异常----${JSON.stringify(data)}`) }
  merge(dto, data)
  store.put(dto)
  await transaction.done
  return AccountFactory.build(dto)
}
