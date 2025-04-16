<script setup lang="ts">
const r = ref({
  netAssets: 2662256,
  expenditureForThisMonth: 89061,
  balanceForThisMonth: -83619,
  dailyAverageExpenditure: 11133,
})
</script>

<template>
  <div class="rounded bg-emerald-100 p-4">
    <div class="flex gap-x-8">
      <div>
        <div>本月支出</div>
        <div class="mt-1 font-bold text-black">
          {{ (r.expenditureForThisMonth / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>本月结余</div>
        <div class="mt-1 font-bold text-black">
          {{ (r.balanceForThisMonth / 100).toFixed(2) }}
        </div>
      </div>
      <div>
        <div>日均消费</div>
        <div class="mt-1 font-bold text-black">
          {{ (r.dailyAverageExpenditure / 100).toFixed(2) }}
        </div>
      </div>
    </div>
    <div class="mt-3">
      <div>净资产</div>
      <div class="text-lg font-bold text-emerald-500">{{ (r.netAssets / 100).toFixed(2) }}</div>
    </div>
  </div>
</template>
