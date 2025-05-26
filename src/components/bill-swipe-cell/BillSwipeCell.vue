<script setup lang="ts">
import { formatMoney } from '@/utils/index.ts'

import type { Bill } from '@/database/index.ts'

const props = defineProps<{ bill: Bill }>()

const elRef = ref<HTMLDivElement>()
const offset = ref(0)
const { lengthX } = useSwipe(elRef, {
  threshold: 0,
  onSwipeStart() {
    if (elRef.value) elRef.value.style.transition = ''
  },
  onSwipe(e) {
    if (lengthX.value > 0) return
    e.stopPropagation()
    offset.value = -lengthX.value
  },
  onSwipeEnd() {
    offset.value = 0
    if (elRef.value) elRef.value.style.transition = 'all .25s ease-in-out'
  },
})
const text = computed<'取消' | '编辑' | '复制'>(() => {
  if (offset.value > 160) return '复制'
  if (offset.value > 80) return '编辑'
  return '取消'
})

const router = useRouter()
function handleBillClick() {
  switch (props.bill.type) {
    case '转账': {
      router.push(`edit_transfer_bill/${props.bill.id}`)
      break
    }
    case '支出':
    case '收入': {
      router.push(`/bill/detail/${props.bill.id}`)
      break
    }
    default: { const _: never = props.bill }
  }
}
</script>

<template>
  <div
    :class="{
      'bg-gray-300': text === '取消',
      'bg-emerald-500': text === '编辑',
      'bg-red-400': text === '复制',
    }"
    @click="handleBillClick"
  >
    <div ref="elRef" class="relative" :style="{ translate: `${offset}px` }">
      <div class="absolute left-0 top-0 flex h-full -translate-x-full items-center px-4 text-white">
        {{ text }}
      </div>
      <van-cell
        style="--van-cell-icon-size: 28px; --van-cell-line-height: 20px;"
        icon-prefix="iconfont"
        class="after:hidden"
        title-class="ml-1"
        label-class="line-clamp-2"
        :icon="bill.category.icon"
        :label="bill.note"
      >
        <template #title>
          <div>
            <span class="mr-2">{{ bill.category.text }}</span>
            <van-tag
              v-if="bill.type === '支出' && bill.discount !== 0"
              style="--van-tag-font-size: 10px;--van-tag-radius: 4px;"
              plain
              type="primary"
              class="py-0.5"
            >
              惠{{ bill.discount / 100 }}
            </van-tag>
          </div>
          <div class="text-xs/5 text-gray-500">{{ bill.billTime.format('HH:mm') }}</div>
        </template>
        <template #value>
          <div
            :class="[
              'font-bold', {
                'text-black': bill.type === '转账',
                'text-red-500': bill.type === '支出',
                'text-emerald-500': bill.type === '收入',
              },
            ]"
          >
            <span v-if="bill.type === '支出'">-</span>
            <span v-else-if="bill.type === '收入'">+</span>
            <span>{{ formatMoney(bill.amount) }}</span>
          </div>
          <div v-if="bill.type === '支出' || bill.type === '收入'">{{ bill.account.name }}</div>
          <div v-else-if="bill.type === '转账'">
            <span>{{ bill.paymentAccount.name }}</span>
            <span>→</span>
            <span>{{ bill.receivingAccount.name }}</span>
          </div>
        </template>
      </van-cell>
    </div>
  </div>
</template>
