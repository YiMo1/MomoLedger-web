<script setup lang="ts">
import dayjs from 'dayjs'

import { formatMoney } from '@/utils/index.ts'

import type { Bill } from '@/database/index.ts'

const props = defineProps<{ data: Bill[]; date: dayjs.Dayjs }>()

const statistics = computed(() => props.data.reduce<{
  income: number
  expenses: number
}>((statistics, item) => {
  if (item.type === '支出') { statistics.expenses += item.amount }
  if (item.type === '收入') { statistics.income += item.amount }
  return statistics
}, { income: 0, expenses: 0 }))

const week = computed(() => {
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return week[props.date.day()]
})

const displayDate = computed(() => {
  const dateFormat = 'YYYY年M月D日'
  const date = props.date.format(dateFormat)
  const now = dayjs()

  if (date === now.format(dateFormat)) { return '今天' }
  if (date === now.subtract(1, 'day').format(dateFormat)) { return '昨天' }
  return props.date.year() === now.year() ? date.slice(5) : date
})
</script>

<template>
  <div
    :style="{
      '--van-cell-group-inset-title-padding': '8px 0',
      '--van-cell-group-inset-padding': 0,
      '--van-cell-group-inset-radius': '4px',
    }"
  >
    <van-cell-group inset>
      <template #title>
        <div class="flex justify-between">
          <div>
            <span class="mr-4 font-bold text-black">{{ displayDate }}</span>
            <span>{{ week }}</span>
          </div>
          <div>
            <span>收</span>
            <span class="ml-2 mr-4 text-emerald-400">
              {{ formatMoney(statistics.income) }}
            </span>
            <span>支</span>
            <span class="ml-2 text-red-500">{{ formatMoney(statistics.expenses) }}</span>
          </div>
        </div>
      </template>
      <slot />
    </van-cell-group>
  </div>
</template>
