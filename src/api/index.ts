import { merge } from 'es-toolkit'

import { dayjs } from '@/utils/index.ts'
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

export type AssetsData = Awaited<ReturnType<typeof queryAssetsData>>
export async function queryAssetsData() {
  const data = {
    /** 本月支出 */
    thisMonthExpense: 0,
    /** 本月收入 */
    thisMonthIncome: 0,
    /** 本月结余 */
    thisMonthBalance: 0,
    /** 日均消费 */
    dailyAverageExpense: 0,
    /** 日均收入 */
    dailyAverageIncome: 0,
    /** 总资产 */
    totalAssets: 0,
    /** 负资产 */
    negativeAssets: 0,
    /** 净资产 */
    netAssets: 0,
    /** 本年支出 */
    thisYearExpense: 0,
    /** 本年收入 */
    thisYearIncome: 0,
    /** 本年结余 */
    thisYearBalance: 0,
    /** 今日支出 */
    todayExpense: 0,
    /** 今日收入 */
    todayIncome: 0,
    /** 今日结余 */
    todayBalance: 0,
    /** 本周支出 */
    thisWeekExpense: 0,
    /** 本周收入 */
    thisWeekIncome: 0,
    /** 本周结余 */
    thisWeekBalance: 0,
    /** 总支出 */
    totalExpense: 0,
    /** 总收入 */
    totalIncome: 0,
    /** 总结余 */
    totalBalance: 0,
  }

  const transaction = DB.transaction(['account', 'bill'])

  async function handleAccount() {
    const accountStore = transaction.objectStore('account')
    let cursor = await accountStore.openCursor()
    while (cursor) {
      const value = cursor.value
      switch (value.type) {
        case '信贷': { data.negativeAssets += value.debt; break }
        case '资产': { data.totalAssets += value.balance; break }
        default: { const _: never = value }
      }
      cursor = await cursor.continue()
    }
    data.netAssets = data.totalAssets - data.negativeAssets
  }

  async function handleBill() {
    const now = dayjs()
    const billStore = transaction.objectStore('bill')
    const index = billStore.index('billTime')

    function openBoundCursor(start: dayjs.OpUnitType, end: dayjs.OpUnitType) {
      const range = IDBKeyRange.bound(
        now.startOf(start).valueOf(),
        now.endOf(end).valueOf(),
      )
      return index.openCursor(range)
    }

    async function handleMonth() {
      let cursor = await openBoundCursor('month', 'month')
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { data.thisMonthExpense += value.amount; break }
          case '收入': { data.thisMonthIncome += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.thisMonthBalance = data.thisMonthIncome - data.thisMonthExpense
    }

    async function handleWeek() {
      let cursor = await openBoundCursor('week', 'week')
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { data.thisWeekExpense += value.amount; break }
          case '收入': { data.thisWeekIncome += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.thisWeekBalance = data.thisWeekIncome - data.thisWeekExpense
    }

    async function handleYear() {
      let cursor = await openBoundCursor('year', 'year')
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { data.thisYearExpense += value.amount; break }
          case '收入': { data.thisYearIncome += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.thisYearBalance = data.thisYearIncome - data.thisYearExpense
    }

    async function handleAll() {
      let cursor = await index.openCursor()
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { data.totalExpense += value.amount; break }
          case '收入': { data.totalIncome += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.totalBalance = data.totalIncome - data.totalExpense
    }

    async function handleToday() {
      let cursor = await openBoundCursor('day', 'day')
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { data.todayExpense += value.amount; break }
          case '收入': { data.todayIncome += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.todayBalance = data.todayIncome - data.todayExpense
    }

    async function handleDailyAverage() {
      let cursor = await openBoundCursor('month', 'date')
      let expense = 0
      let income = 0
      while (cursor) {
        const value = cursor.value
        switch (value.type) {
          case '支出': { expense += value.amount; break }
          case '收入': { income += value.amount; break }
          case '转账': { break }
          default: { const _: never = value }
        }
        cursor = await cursor.continue()
      }
      data.dailyAverageExpense = expense / now.date()
      data.dailyAverageIncome = income / now.date()
    }

    await Promise.all([
      handleWeek(),
      handleMonth(),
      handleYear(),
      handleAll(),
      handleDailyAverage(),
      handleToday(),
    ])
  }

  await Promise.all([handleAccount(), handleBill()])
  return data
}
