<script setup lang="ts">
import type { LedgerRecord } from '@/store/index.ts'

defineOptions({ name: 'BillCell' })
const props = defineProps<LedgerRecord>()

const categoryText = computed(() => {
  if (props.type === '转账') return '转账'
  return props.category?.text
})
</script>

<template>
  <div class="px-4 py-1.5">
    <div class="flex justify-between text-base">
      <div class="flex items-center text-gray-900">
        <span class="mr-1">{{ categoryText }}</span>
        <van-tag v-if="discount" plain color="#10b981">
          惠{{ ((discount ?? 0) / 100) }}
        </van-tag>
      </div>
      <div
        :class="[
          'font-bold', {
            'text-black': type === '转账',
            'text-red-500': type === '支出',
            'text-emerald-500': type === '收入',
          },
        ]"
      >
        <span v-if="type === '支出'">-</span>
        <span v-else-if="type === '收入'">+</span>
        <span>{{ ((expenses ?? 0) / 100).toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex justify-between text-xs leading-5">
      <div>{{ statementDate?.format('HH:mm') }}</div>
      <div v-if="type === '支出'">{{ paymentAccount?.name }}</div>
      <div v-else-if="type === '收入'">{{ receivingAccount?.name }}</div>
      <div v-else-if="type === '转账'">
        <span>{{ paymentAccount?.name }}</span>
        <span>→</span>
        <span>{{ receivingAccount?.name }}</span>
      </div>
    </div>
    <div v-if="note" class="text-xs leading-5">{{ note }}</div>
  </div>
</template>
