<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'
import HeaderComp from './Header.vue'

const { map } = storeToRefs(useAccountStore())

const assetsAccount = computed(() => [...map.value.values()].filter((item) => item.type === '资产'))
const creditAccount = computed(() => [...map.value.values()].filter((item) => item.type === '信贷'))
const totalAssets = computed(() => assetsAccount.value.reduce((sum, item) => {
  sum += item.balance ?? 0
  return sum
}, 0))
const totalDebt = computed(() => creditAccount.value.reduce((sum, item) => {
  sum += item.debt ?? 0
  return sum
}, 0))

const SECRET_TEXT = '****'
const secret = ref(false)
</script>

<template>
  <div class="h-screen pb-[var(--van-tabbar-height)]">
    <div class="h-full p-4">
      <header-comp v-model:secret="secret" :secret-text="SECRET_TEXT" />
      <div v-if="assetsAccount.length > 0" class="mt-4 rounded bg-white">
        <div class="flex justify-between p-4 font-bold">
          <div>资产账户</div>
          <div>{{ secret ? SECRET_TEXT : (totalAssets / 100).toFixed(2) }}</div>
        </div>
        <account-cell
          v-for="item in assetsAccount"
          :key="item.id"
          :account="item"
          :secret="secret"
          :secret-text="SECRET_TEXT"
          @click="$router.push(`/account/detail/${item.id}`)" />
      </div>
      <div v-if="creditAccount.length > 0" class="mt-4 rounded bg-white">
        <div class="flex justify-between p-4 font-bold">
          <div>信贷账户</div>
          <div>{{ secret ? SECRET_TEXT : (totalDebt / 100).toFixed(2) }}</div>
        </div>
        <account-cell
          v-for="item in creditAccount" :key="item.id"
          :account="item"
          :secret="secret"
          :secret-text="SECRET_TEXT"
          @click="$router.push(`/account/detail/${item.id}`)" />
      </div>
    </div>
  </div>
</template>
