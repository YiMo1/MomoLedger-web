import dayjs from 'dayjs'

import { DB } from '../database/index.ts'
import { CreateAssetsData } from '../utils/index.ts'

export async function queryAssetsData() {
  const accounts = await DB.getAll('account')
  const bills = await DB.getAll('bill')

  const data = CreateAssetsData()

  for (const item of accounts) {
    if (item.type === '信贷') {
      data.negativeEquity += item.debt
    }
    if (item.type === '资产') {
      data.totalAssets += item.balance
    }
  }

  data.netAssets = data.totalAssets - data.negativeEquity

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
      data.totalExpenditure += item.amount
      if (isCurrentMouth(item.billTime)) {
        data.expenditureForThisMonth += item.amount
      }
      if (isCurrentYear(item.billTime)) {
        data.expenditureForThisYear += item.amount
      }
      if (isCurrentDate(item.billTime)) {
        data.todaySExpenditure += item.amount
      }
      if (isCurrentWeek(item.billTime)) {
        data.thisWeekSExpenses += item.amount
      }
    }
    if (item.type === '收入') {
      data.totalIncome += item.amount
      if (isCurrentMouth(item.billTime)) {
        data.thisMonthSIncome += item.amount
      }
      if (isCurrentYear(item.billTime)) {
        data.thisYearSIncome += item.amount
      }
      if (isCurrentDate(item.billTime)) {
        data.todaySIncome += item.amount
      }
      if (isCurrentWeek(item.billTime)) {
        data.thisWeekSIncome += item.amount
      }
    }
  }

  data.balanceForThisMonth = data.thisMonthSIncome - data.expenditureForThisMonth
  data.currentYearBalance = data.thisYearSIncome - data.expenditureForThisYear
  data.todaySBalance = data.todaySIncome - data.todaySExpenditure
  data.aggregateBalance = data.totalExpenditure - data.totalIncome
  data.thisWeekSBalance = data.thisWeekSIncome - data.thisWeekSExpenses
  data.dailyAverageConsumption = data.expenditureForThisMonth / dayjs().daysInMonth()
  data.dailyAverageIncome = data.thisMonthSIncome / dayjs().daysInMonth()

  return data
}
