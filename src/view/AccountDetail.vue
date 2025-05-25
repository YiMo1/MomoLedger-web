<script setup lang="ts">
import { differenceBy } from 'es-toolkit'

import { useBillGroup } from '@/hooks/useBillGroup.ts'
import { useAccountStore, useBillStore } from '@/store/index.ts'
import { deleteAccount as deleteAccountAPI, queryAccountById } from '@/api/index.ts'
import { formatMoney } from '@/utils/index.ts'

import type { Account } from '@/database/index.ts'

const props = defineProps<{ id: number }>()

const accountStore = useAccountStore()
const billStore = useBillStore()
const router = useRouter()

const account = ref<Account>()
onBeforeMount(async () => {
  account.value = await queryAccountById(props.id)
  account.value
    ? accountStore.map.set(props.id, account.value)
    : accountStore.map.delete(props.id)
})

const billList = computed(() => billStore.list.filter((item) => {
  switch (item.type) {
    case '支出': { return item.account.id === account.value?.id }
    case '收入': { return item.account.id === account.value?.id }
    case '转账': {
      return item.paymentAccount.id === account.value?.id ||
        item.receivingAccount.id === account.value?.id
    }
    default: { return item }
  }
}))
const billGroup = useBillGroup(billList)

async function deleteAccount() {
  if (!account.value) return
  try {
    await showConfirmDialog({
      title: '删除提示',
      message: '该账户删除后，与之关联的账单都将会被删除，请谨慎考虑',
      confirmButtonText: '继续删除',
    })
  }
  catch { return }
  await deleteAccountAPI(props.id)
  accountStore.map.delete(props.id)
  billStore.list = differenceBy(billStore.list, billList.value, (item) => item.id)
  router.back()
}
</script>

<template>
  <van-nav-bar
    :title="account?.name"
    left-arrow
    @click-left="$router.back"
  >
    <template #right>
      <el-dropdown v-if="account" trigger="click" size="large">
        <van-icon size="28px" name="ellipsis" class="block rotate-90" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="w-52" @click="$router.push(`/account/edit/${account.id}`)">
              编辑账户
            </el-dropdown-item>
            <el-dropdown-item class="w-52" @click="deleteAccount">
              删除账户
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </van-nav-bar>

  <template v-if="account">
    <div class="m-4 rounded bg-emerald-600 p-4 text-white">
      <template v-if="account.type === '资产'">
        <div>账户余额</div>
        <div class="text-xl font-bold">{{ formatMoney(account.balance) }}</div>
      </template>
      <template v-else-if="account.type === '信贷'">
        <div>剩余欠款</div>
        <div class="text-xl font-bold">{{ formatMoney(account.debt) }}</div>
        <div class="mt-2 flex justify-between">
          <div>总额度：{{ formatMoney(account.limit) }}</div>
          <div>剩余额度：{{ formatMoney(Math.max(account.limit - account.debt, 0)) }}</div>
        </div>
      </template>
    </div>

    <van-space direction="vertical" fill class="mx-4">
      <bill-cell-group
        v-for="([date, bills]) in billGroup"
        :key="date.unix()"
        :data="bills"
        :date="date"
      >
        <bill-swipe-cell v-for="bill in bills" :key="bill.id" :bill="bill" />
      </bill-cell-group>
    </van-space>
  </template>

  <van-empty v-else description="账户不存在" />
</template>
