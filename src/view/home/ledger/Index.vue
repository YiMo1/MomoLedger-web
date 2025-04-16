<script setup lang="ts">
import HeaderComp from './Header.vue'
</script>

<template>
  <div class="h-screen pb-[var(--van-tabbar-height)] text-gray-500">
    <div class="h-full overflow-auto p-4">
      <header-comp />
      <van-button
        block
        type="primary"
        icon="balance-list-o"
        class="mb-3 mt-4 border-emerald-500 bg-emerald-500"
        @click="$router.push('/create_record')"
      >
        添加一条新记账
      </van-button>
      <div v-for="key in 10" :key="key" class="mb-2">
        <div class="flex justify-between py-2">
          <div><span class="mr-4 font-bold text-black">今天</span>周二</div>
          <div>
            收<span class="ml-2 mr-4 text-emerald-400">0.00</span>
            支<span class="ml-2 text-red-500">27.00</span>
          </div>
        </div>
        <div class="overflow-hidden rounded bg-white ">
          <div class="px-4 py-2">
            <div class="flex justify-between text-base">
              <div class="text-gray-900">还款</div>
              <div class="font-bold text-black">1352.82</div>
            </div>
            <div class="flex justify-between leading-normal">
              <div>12:33</div>
              <div>支付宝->花呗</div>
            </div>
          </div>
          <div class="px-4 py-2">
            <div class="flex justify-between text-base">
              <div class="text-gray-900">还款</div>
              <div class="font-bold text-black">1352.82</div>
            </div>
            <div class="flex justify-between leading-normal">
              <div>12:33</div>
              <div>支付宝->花呗</div>
            </div>
          </div>
          <div class="px-4 py-2">
            <div class="flex justify-between text-base">
              <div class="text-gray-900">还款</div>
              <div class="font-bold text-black">1352.82</div>
            </div>
            <div class="flex justify-between leading-normal">
              <div>12:33</div>
              <div>支付宝->花呗</div>
            </div>
          </div>
          <div />
        </div>
      </div>
    </div>
  </div>
</template>
