<script setup lang="ts">
import dayjs from 'dayjs'

import {
  useAccountStore,
  useLedgerRecordStore,
} from '@/store/index.ts'

import type {
  PickerConfirmEventParams,
  PickerOption,
} from 'vant'
import type { Account } from '@/utils/database.ts'

const recordStore = useLedgerRecordStore()
const accountStore = useAccountStore()

const note = ref('')
const expenses = ref(0)
const discount = ref<number>()

const showPopup = ref<'transferOutAccount' | 'statementDate' | 'transferToAccount'>()

const accountColumns = computed(() => accountStore.list.map<PickerOption>((item) => {
  return { text: item.name, value: item.id }
}))
const transferOutAccount = ref<Account>() // 转出账户
const transferToAccount = ref<Account>() // 转出账户
function onAccountPickerConfrim({ selectedValues }: PickerConfirmEventParams) {
  const [accountId] = selectedValues
  const account = accountStore.list.find((item) => item.id === accountId)!
  if (showPopup.value === 'transferOutAccount') { transferOutAccount.value = account }
  else if (showPopup.value === 'transferToAccount') { transferToAccount.value = account }
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

async function create() {
  await recordStore.createLedgerRecord({
    type: '转账',
    note: note.value,
    paymentAccount: transferOutAccount.value?.id,
    receivingAccount: transferToAccount.value?.id,
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
    :model-value="transferOutAccount?.name"
    label="转出账户"
    is-link
    readonly
    :rules="[{ required: true, message: '请选择转出账户' }]"
    @click="showPopup = 'transferOutAccount'" />
  <van-field
    :model-value="transferToAccount?.name"
    label="转入账户"
    is-link
    readonly
    :rules="[{ required: true, message: '请选择转入账户' }]"
    @click="showPopup = 'transferToAccount'" />
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
    v-model.number="discount"
    type="number"
    label="手续费"
    :min="0"
    placeholder="请输入手续费" />
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
      v-if="showPopup === 'transferOutAccount' || showPopup === 'transferToAccount'"
      :title="showPopup === 'transferOutAccount' ? '转出账户' : '转入账户'"
      :columns="accountColumns"
      @cancel="showPopup = undefined"
      @confirm="onAccountPickerConfrim" />
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
