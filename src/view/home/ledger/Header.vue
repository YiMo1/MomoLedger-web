<script setup lang="ts">
import { useAssetsStore } from '@/store/assets'
import { formatMoney } from '@/utils/index.ts'

const store = useAssetsStore()
</script>

<template>
  <div class="rounded bg-emerald-100 p-4">
    <div class="flex gap-x-8">
      <div>
        <div>本月支出</div>
        <div class="mt-1 font-bold text-black">
          {{ formatMoney(store.thisMonthExpense) }}
        </div>
      </div>
      <div>
        <div>本月结余</div>
        <div class="mt-1 font-bold text-black">
          {{ formatMoney(store.thisMonthBalance) }}
        </div>
      </div>
      <div>
        <div>日均消费</div>
        <div class="mt-1 font-bold text-black">
          {{ formatMoney(store.dailyAverageExpense) }}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <div>净资产</div>
      <div class="text-lg font-bold text-emerald-500">{{ formatMoney(store.netAssets) }}</div>
    </div>
  </div>
</template>
