<script setup lang="ts">
import type { LedgerRecord } from '@/store/index.ts'

const props = defineProps<{ data: LedgerRecord }>()

const categoryText = computed(() => {
  const { type } = props.data
  return type === '转账' ? '转账' : props.data.category?.text
})
</script>

<template>
  <div class="px-4 py-1.5">
    <div class="flex justify-between text-base">
      <div class="flex items-center text-gray-900">
        <span class="mr-1">{{ categoryText }}</span>
        <van-tag v-if="data.discount" plain color="#10b981">
          惠{{ ((data.discount ?? 0) / 100) }}
        </van-tag>
      </div>
      <div
        :class="[
          'font-bold', {
            'text-black': data.type === '转账',
            'text-red-500': data.type === '支出',
            'text-emerald-500': data.type === '收入',
          },
        ]"
      >
        <span v-if="data.type === '支出'">-</span>
        <span v-else-if="data.type === '收入'">+</span>
        <span>{{ ((data.expenses ?? 0) / 100).toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex justify-between text-xs leading-5">
      <div>{{ data.statementDate?.format('HH:mm') }}</div>
      <div v-if="data.type === '支出'">{{ data.paymentAccount?.name }}</div>
      <div v-else-if="data.type === '收入'">{{ data.receivingAccount?.name }}</div>
      <div v-else-if="data.type === '转账'">
        <span>{{ data.paymentAccount?.name }}</span>
        <span>→</span>
        <span>{{ data.receivingAccount?.name }}</span>
      </div>
    </div>
    <div v-if="data.note" class="text-xs leading-5">{{ data.note }}</div>
  </div>
</template>
