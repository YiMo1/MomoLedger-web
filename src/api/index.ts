import { AccountFactory, type Category, DB } from '@/database/index.ts'

export async function deleteAccount(id: number) {
  const transaction = DB.transaction(['bill', 'account'], 'readwrite')
  const accountStore = transaction.objectStore('account')
  const billStore = transaction.objectStore('bill')

  for (const bill of await billStore.getAll()) {
    switch (bill.type) {
      case '支出':
      case '收入': {
        if (bill.account === id) { await billStore.delete(bill.id) }
        break
      }
      case '转账': {
        if (bill.paymentAccount === id) {
          const account = (await accountStore.get(bill.receivingAccount))!
          switch (account.type) {
            case '信贷': { account.debt += bill.amount; break }
            case '资产': { account.balance -= bill.amount; break }
            default: { const _: never = account }
          }
          await accountStore.put(account)
          await billStore.delete(bill.id)
        }
        if (bill.receivingAccount === id) {
          const account = (await accountStore.get(bill.paymentAccount))!
          switch (account.type) {
            case '信贷': { account.debt -= bill.amount; break }
            case '资产': { account.balance += bill.amount; break }
            default: { const _: never = account }
          }
          await accountStore.put(account)
          await billStore.delete(bill.id)
        }
        break
      }
      default: { const _: never = bill }
    }
  }

  await accountStore.delete(id)
  await transaction.done
}

export async function queryAccountById(id: number) {
  const dto = await DB.get('account', id)
  return dto && AccountFactory.build(dto)
}

export async function queryBill() {
  const transaction = DB.transaction(['bill', 'account', 'category'])
  const billStore = transaction.objectStore('bill')
  const accountStore = transaction.objectStore('account')
  const categoryStore = transaction.objectStore('category')

  const accountMap = new Map((await accountStore.getAll()).map((item) => [item.id, item]))
  const categoryMap = new Map((await categoryStore.getAll()).map((item) => [item.id, item]))

  const billDTOs = await billStore.getAll()
  return billDTOs.map((item) => {
    switch (item.type) {
      case '支出': {
        return {
          ...item,
          account: accountMap.get(item.account)!,
          category: categoryMap.get(item.category)!,
        }
      }
      case '收入': {
        return {
          ...item,
          account: accountMap.get(item.account)!,
          category: categoryMap.get(item.category)!,
        }
      }
      case '转账': {
        return {
          ...item,
          paymentAccount: accountMap.get(item.paymentAccount)!,
          receivingAccount: accountMap.get(item.receivingAccount)!,
          category: categoryMap.get(item.category)!,
        }
      }
      default: { return item }
    }
  })
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
