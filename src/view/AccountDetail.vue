<script setup lang="ts">
import { queryAccountById } from '@/api/index.ts'
import { useBillGroup } from '@/hooks/useBillGroup.ts'
import { useAccountStore, useBillStore } from '@/store/index.ts'
import { formatMoney } from '@/utils/index.ts'

import type { Account } from '@/database/index.ts'

const props = defineProps<{ id: number }>()

const router = useRouter()
const account = ref({} as Account)

onBeforeMount(async () => {
  const result = await queryAccountById(props.id)
  if (!result) {
    showToast(`id为${props.id}的账户不存在`)
    router.replace('/')
    return
  }
  account.value = result
})

const billStore = useBillStore()
const billList = computed(() => billStore.list.filter((item) => {
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
const billGroup = useBillGroup(billList)

async function deleteAccount() {
  try {
    await showConfirmDialog({
      title: '删除提示',
      message: '该账户删除后，与之关联的账单都将会被删除，请谨慎考虑',
      confirmButtonText: '继续删除',
    })
    await useAccountStore().deleteAccount(account.value.id)
    router.back()
  }
  catch {}
}
</script>

<template>
  <van-nav-bar
    :title="account?.name"
    left-arrow
    @click-left="$router.back"
  >
    <template #right>
      <el-dropdown trigger="click" size="large">
        <van-icon size="28px" name="ellipsis" class="block rotate-90" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item class="w-52" @click="$router.push(`/account/edit/${account?.id}`)">
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

  <div class="m-4 rounded bg-emerald-600 p-4 text-white">
    <template v-if="account?.type === '资金'">
      <div>账户余额</div>
      <div class="text-xl font-bold">{{ formatMoney(account.balance) }}</div>
    </template>
    <template v-else-if="account?.type === '信贷'">
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
