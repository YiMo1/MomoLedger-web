<script setup lang="ts">
import dayjs from 'dayjs'

import { useAccountStore, useBillStore } from '@/store/index.ts'

import type { Account, ExpensesBill, IncomeBill } from '@/database/index.ts'

const store = useBillStore()
const route = useRoute()
const router = useRouter()
const bill = store.map.get(Number(route.params.id)) as ExpensesBill | IncomeBill

async function deleteBill() {
  try {
    await showDialog({ title: '删除账单', message: '确定要删除该条记录吗', showCancelButton: true })
    await store.deleteBill(bill.id)
    router.back()
  }
  catch { }
}

const categoryText = computed(() => {
  if (bill.category.parent) {
    return `${bill.category.parent.text}-${bill.category.text}`
  }
  return bill.category.text
})
const amount = computed(() => `${bill.type === '支出' ? '-' : '+'}${bill.displayAmount}`)
const discount = computed(() => bill.type === '支出' ? bill.displayDiscount : bill.displayCommission)

const noteActionShow = ref(false)
const note = ref(bill.note)
function saveNote() {
  bill.note = note.value || undefined
  noteActionShow.value = false
  store.updateBill(bill)
}

// 账户选择
type Action = Vant.ActionSheetAction & { value: Account }
const accountStore = useAccountStore()
const accountActionSheetShow = ref(false)
const accountActions = computed(() => [...accountStore.map.values()].map<Action>((account) => {
  return { name: account.name, value: account }
}))
function onAccountSheetSelect(action: Action) {
  if (bill.account.id === action.value.id) return
  switch (bill.type) {
    case '支出': {
      bill.account.income(bill.amount)
      accountStore.updateAccount(bill.account.structured())
      action.value.expenses(bill.amount)
      accountStore.updateAccount(action.value.structured())
      break
    }
    case '收入': {
      bill.account.expenses(bill.amount)
      accountStore.updateAccount(bill.account.structured())
      action.value.income(bill.amount)
      accountStore.updateAccount(action.value.structured())
      break
    }
    default: { const _: never = bill }
  }
  bill.account = action.value
  store.updateBill(bill)
}

// 账单日期
const showPopup = ref(false)
const currentDate = ref(bill.billTime.format('YYYY-MM-DD').split('-'))
const currentTime = ref(bill.billTime.format('HH-mm').split('-'))
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
  bill.billTime = dayjs(new Date(...args))
  store.updateBill(bill)
  showPopup.value = false
}
</script>

<template>
  <van-nav-bar
    title="账单详情"
    style="--van-nav-bar-arrow-size: 26px"
    left-arrow
    fixed
    safe-area-inset-top
    placeholder
    @click-left="router.back"
  >
    <template #right>
      <van-icon
        name="delete-o"
        size="24px"
        color="#000"
        @click="deleteBill" />
    </template>
  </van-nav-bar>
  <van-cell-group inset class="mt-4">
    <van-cell
      style="
        --van-cell-icon-size: 28px;
        --van-cell-line-height: 28px;
        --van-cell-font-size: 16px;
        --van-cell-value-font-size: 16px;
        --van-cell-value-color: #000;
        --van-cell-vertical-padding: 14px;
      "
      icon-prefix="iconfont"
      class="after:hidden"
      title-class="ml-3"
      value-class="font-bold"
      :icon="bill.category.icon"
      :title="categoryText"
      :value="amount" />
  </van-cell-group>
  <van-cell-group inset class="mt-4" style="--van-cell-value-color: #000;">
    <van-cell
      v-if="bill.type === '支出' ? bill.discount : bill.commission"
      title="优惠金额" class="after:hidden"
      :value="discount" />
    <van-cell
      title="账单日期"
      class="after:hidden"
      :value="bill.billTime.format('YYYY年MM月DD日 HH:ss')"
      @click="showPopup = true" />
    <van-cell
      title="收支账户"
      class="after:hidden"
      :value="bill.account.name"
      @click="accountActionSheetShow = true" />
    <van-field
      v-model="bill.note"
      type="textarea"
      readonly
      :rows="1"
      autosize
      class="after:hidden"
      label="备注"
      input-align="right"
      placeholder="无"
      @click-input="noteActionShow = true" />
    <van-cell
      title="记录时间"
      class="after:hidden"
      :value="bill.createTime.format('YYYY年MM月DD日 HH:mm')" />
  </van-cell-group>

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

  <van-action-sheet
    v-model:show="noteActionShow"
    style="--van-action-sheet-header-font-size: 14px"
    teleport="body"
    safe-area-inset-bottom
    :closeable="false"
    @open="note = bill.note"
  >
    <div class="flex items-center justify-between p-4">
      <div class="font-bold">备注</div>
      <div @click="saveNote">保存</div>
    </div>
    <van-field
      v-model="note"
      type="textarea"
      :rows="1"
      autosize
      placeholder="请输入账单备注"
      clearable
      size="large" />
  </van-action-sheet>
</template>
