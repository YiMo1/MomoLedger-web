<script setup lang="ts">
import EyeIcon from '@/assets/icon/眼睛.svg?component'
import CloseEyeIcon from '@/assets/icon/眼睛_闭.svg?component'
import { useAccountStore } from '@/store/account.ts'

const secret = defineModel('secret', { type: Boolean })
defineProps<{ secretText: string }>()

const { account } = storeToRefs(useAccountStore())

const assets = computed(() => account.value.reduce((pre, cur) => {
  pre.net += cur.balance
  if (cur.type === 'assets') { pre.total += cur.balance }
  if (cur.type === 'credit') { pre.negative += cur.balance }
  return pre
}, { total: 0, negative: 0, net: 0 }))
const show = ref(false)
</script>

<template>
  <div class="relative flex rounded bg-emerald-100 p-4">
    <div class="flex-1">
      <div class="flex items-center">
        <span class="mr-3 text-sm text-gray-600">净资产(元)</span>
        <eye-icon v-if="!secret" class="size-5 fill-gray-600" @click="secret = !secret" />
        <close-eye-icon v-else class="size-5 fill-gray-600" @click="secret = !secret" />
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
    z-index="2"
    class-name="flex items-center justify-center"
    @click.self="show = false"
  >
    <div class="w-4/5 rounded-md bg-white p-4">
      <div class="text-center text-lg font-bold">资产数据</div>
      <div class="mt-4">
        <div>可使用资金：{{ assets.total }}</div>
      </div>
    </div>
  </van-overlay>
</template>
