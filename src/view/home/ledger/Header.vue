<script setup lang="ts">
import { queryAssetsData } from '@/api/index.ts'
import { CreateAssetsData } from '@/utils/index.ts'

const data = ref(CreateAssetsData())

onBeforeMount(async () => {
  data.value = await queryAssetsData()
})
</script>

<template>
  <div class="rounded bg-emerald-100 p-4">
    <div class="flex gap-x-8">
      <div>
        <div>本月支出</div>
        <div class="mt-1 font-bold text-black">
          {{ (data.expenditureForThisMonth / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>本月结余</div>
        <div class="mt-1 font-bold text-black">
          {{ (data.balanceForThisMonth / 100).toFixed(2) }}
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
