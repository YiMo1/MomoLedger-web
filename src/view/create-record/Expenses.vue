<script setup lang="ts">
import dayjs from 'dayjs'

import {
  useAccountStore,
  useCategoryStore,
  useLedgerRecordStore,
} from '@/store/index.ts'

import type {
  PickerColumn,
  PickerConfirmEventParams,
  PickerOption,
} from 'vant'

const recordStore = useLedgerRecordStore()
const accountStore = useAccountStore()

const note = ref('')
const expenses = ref(0)
const discount = ref<number>()

const showPopup = ref<'account' | 'statementDate' | 'category'>()

// 账户
const account = ref(accountStore.list[0])
const accountColumns = computed(() => accountStore.list.map<PickerOption>((item) => {
  return { text: item.name, value: item.id }
}))
function onAccountPickerConfrim({ selectedValues }: PickerConfirmEventParams) {
  const [accountId] = selectedValues
  account.value = accountStore.list.find((item) => item.id === accountId)!
  showPopup.value = undefined
}

// 账单日期
const statementDate = ref(dayjs())
const currentDate = ref(statementDate.value.format('YYYY-MM-DD').split('-'))
const currentTime = ref(statementDate.value.format('HH-mm').split('-'))
function onStatementDateConfirm(values: PickerConfirmEventParams[]) {
  const [{ selectedValues: dateValues }, { selectedValues: timeValues }] = values
  const args = [...dateValues, ...timeValues].
    map(Number) as [number, number, number, number, number]
  args[1] -= 1
  statementDate.value = dayjs(new Date(...args))
  showPopup.value = undefined
}

// 分类
const categoryStore = useCategoryStore()
const categoryColumns = computed(() => {
  const categorys = categoryStore.list.filter((item) => item.type === '支出')
  const map = new Map<number, PickerOption>()
  return categorys.sort((a, b) => a.id! - b.id!).reduce((pre: PickerColumn, item) => {
    const option = { text: item.text, value: item.id }
    if (item.parent === undefined) {
      pre.push(option)
      map.set(option.value!, option)
    }
    else {
      const parent = map.get(item.parent!)!
      if (parent.children === undefined) { parent.children = [] }
      parent.children.push(option)
    }
    return pre
  }, [])
})
const category = ref<{ id?: number; text?: string }>({})
function onCategoryPickerConfrim({ selectedOptions }: PickerConfirmEventParams) {
  category.value = {
    id: selectedOptions[selectedOptions.length - 1]?.value as number | undefined,
    text: selectedOptions.map((item) => item?.text).join('/'),
  }
  showPopup.value = undefined
}

async function create() {
  await recordStore.createLedgerRecord({
    type: '支出',
    category: category.value.id,
    note: note.value,
    paymentAccount: account.value.id,
    expenses: Math.round(expenses.value * 100),
    discount: discount.value && Math.round(discount.value * 100),
    createTime: Date.now(),
    statementDate: statementDate.value.toDate().getTime(),
  })
}

defineExpose({ create })
</script>

<template>
  <van-field
    v-model="account.name"
    label="账户"
    is-link
    readonly
    :rules="[{ required: true, message: '请选择账户' }]"
    @click="showPopup = 'account'" />
  <van-field
    v-model.number="expenses"
    type="number"
    label="金额"
    :min="0"
    placeholder="请输入金额"
    :rules="[{ required: true, message: '请输入金额' }]" />
  <van-field
    :model-value="statementDate.format('YYYY-MM-DD HH:mm')"
    label="账单日期"
    is-link
    readonly
    :rules="[{ required: true, message: '请选择账单日期' }]"
    @click=" showPopup = 'statementDate'" />
  <van-field
    :model-value="category.text"
    label="分类"
    is-link
    readonly
    placeholder="请选择账单分类"
    :rules="[{ required: true, message: '请选择账单分类' }]"
    @click="showPopup = 'category'" />
  <van-field
    v-model.number="discount"
    type="number"
    label="优惠"
    :min="0"
    placeholder="请输入优惠金额" />
  <van-field
    v-model="note"
    label="备注"
    placeholder="添加备注" />

  <van-popup
    :show="!!showPopup"
    destroy-on-close
    round
    position="bottom"
    teleport="body"
    @update:show="showPopup = undefined"
  >
    <van-picker
      v-if="showPopup === 'account'"
      title="账户"
      :columns="accountColumns"
      @cancel="showPopup = undefined"
      @confirm="onAccountPickerConfrim" />
    <van-picker
      v-if="showPopup === 'category'"
      title="分类"
      :columns="categoryColumns"
      @cancel="showPopup = undefined"
      @confirm="onCategoryPickerConfrim" />
    <van-picker-group
      v-if="showPopup === 'statementDate'"
      title="账单日期"
      :tabs="['选择日期', '选择时间']"
      next-step-text="下一步"
      @confirm="onStatementDateConfirm"
      @cancel=" showPopup = undefined"
    >
      <van-date-picker v-model="currentDate" />
      <van-time-picker v-model="currentTime" />
    </van-picker-group>
  </van-popup>
</template>
