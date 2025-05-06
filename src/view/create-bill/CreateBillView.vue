<script setup lang="ts">
import { noop, pick } from 'es-toolkit'
import dayjs from 'dayjs'

import { useAccountStore, useBillStore, useCategoryStore } from '@/store/index.ts'

import type { Account, Bill } from '@/database/index.ts'
import type { ActionSheetAction, PickerConfirmEventParams } from 'vant/es'

const types: Bill['type'][] = ['支出', '收入', '转账']
const billType = ref<Bill['type']>('支出')

// 类别
const { list: categoryList } = storeToRefs(useCategoryStore())
const expensesCategoryList = computed(() => {
  const category = categoryList.value.find((item) => item.text === '支出' && !item.parent)
  return category?.children ?? []
})
const incomeCategoryList = computed(() => {
  const category = categoryList.value.find((item) => item.text === '收入' && !item.parent)
  return category?.children ?? []
})
const expensesCategory = ref([expensesCategoryList.value[0]])
const incomeCategory = ref([incomeCategoryList.value[0]])

const billStore = useBillStore()
const router = useRouter()
async function submit() {
  const options = {
    note: note.value || undefined,
    amount: Number(Number(amount.value).toFixed(2)) * 100,
    billTime: billTime.value.valueOf(),
    discount: Number((discount.value ?? 0).toFixed(2)) * 100,
  } satisfies Partial<Parameters<typeof billStore.createBill>[0]>
  switch (billType.value) {
    case '支出': {
      const [leave1, leave2] = expensesCategory.value
      await billStore.createBill({
        ...options,
        type: '支出',
        account: payAccount.value.id,
        category: (leave2 || leave1).id,
      })
      break
    }
    case '收入': {
      const [leave1, leave2] = expensesCategory.value
      await billStore.createBill({
        ...pick(options, ['amount', 'billTime', 'note']),
        type: '收入',
        account: payAccount.value.id,
        category: (leave2 || leave1).id,
        commission: options.discount,
      })
      break
    }
    case '转账': {
      if (!fromAccount.value) {
        showToast('请选择转出账户')
        return
      }
      if (!toAccount.value) {
        showToast('请选择转出账户')
        return
      }
      await billStore.createBill({
        ...pick(options, ['amount', 'billTime', 'note']),
        type: '转账',
        category: 86,
        commission: options.discount,
        paymentAccount: fromAccount.value.id,
        receivingAccount: toAccount.value.id,
      })
      break
    }
    default: {
      const _: never = billType.value
    }
  }
  router.back()
}

// 账单日期
const showPopup = ref(false)
const billTime = ref(dayjs())
const displayBillTime = computed(() => {
  const dateFormat = 'YYYY-MM-DD'
  if (billTime.value.format(dateFormat) === dayjs().format(dateFormat)) return '今天'
  if (billTime.value.format(dateFormat) === dayjs().subtract(1, 'day').format(dateFormat)) {
    return '昨天'
  }
  return billTime.value.format(dateFormat)
})
const currentDate = ref(billTime.value.format('YYYY-MM-DD').split('-'))
const currentTime = ref(billTime.value.format('HH-mm').split('-'))
function onBillTimeConfirm(values: PickerConfirmEventParams[]) {
  const [{ selectedValues: dateValues }, { selectedValues: timeValues }] = values
  const args = [...dateValues, ...timeValues].map(Number) as [
    number,
    number,
    number,
    number,
    number,
  ]
  args[1] -= 1
  billTime.value = dayjs(new Date(...args))
  showPopup.value = false
}

const discountActionShow = ref(false)
const discount = ref<number>() // 折扣 | 手续费
const note = ref('') // 备注

// 金额
const amount = ref('')
function onKeyboardInput(key: string) {
  if (key === '.' && amount.value.includes('.')) return
  if (amount.value === '' && key === '.') {
    amount.value = '0.'
    return
  }
  amount.value += key
}

// 账户选择
type Action = ActionSheetAction & { value: Account }
const accountStore = useAccountStore()
const fromAccount = ref<Account>()
const toAccount = ref<Account>()
const payAccount = ref(accountStore.list[0])
const accountActionSheetShow = ref(false)
const accountActions = computed(() => accountStore.list.map<Action>((account) => {
  return { name: account.name, value: account }
}))
const onAccountSheetSelect = ref<(action: Action, index: number) => void>(noop)
const ACCOUNT_SELECT_STRATEGY_MAP = {
  FROM_ACCOUNT({ value }: Action) {
    fromAccount.value = value
  },
  TO_ACCOUNT({ value }: Action) {
    toAccount.value = value
  },
  PAY_ACCOUNT({ value }: Action) {
    payAccount.value = value
  },
} as const
function openAccountActionSheet(strategy: keyof typeof ACCOUNT_SELECT_STRATEGY_MAP) {
  accountActionSheetShow.value = true
  onAccountSheetSelect.value = ACCOUNT_SELECT_STRATEGY_MAP[strategy]
}
</script>

