<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'

const secret = defineModel<boolean>('secret', { required: true })
defineProps<{ secretText: string }>()

const { list } = storeToRefs(useAccountStore())

const assets = computed(() => list.value.reduce((pre, cur) => {
  switch (cur.type) {
    case '信贷': {
      pre.negative += cur.debt
      pre.net += cur.debt
      break
    }
    case '资产': {
      pre.total += cur.balance
      pre.net += cur.balance
      break
    }
    default: { const _: never = cur }
  }
  return pre
}, { total: 0, negative: 0, net: 0 }))
const show = ref(false)
</script>

<template>
  <div class="relative flex rounded bg-emerald-100 p-4">
    <div class="flex-1">
      <div class="flex items-center text-gray-600">
        <span class="mr-3 text-sm">净资产(元)</span>
        <van-icon
          :name="secret ? 'closed-eye' : 'eye-o'"
          size="20px"
          @click="secret = !secret" />
      </div>
      <div class="mt-5 text-xl font-bold text-emerald-500">
        {{ secret ? secretText : (assets.net / 100).toFixed(2) }}
      </div>
    </div>
    <div class="flex-1">
      <div>
        <span class="mr-3 text-sm text-gray-600">总资产</span>
        <span class="font-bold text-gray-700">
          {{ secret ? secretText : (assets.total / 100).toFixed(2) }}</span>
      </div>
      <div class="mt-5">
        <span class="mr-3 text-sm text-gray-600">负资产</span>
        <span class="font-bold text-gray-700">
          {{ secret ? secretText : (assets.negative / 100).toFixed(2) }}</span>
      </div>
    </div>
    <van-icon
      class="absolute right-2 top-2 rotate-90 rounded-full text-gray-600"
      name="ellipsis"
      size="30"
      @click="show = true" />
  </div>
  <van-overlay
    :show="show"
    z-index="3"
    class-name="flex items-center justify-center"
    teleport="body"
    @click.self="show = false"
  >
    <div class="w-4/5 rounded-md bg-white p-4">
      <div class="text-center text-lg font-bold">资产数据</div>
      <div class="mt-4">
        <div>可使用资金：{{ (assets.total / 100).toFixed(2) }}</div>
      </div>
    </div>
  </van-overlay>
</template>
