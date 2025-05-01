<script setup lang="ts">
import { useBillGroup } from '@/hooks/useBillGroup.ts'
import { useAccountStore, useBillStore } from '@/store/index.ts'

const route = useRoute()
const accountStore = useAccountStore()
const billStore = useBillStore()
const accountId = computed(() => {
  const id = route.params.id
  return parseInt(Array.isArray(id) ? id[0] : id)
})
const account = computed(() => accountStore.map.get(accountId.value))
const bill = computed(() => billStore.list.filter((item) => {
  switch (item.type) {
    case '支出': { return item.account.id === account.value?.id }
    case '收入': { return item.account.id === account.value?.id }
    case '转账': {
      return item.paymentAccount.id === account.value?.id ||
        item.receivingAccount.id === account.value?.id
    }
    default: { const never: never = item; return never }
  }
}))
const billGroup = useBillGroup(bill)
</script>

<template>
  <van-nav-bar
    :title="account?.name"
    left-arrow
    @click-left="$router.back" />
  <div class="m-4 rounded bg-emerald-600 p-4 text-white">
    <template v-if="account?.type === '资产'">
      <div>账户余额</div>
      <div class="text-xl font-bold">{{ (account.balance / 100).toFixed(2) }}</div>
    </template>
    <template v-else-if="account?.type === '信贷'">
      <div>剩余欠款</div>
      <div class="text-xl font-bold">{{ (account.debt / 100).toFixed(2) }}</div>
      <div class="mt-2 flex justify-between">
        <div>总额度：{{ (account.limit / 100).toFixed(2) }}</div>
        <div>剩余额度：{{ (Math.max((account.limit - account.debt) / 100, 0)).toFixed(2) }}</div>
      </div>
    </template>
  </div>
  <van-space direction="vertical" fill class="mx-4">
    <bill-cell-group
      v-for="([date, bills]) in billGroup"
      :key="date.unix()"
      :data="bills"
      :date="date" />
  </van-space>
</template>
