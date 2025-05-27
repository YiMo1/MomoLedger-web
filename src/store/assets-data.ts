import dayjs from 'dayjs'

import { emitter } from '@/utils/index.ts'
import { DB } from '@/database/index.ts'

const initialState = {
  /** 本月支出 */
  thisMonthExpenses: 0,
  /** 本月收入 */
  thisMonthIncome: 0,
  /** 本月结余 */
  thisMonthBalance: 0,
  /** 日均消费 */
  dailyAverageConsumption: 0,
  /** 日均收入 */
  dailyAverageIncome: 0,
  /** 总资产 */
  totalAssets: 0,
  /** 负资产 */
  negativeEquity: 0,
  /** 净资产 */
  netAssets: 0,
  /** 本年支出 */
  thisYearExpenses: 0,
  /** 本年收入 */
  thisYearIncome: 0,
  /** 本年结余 */
  thisYearBalance: 0,
  /** 今日支出 */
  todayExpenses: 0,
  /** 今日收入 */
  todayIncome: 0,
  /** 今日结余 */
  todayBalance: 0,
  /** 本周支出 */
  thisWeekExpenses: 0,
  /** 本周收入 */
  thisWeekIncome: 0,
  /** 本周结余 */
  thisWeekBalance: 0,
  /** 总支出 */
  totalExpenses: 0,
  /** 总收入 */
  totalIncome: 0,
  /** 总结余 */
  totalBalance: 0,
}

export const useAssetsDataStore = defineStore('AssetsData', () => {
  const data = ref({ ...initialState })

  watch(
    () => data.value.thisMonthIncome - data.value.thisMonthExpenses,
    (value) => data.value.thisMonthBalance = value,
  )

  watch(
    () => data.value.todayIncome - data.value.todayExpenses,
    (value) => data.value.todayBalance = value,
  )

  watch(
    () => data.value.thisWeekIncome - data.value.thisWeekExpenses,
    (value) => data.value.thisWeekBalance = value,
  )

  watch(
    () => data.value.thisYearIncome - data.value.thisYearExpenses,
    (value) => data.value.thisYearBalance = value,
  )

  watch(
    () => data.value.totalIncome - data.value.totalExpenses,
    (value) => data.value.totalBalance = value,
  )

  watch(
    () => data.value.thisMonthExpenses,
    (value) => data.value.dailyAverageConsumption = value / dayjs().daysInMonth(),
  )

  watch(
    () => data.value.thisMonthIncome,
    (value) => data.value.dailyAverageIncome = value / dayjs().daysInMonth(),
  )

  watch(
    () => data.value.totalAssets - data.value.negativeEquity,
    (value) => data.value.netAssets = value,
  )

  async function reload() {
    Object.assign(data.value, initialState)

    const accounts = await DB.getAll('account')
    const bills = await DB.getAll('bill')

    for (const item of accounts) {
      if (item.type === '信贷') {
        data.value.negativeEquity += item.debt
      }
      if (item.type === '资产') {
        data.value.totalAssets += item.balance
      }
    }

    const now = dayjs()
    function isCurrentMouth(billTime: number) {
      return dayjs(billTime).isSame(now, 'month')
    }

    function isCurrentYear(billTime: number) {
      return dayjs(billTime).isSame(now, 'year')
    }

    function isCurrentDate(billTime: number) {
      return dayjs(billTime).isSame(now, 'date')
    }

    function isCurrentWeek(billTime: number) {
      return dayjs(billTime).isSame(now, 'week')
    }

    for (const item of bills) {
      if (item.type === '支出') {
        data.value.totalExpenses += item.amount
        if (isCurrentMouth(item.billTime)) {
          data.value.thisMonthExpenses += item.amount
        }
        if (isCurrentYear(item.billTime)) {
          data.value.thisYearExpenses += item.amount
        }
        if (isCurrentDate(item.billTime)) {
          data.value.todayExpenses += item.amount
        }
        if (isCurrentWeek(item.billTime)) {
          data.value.thisWeekExpenses += item.amount
        }
      }
      if (item.type === '收入') {
        data.value.totalIncome += item.amount
        if (isCurrentMouth(item.billTime)) {
          data.value.thisMonthIncome += item.amount
        }
        if (isCurrentYear(item.billTime)) {
          data.value.thisYearIncome += item.amount
        }
        if (isCurrentDate(item.billTime)) {
          data.value.todayIncome += item.amount
        }
        if (isCurrentWeek(item.billTime)) {
          data.value.thisWeekIncome += item.amount
        }
      }
    }
  }

  emitter.on('create-bill', () => reload())

  return { data, reload }
})
