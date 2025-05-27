<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'
import { formatMoney } from '@/utils/index.ts'

import type { Account } from '@/database/index.ts'

const show = defineModel('show', { type: Boolean })
const emits = defineEmits<{ select: [account: Account] }>()

const store = useAccountStore()

onBeforeRouteLeave(() => !show.value)

function onClick(account: Account) {
  show.value = false
  emits('select', account)
}
</script>

<template>
  <van-popup
    v-model:show="show"
    teleport="body"
    position="bottom"
    round
    safe-area-inset-bottom
    close-on-popstate
    style="--van-popup-round-radius: 8px"
  >
    <div class="p-4 font-bold">选择账户</div>
    <ul>
      <li
        v-for="item in store.list"
        :key="item.id"
        class="flex h-14 items-center justify-between px-4 py-3 active:bg-gray-100"
        @click="onClick(item)"
      >
        <div>{{ item.name }}</div>
        <div v-if="item.type === '信贷'" class="text-right">
          <div
            :class="{
              'text-black': item.debt === 0,
              'text-red-500': item.debt > 0,
            }"
          >
            {{ formatMoney(item.debt) }}
          </div>
          <div class="text-xs/5 text-gray-400">可用：{{ formatMoney(item.limit - item.debt) }}</div>
        </div>
        <div
          v-else-if="item.type === '资产'" :class="{
            'text-black': item.balance === 0,
            'text-red-500': item.balance < 0,
            'text-emerald-500': item.balance > 0,
          }"
        >
          {{ formatMoney(item.balance) }}
        </div>
      </li>
    </ul>
  </van-popup>
</template>
