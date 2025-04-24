<script setup lang="ts">
import { groupBy } from 'es-toolkit'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import HeaderComp from './Header.vue'
import { type LedgerRecord, useAccountStore, useLedgerRecordStore } from '@/store/index.ts'

dayjs.extend(customParseFormat)

const { list: account } = storeToRefs(useAccountStore())
const { list: ledger } = storeToRefs(useLedgerRecordStore())
const router = useRouter()
const ledgerGroup = computed(() => {
  type GroupMetaData = { income: number; expenses: number; week: string; date: string }
  const dateFormat = 'YYYY-MM-DD'
  const group = groupBy(
    ledger.value,
    (item) => item.statementDate!.format(dateFormat),
  )
  const map = new Map<GroupMetaData, LedgerRecord[]>()
  for (const [key, value] of Object.entries(group)) {
    const date = dayjs(key, dateFormat)
    const statistics = value.reduce<Pick<GroupMetaData, 'income' | 'expenses'>>(
      (statistics, item) => {
        if (item.type === '支出') { statistics.expenses += item.expenses! }
        if (item.type === '收入') { statistics.income += item.expenses! }
        return statistics
      },
      { income: 0, expenses: 0 },
    )

    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const groupMetaData: GroupMetaData = {
      ...statistics,
      date: key === dayjs().format(dateFormat)
        ? '今天'
        : key === dayjs().subtract(1, 'day').format(dateFormat)
          ? '昨天'
          : date.format('M月D日'),
      week: week[date.day()],
    }
    map.set(groupMetaData, value)
  }
  return [...map.entries()]
})

function addNewRecord() {
  if (account.value.length < 1) {
    showFailToast('请先添加一个账户')
    return
  }
  router.push('/create_record')
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
        class="mb-3 mt-4 border-emerald-500 bg-emerald-500"
        @click="addNewRecord"
      >
        添加一条新记账
      </van-button>
      <div v-for="([metaData, ledgers]) in ledgerGroup" :key="metaData.date" class="mb-2">
        <div class="flex justify-between py-2">
          <div>
            <span class="mr-4 font-bold text-black">{{ metaData.date }}</span>
            <span>{{ metaData.week }}</span>
          </div>
          <div>
            <span>收</span>
            <span class="ml-2 mr-4 text-emerald-400">
              {{ (metaData.income / 100).toFixed(2) }}
            </span>
            <span>支</span>
            <span class="ml-2 text-red-500">{{ (metaData.expenses / 100).toFixed(2) }}</span>
          </div>
        </div>
        <div class="overflow-hidden rounded bg-white">
          <bill-cell v-for="item in ledgers" :key="item.id" v-bind="item" />
        </div>
      </div>
    </div>
  </div>
</template>
