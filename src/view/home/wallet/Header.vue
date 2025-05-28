<script setup lang="ts">
import { useAssetsStore } from '@/store/assets'
import { formatMoney } from '@/utils/index.ts'

const secret = defineModel<boolean>('secret', { required: true })

defineProps<{ secretText: string }>()

const store = useAssetsStore()

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
        {{ secret ? secretText : formatMoney(store.netAssets) }}
      </div>
    </div>
    <div class="flex-1">
      <div>
        <span class="mr-3 text-sm text-gray-600">总资产</span>
        <span class="font-bold text-gray-700">
          {{ secret ? secretText : formatMoney(store.totalAssets) }}</span>
      </div>
      <div class="mt-5">
        <span class="mr-3 text-sm text-gray-600">负资产</span>
        <span class="font-bold text-gray-700">
          {{ secret ? secretText : formatMoney(store.negativeAssets) }}</span>
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
        <div>可使用资金：{{ formatMoney(store.totalAssets) }}</div>
      </div>
    </div>
  </van-overlay>
</template>
