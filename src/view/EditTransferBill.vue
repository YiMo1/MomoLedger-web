<script setup lang="ts">
import { dayjs } from '@/utils/index.ts'
import { useBillStore } from '@/store/index.ts'

import type { Account, TransferBill } from '@/database/index.ts'

const store = useBillStore()
const route = useRoute()
const router = useRouter()
const bill = store.map.get(Number(route.params.id)) as TransferBill

const fromAccount = ref(bill.paymentAccount)
const toAccount = ref(bill.receivingAccount)
const showAccountSelect = ref(false)
const status = ref<'to' | 'from'>('from')
function onAccountSelect(account: Account) {
  switch (status.value) {
    case 'from': { fromAccount.value = account; break }
    case 'to': { toAccount.value = account; break }
    default: { const _: never = status.value }
  }
}
function openAccountSelect(metadata: 'to' | 'from') {
  showAccountSelect.value = true
  status.value = metadata
}

const amount = ref(bill.amount / 100)
const commission = ref(bill.commission / 100)
const billTime = ref(bill.billTime.clone())
const note = ref(bill.note ?? '')

const showPopup = ref(false)
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
function onBillTimeConfirm(values: Vant.PickerConfirmEventParams[]) {
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

async function submit() {
  await store.updateTransferBill({
    id: bill.id,
    amount: amount.value * 100,
    billTime: billTime.value.valueOf(),
    note: note.value || undefined,
    paymentAccount: fromAccount.value.id,
    commission: commission.value * 100,
    receivingAccount: toAccount.value.id,
  })
  router.back()
}

async function deleteBill() {
  try {
    await showDialog({ title: '删除账单', message: '确定要删除该条记录吗', showCancelButton: true })
    await store.deleteBill(bill.id)
    router.back()
  }
  catch { }
}
</script>

<template>
  <van-nav-bar title="转账" fixed placeholder safe-area-inset-top @click-left="router.back">
    <template #left>
      <van-icon name="cross" size="24px" color="#000" />
    </template>
    <template #right>
      <van-icon
        name="delete-o"
        size="24px"
        color="#000"
        class="mr-5"
        @click="deleteBill" />
      <van-icon name="success" size="24px" color="#000" @click="submit" />
    </template>
  </van-nav-bar>
  <van-form>
    <van-space
      fill
      direction="vertical"
      size="16px"
      class="mt-4"
      style="--van-cell-group-inset-radius: 4px;--van-field-label-margin-right: 16px"
    >
      <van-cell-group inset>
        <van-field
          input-align="right"
          class="after:hidden"
          label="转出账户"
          readonly
          :model-value="fromAccount.name"
          @click="openAccountSelect('from')" />
        <van-field
          input-align="right"
          class="after:hidden"
          label="转入账户"
          readonly
          :model-value="toAccount.name"
          @click="openAccountSelect('to')" />
      </van-cell-group>
      <van-cell-group inset>
        <van-field
          v-model.number="amount"
          placeholder="请输入转账金额（不含手续费）"
          label="金额"
          type="number"
          label-width="3em"
          label-align="right"
          class="after:hidden" />
        <van-field
          v-model.number="commission"
          label="手续费"
          placeholder="由转出账户扣除"
          label-width="3em"
          label-align="right"
          type="number"
          class="after:hidden" />
        <van-field
          label="日期"
          label-width="3em"
          class="after:hidden"
          label-align="right"
          :model-value="displayBillTime"
          readonly
          @click="showPopup = true" />
        <van-field
          v-model="note"
          label="备注"
          placeholder="请输入备注"
          label-width="3em"
          label-align="right"
          type="textarea"
          :rows="1"
          autosize
          class="after:hidden" />
      </van-cell-group>
    </van-space>
  </van-form>

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

  <account-select-popup v-model:show="showAccountSelect" @select="onAccountSelect" />
</template>
