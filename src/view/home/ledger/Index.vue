<script setup lang="ts">
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import HeaderComp from './Header.vue'
import { useAccountStore, useBillStore } from '@/store/index.ts'
import { useBillGroup } from '@/hooks/index.ts'

dayjs.extend(customParseFormat)

const { list: account } = storeToRefs(useAccountStore())
const { list: bill } = storeToRefs(useBillStore())
const router = useRouter()

const billGroup = useBillGroup(bill)

function addNewRecord() {
  if (account.value.length < 1) {
    showFailToast('请先添加一个账户')
    return
  }
  router.push('/create_bill')
}

defineExpose({ addNewRecord })
</script>

<template>
  <div class="h-screen pb-[var(--van-tabbar-height)] text-gray-500">
    <div class="h-full overflow-auto p-4">
      <header-comp />
      <van-button
        block
        type="primary"
        icon="balance-list-o"
        class="mb-3 mt-4"
        @click="addNewRecord"
      >
        添加一条新记账
      </van-button>
      <van-space direction="vertical" fill>
        <bill-cell-group
          v-for="([date, bills]) in billGroup"
          :key="date.unix()"
          :data="bills"
          :date="date" />
      </van-space>
    </div>
  </div>
</template>
