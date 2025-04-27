<script setup lang="ts">
import dayjs from 'dayjs'

import { useAccountStore, useLedgerRecordStore } from '@/store/index.ts'

const { list: account } = storeToRefs(useAccountStore())

const netAssets = computed(() => account.value.reduce((sum, item) => {
  switch (item.type) {
    case '资产': { sum += item.balance; break }
    case '信贷': { sum += item.debt; break }
    default: { const _: never = item }
  }
  return sum
}, 0))

const now = dayjs()
const { list: record } = storeToRefs(useLedgerRecordStore())
const statistics = computed(() => record.value.reduce(
  (statistics, item, index) => {
    if (item.billTime.format('YYYY-MM') === now.format('YYYY-MM')) {
      if (item.type === '支出') {
        statistics.expenditureForThisMonth += item.amount ?? 0
        statistics.balanceForThisMonth -= item.amount ?? 0
      }
      if (item.type === '收入') {
        statistics.balanceForThisMonth += item.amount ?? 0
      }
    }
    if (index === record.value.length - 1) {
      statistics.dailyAverageExpenditure = statistics.expenditureForThisMonth / now.get('date')
    }
    return statistics
  },
  { expenditureForThisMonth: 0, balanceForThisMonth: 0, dailyAverageExpenditure: 0 },
))
</script>

<template>
  <div class="rounded bg-emerald-100 p-4">
    <div class="flex gap-x-8">
      <div>
        <div>本月支出</div>
        <div class="mt-1 font-bold text-black">
          {{ (statistics.expenditureForThisMonth / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>本月结余</div>
        <div class="mt-1 font-bold text-black">
          {{ (statistics.balanceForThisMonth / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>日均消费</div>
        <div class="mt-1 font-bold text-black">
          {{ (statistics.dailyAverageExpenditure / 100).toFixed(2) }}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <div>净资产</div>
      <div class="text-lg font-bold text-emerald-500">{{ (netAssets / 100).toFixed(2) }}</div>
    </div>
  </div>
</template>
