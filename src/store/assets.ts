import { type AssetsData, queryAssetsData } from '@/api/index.ts'

export const useAssetsStore = defineStore('assets', () => {
  const state = reactive<AssetsData>({
    dailyAverageExpense: 0,
    dailyAverageIncome: 0,
    negativeAssets: 0,
    netAssets: 0,
    thisMonthBalance: 0,
    thisMonthExpense: 0,
    thisMonthIncome: 0,
    thisWeekBalance: 0,
    thisWeekExpense: 0,
    thisWeekIncome: 0,
    thisYearBalance: 0,
    thisYearExpense: 0,
    thisYearIncome: 0,
    todayBalance: 0,
    todayExpense: 0,
    todayIncome: 0,
    totalAssets: 0,
    totalBalance: 0,
    totalExpense: 0,
    totalIncome: 0,
  })

  async function refresh() {
    Object.assign(state, await queryAssetsData())
  }

  onBeforeMount(() => refresh())

  return { ...toRefs(state), refresh }
})
