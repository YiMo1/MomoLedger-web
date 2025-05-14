<script setup lang="ts">
import { useAssetsDataStore } from '@/store/assets-data.ts'

const { data } = storeToRefs(useAssetsDataStore())
</script>

<template>
  <div class="rounded bg-emerald-100 p-4">
    <div class="flex gap-x-8">
      <div>
        <div>本月支出</div>
        <div class="mt-1 font-bold text-black">
          {{ (data.thisMonthExpenses / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>本月结余</div>
        <div class="mt-1 font-bold text-black">
          {{ (data.thisMonthBalance / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>日均消费</div>
        <div class="mt-1 font-bold text-black">
          {{ (data.dailyAverageConsumption / 100).toFixed(2) }}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <div>净资产</div>
      <div class="text-lg font-bold text-emerald-500">{{ (data.netAssets / 100).toFixed(2) }}</div>
    </div>
  </div>
</template>
