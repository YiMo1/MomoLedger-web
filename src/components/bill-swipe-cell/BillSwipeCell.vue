<script setup lang="ts">
import { useBillStore } from '@/store/bill'

import type { Bill } from '@/database/index.ts'

const props = defineProps<{ bill: Bill }>()

const categoryText = computed(() => {
  if (props.bill.type === '转账') return '转账'
  return props.bill.category.text
})

const store = useBillStore()
</script>

<template>
  <van-swipe-cell stop-propagation>
    <van-cell
      style="--van-cell-icon-size: 28px; --van-cell-line-height: 20px;"
      icon-prefix="iconfont"
      class="after:hidden"
      title-class="ml-1"
      label-class="line-clamp-2"
      :icon="bill.category.icon"
      :label="bill.note"
    >
      <template #title>
        <div>
          <span class="mr-2">{{ categoryText }}</span>
          <van-tag
            v-if="bill.type === '支出' && bill.discount !== 0"
            style="--van-tag-font-size: 10px;--van-tag-radius: 4px;"
            plain
            type="primary"
            class="py-0.5"
          >
            惠{{ bill.discount / 100 }}
          </van-tag>
        </div>
        <div class="text-xs/5 text-gray-500">{{ bill.billTime.format('HH:mm') }}</div>
      </template>
      <template #value>
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
          <span>{{ bill.displayAmount }}</span>
        </div>
        <div v-if="bill.type === '支出' || bill.type === '收入'">{{ bill.account.name }}</div>
        <div v-else-if="bill.type === '转账'">
          <span>{{ bill.paymentAccount.name }}</span>
          <span>→</span>
          <span>{{ bill.receivingAccount.name }}</span>
        </div>
      </template>
    </van-cell>
    <template #right>
      <van-button
        class="h-full"
        square
        type="danger"
        text="删除"
        @click="store.deleteBill(bill.id)" />
    </template>
  </van-swipe-cell>
</template>
