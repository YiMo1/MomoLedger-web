<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'
import HeaderComp from './Header.vue'
import { formatMoney } from '@/utils/index.ts'

const { list } = storeToRefs(useAccountStore())

const assetsAccount = computed(() => list.value.filter((item) => item.type === '资产'))
const creditAccount = computed(() => list.value.filter((item) => item.type === '信贷'))
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
          <div>{{ secret ? SECRET_TEXT : formatMoney(totalAssets) }}</div>
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
          <div>{{ secret ? SECRET_TEXT : formatMoney(totalDebt) }}</div>
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
