import { type Account, BillFactory, type Bill, type Category, DB } from '@/database/index.ts'

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
        if (billDTO.aid === id) { cursor.delete() }
        break
      }
      case '转账': {
        if (billDTO.paymentAccount === id || billDTO.receivingAccount === id) {
          let account: Account | null = null
          if (billDTO.paymentAccount === id) {
            const accountDTO = await accountStore.get(billDTO.receivingAccount)
            if (accountDTO) {
              account = BillFactory.build(accountDTO)
              account.expense(billDTO.amount)
            }
          }
          if (billDTO.receivingAccount === id) {
            const accountDTO = await accountStore.get(billDTO.paymentAccount)
            if (accountDTO) {
              account = BillFactory.build(accountDTO)
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
  await transaction.done
}

export async function queryAccountById(id: number) {
  const dto = await DB.get('account', id)
  return dto && BillFactory.build(dto)
}

export async function queryBill() {
  const transaction = DB.transaction(['bill', 'account', 'category'])
  const billStore = transaction.objectStore('bill')
  const accountStore = transaction.objectStore('account')
  const categoryStore = transaction.objectStore('category')

  const bills: Bill[] = []
  let cursor = await billStore.openCursor()
  while (cursor) {
    const dto = cursor.value
    const category = (await categoryStore.get(dto.cid))!
    switch (dto.type) {
      case '支出':
      case '收入': {
        const account = BillFactory.build((await accountStore.get(dto.aid))!)
        bills.push({ ...dto, category, account })
        break
      }
      case '转账': {
        return {
          ...dto,
          paymentAccount: accountMap.get(dto.paymentAccount)!,
          receivingAccount: accountMap.get(dto.receivingAccount)!,
          category,
        }
      }
    }
    cursor = await cursor.continue()
  }

  return bills
}

export async function getCatetoryTree() {
  type Node = Category & { children: Node[] }

  const list = await DB.getAll('category')
  const map = new Map<Node['id'], Node>()
  const roots: Node[] = []

  for (const item of list) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of list) {
    const node = map.get(item.id)!
    if (item.pid !== undefined) {
      const parent = map.get(item.pid)
      parent?.children.push(node)
    }
    else { roots.push(node) }
  }

  return roots
}
