import { AccountFactory, DB } from '@/database/index.ts'

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