<template>
  <div class="flex h-screen flex-col bg-white">
    <van-nav-bar
      style="--van-nav-bar-arrow-size: 20px"
      left-arrow
      safe-area-inset-top
      @click-left="router.back"
    >
      <template #title>
        <van-tabs v-model:active="billType">
          <van-tab v-for="type in types" :key="type" :name="type">
            <template #title>
              <div class="px-4">{{ type }}</div>
            </template>
          </van-tab>
        </van-tabs>
      </template>
    </van-nav-bar>

    <van-tabs
      v-model:active="billType"
      :show-header="false"
      swipeable
      class="category-tabs h-0 flex-1 overflow-y-auto"
    >
      <van-tab name="支出">
        <bill-category-grid v-model="expensesCategory" :list="expensesCategoryList" leave2 />
      </van-tab>
      <van-tab name="收入">
        <bill-category-grid v-model="incomeCategory" :list="incomeCategoryList" />
      </van-tab>
      <van-tab name="转账">
        <div class="p-4">
          <van-cell
            :value="fromAccount?.name"
            class="rounded border border-gray-300 after:content-none"
            style="--van-cell-icon-size: 22px"
            title="转出账户"
            icon="balance-pay"
            is-link
            @click="openAccountActionSheet('FROM_ACCOUNT')" />
          <div class="my-2 text-center">
            <van-icon name="sort" size="28px" />
          </div>
          <van-cell
            :value="toAccount?.name"
            class="rounded border border-gray-300 after:content-none"
            style="--van-cell-icon-size: 22px"
            title="转入账户"
            icon="balance-pay"
            is-link
            @click="openAccountActionSheet('TO_ACCOUNT')" />
        </div>
      </van-tab>
    </van-tabs>

    <van-field
      v-model="note"
      type="textarea"
      placeholder="添加备注"
      :autosize="{ maxHeight: 168 }"
      :rows="1"
      class="flex-shrink-0 gap-5 border border-y-gray-200"
    >
      <template #extra>
        <div
          :class="[
            'max-w-[50%] overflow-hidden text-ellipsis text-xl font-bold',
            {
              'text-emerald-600': billType === '收入',
              'text-red-500': billType === '支出',
            },
          ]"
        >
          {{ amount || '0.00' }}
        </div>
      </template>
    </van-field>

    <div class="z-10 flex items-center overflow-auto bg-white">
      <div class="flex h-12 items-center gap-1 px-4 leading-none" @click="showPopup = true">
        <van-icon name="rili" class-prefix="iconfont" size="22px" />
        <span>{{ displayBillTime }}</span>
      </div>
      <div
        v-if="billType !== '转账'"
        class="flex h-12 items-center gap-1 px-4 leading-none"
        @click="openAccountActionSheet('PAY_ACCOUNT')"
      >
        <van-icon name="paid" size="22px" />
        <span>{{ payAccount.name }}</span>
      </div>
      <div
        class="flex h-12 items-center gap-1 px-4 leading-none"
        @click="discountActionShow = true"
      >
        <van-icon name="balance-pay" size="22px" />
        <span>{{ discount || (billType === '转账' ? '手续费' : '优惠') }}</span>
      </div>
    </div>

    <van-number-keyboard
      :style="{
        '--van-number-keyboard-button-background': amount ? undefined : '#e7e8e9',
        '--van-number-keyboard-button-text-color': amount ? undefined : '#000',
        '--van-number-keyboard-z-index': 0,
      }"
      class="!static"
      show
      theme="custom"
      extra-key="."
      safe-area-inset-bottom
      :hide-on-click-outside="false"
      :blur-on-close="false"
      :close-button-text="amount ? '完成' : '取消'"
      @input="onKeyboardInput"
      @delete="amount = amount.slice(0, -1)"
      @close="amount ? submit() : router.back()" />
  </div>

  <van-action-sheet
    v-model:show="discountActionShow"
    style="--van-action-sheet-header-font-size: 14px"
    teleport="body"
    :title="billType === '转账' ? '手续费' : '优惠金额'"
    safe-area-inset-bottom
    :closeable="false"
  >
    <van-field
      v-model.number="discount"
      type="number"
      :placeholder="`请输入${billType === '转账' ? '手续费' : '优惠金额'}`"
      clearable
      size="large" />
  </van-action-sheet>

  <van-action-sheet
    v-model:show="accountActionSheetShow"
    :closeable="false"
    title="选择账户"
    style="--van-action-sheet-item-line-height: 30px"
    :actions="accountActions"
    safe-area-inset-bottom
    close-on-click-action
    teleport="body"
    @select="onAccountSheetSelect" />

  <van-popup v-model:show="showPopup" destroy-on-close round position="bottom" teleport="body">
    <van-picker-group
      title="账单日期"
      :tabs="['选择日期', '选择时间']"
      next-step-text="下一步"
      @confirm="onBillTimeConfirm"
      @cancel="showPopup = false"
    >
      <van-date-picker v-model="currentDate" />
      <van-time-picker v-model="currentTime" />
    </van-picker-group>
  </van-popup>
</template>

<style>
.category-tabs .van-tabs__content {
  @apply min-h-full flex flex-col;
}
.category-tabs .van-tabs__content .van-swipe {
  @apply flex-1 overflow-y-auto;
}
.category-tabs .van-tabs__content .van-swipe .van-swipe__track {
  @apply py-4 min-h-full !h-auto;
}
</style>
