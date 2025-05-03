<script setup lang="ts">
import Expenses from './Expenses.vue'
import Income from './Income.vue'
import Transfer from './Transfer.vue'

import type { Bill } from '@/database/index.ts'

type BillType = Bill['type']

const types = ref<BillType[]>(['支出', '收入', '转账'])
const active = ref<BillType>('支出')

const expensesInstance = ref<InstanceType<typeof Expenses>>()
const incomeInstance = ref<InstanceType<typeof Income>>()
const transferInstance = ref<InstanceType<typeof Transfer>>()
function submit() {
  switch (active.value) {
    case '支出': { expensesInstance.value?.create(); break }
    case '收入': { incomeInstance.value?.create(); break }
    case '转账': { transferInstance.value?.create(); break }
    default: { const _: never = active.value }
  }
}
</script>

<template>
  <div class="flex h-screen flex-col">
    <van-nav-bar
      style="--van-nav-bar-arrow-size: 20px"
      fixed
      left-arrow
      placeholder
      safe-area-inset-top
      right-text="添加"
      @click-left="$router.back"
      @click-right="submit"
    >
      <template #title>
        <van-tabs v-model:active="active">
          <van-tab v-for="type in types" :key="type" :name="type">
            <template #title>
              <div class="px-4">{{ type }}</div>
            </template>
          </van-tab>
        </van-tabs>
      </template>
    </van-nav-bar>

    <van-tabs
      v-model:active="active"
      :show-header="false"
      swipeable
      class="category-tabs flex-1"
    >
      <van-tab name="支出">
        <expenses ref="expensesInstance" />
      </van-tab>
      <van-tab name="收入">
        <income ref="incomeInstance" />
      </van-tab>
      <van-tab name="转账">
        <transfer ref="transferInstance" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<style>
.category-tabs .van-tabs__content {
  @apply h-full
}
</style>
