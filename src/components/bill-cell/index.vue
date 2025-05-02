<script setup lang="ts">
import { useBillStore } from '@/store/bill'

import type { Bill } from '@/database/index.ts'

defineOptions({ name: 'BillCell' })
const props = defineProps<{ bill: Bill }>()

const categoryText = computed(() => {
  if (props.bill.type === '转账') return '转账'
  return props.bill.category.text
})

const store = useBillStore()
</script>

<template>
  <van-swipe-cell stop-propagation>
    <div class="bg-white px-4 py-1.5">
      <div class="flex justify-between text-base">
        <div class="flex items-center text-gray-900">
          <span class="mr-1">{{ categoryText }}</span>
          <van-tag v-if="bill.type === '支出' && bill.discount !== 0" plain type="primary">
            惠{{ bill.discount / 100 }}
          </van-tag>
        </div>
        <div
          :class="[
            'font-bold', {
              'text-black': bill.type === '转账',
              'text-red-500': bill.type === '支出',
              'text-emerald-500': bill.type === '收入',
            },
          ]"
        >
          <span v-if="bill.type === '支出'">-</span>
          <span v-else-if="bill.type === '收入'">+</span>
          <span>{{ (bill.amount / 100).toFixed(2) }}</span>
        </div>
      </div>
      <div class="flex justify-between text-xs leading-5">
        <div>{{ bill.billTime?.format('HH:mm') }}</div>
        <div v-if="bill.type === '支出' || bill.type === '收入'">{{ bill.account.name }}</div>
        <div v-else-if="bill.type === '转账'">
          <span>{{ bill.paymentAccount.name }}</span>
          <span>→</span>
          <span>{{ bill.receivingAccount.name }}</span>
        </div>
      </div>
      <div v-if="bill.note" class="text-xs leading-5">{{ bill.note }}</div>
    </div>
    <template #right>
      <van-button
        class="h-full"
        square
        type="danger"
        text="删除"
        @click="store.deleteLedgerRecord(bill.id)" />
    </template>
  </van-swipe-cell>
</template>
