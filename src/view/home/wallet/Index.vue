<script setup lang="ts">
import PlusIcon from '@/assets/icon/plus.svg?component'
import { useAccountStore } from '@/store/account.ts'
import HeaderComp from './Header.vue'

import type { ActionSheetAction } from 'vant'

const router = useRouter()

const { list } = storeToRefs(useAccountStore())

const assetsAccount = computed(() => list.value.filter((item) => item.type === '资产'))
const creditAccount = computed(() => list.value.filter((item) => item.type === '信贷'))
const totalAssets = computed(() => assetsAccount.value.reduce((sum, item) => {
  sum += item.balance ?? 0
  return sum
}, 0))
const totalDebt = computed(() => creditAccount.value.reduce((sum, item) => {
  sum += item.balance ?? 0
  return sum
}, 0))

const SECRET_TEXT = '****'
const secret = ref(false)
const show = ref(false)
const actions = [
  { name: '资产账户' },
  { name: '信贷账户' },
] satisfies ActionSheetAction[]
</script>

<template>
  <div class="h-screen pb-[var(--van-tabbar-height)]">
    <div class="relative h-full p-4">
      <header-comp v-model:secret="secret" :secret-text="SECRET_TEXT" />
      <div v-if="assetsAccount.length > 0" class="mt-4 rounded bg-white">
        <div class="flex justify-between p-4 font-bold">
          <div>资产账户</div>
          <div>{{ secret ? SECRET_TEXT : (totalAssets / 100).toFixed(2) }}</div>
        </div>
        <div v-for="item in assetsAccount" :key="item.id" class="flex justify-between p-4">
          <div>{{ item.name }}</div>
          <div
            :class="[
              item.balance! > 0
                ? 'text-emerald-500'
                : item.balance! < 0 ? 'text-red-500' : 'text-black',
            ]"
          >
            {{ secret ? SECRET_TEXT : (item.balance! / 100).toFixed(2) }}
          </div>
        </div>
      </div>
      <div v-if="creditAccount.length > 0" class="mt-4 rounded bg-white">
        <div class="flex justify-between p-4 font-bold">
          <div>信贷账户</div>
          <div>{{ secret ? SECRET_TEXT : (totalDebt / 100).toFixed(2) }}</div>
        </div>
        <div v-for="item in creditAccount" :key="item.id" class="flex justify-between p-4">
          <div>{{ item.name }}</div>
          <div
            :class="[
              item.balance! > 0
                ? 'text-emerald-500'
                : item.balance! < 0 ? 'text-red-500' : 'text-black',
            ]"
          >
            {{ secret ? SECRET_TEXT : (item.balance! / 100).toFixed(2) }}
          </div>
        </div>
      </div>
      <div
        :class="[
          'absolute bottom-6 right-5 flex size-16 items-center justify-center',
          'rounded-full bg-emerald-600',
        ]"
        @click="show = true"
      >
        <plus-icon class="size-10 fill-white" />
      </div>
    </div>
  </div>
  <van-action-sheet
    v-model:show="show"
    :actions="actions"
    close-on-click-action
    @select="(item) => router.push({
      path: '/create_account',
      query: { accountType: item.name },
    })" />
</template>
