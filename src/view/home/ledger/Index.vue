<script setup lang="ts">
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import HeaderComp from './Header.vue'
import { useAccountStore, useBillStore } from '@/store/index.ts'
import { useBillGroup } from '@/hooks/index.ts'

import type { Bill } from '@/database/index.ts'

dayjs.extend(customParseFormat)

const { map: account } = storeToRefs(useAccountStore())
const { list: billList } = storeToRefs(useBillStore())
const router = useRouter()

const billGroup = useBillGroup(billList)

function addNewRecord() {
  if (account.value.size < 1) {
    showFailToast('请先添加一个账户')
    return
  }
  router.push('/create_bill')
}

function handleBillClick(bill: Bill, position: Vant.SwipeCellPosition) {
  if (position !== 'cell') return
  switch (bill.type) {
    case '转账': {
      router.push(`edit_transfer_bill/${bill.id}`)
      break
    }
    case '支出':
    case '收入': {
      router.push(`/bill/detail/${bill.id}`)
      break
    }
    default: { const _: never = bill }
  }
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
          :date="date"
        >
          <bill-swipe-cell
            v-for="bill in bills"
            :key="bill.id"
            :bill="bill"
            @click="handleBillClick(bill, $event)" />
        </bill-cell-group>
      </van-space>
    </div>
  </div>
</template>
