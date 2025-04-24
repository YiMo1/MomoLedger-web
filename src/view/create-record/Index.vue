<script setup lang="ts">
import Expenses from './Expenses.vue'
import Income from './Income.vue'
import Transfer from './Transfer.vue'

import type {
  LedgerRecord,
} from '@/store/index.ts'
import type {
  ActionSheetAction,
  FormInstance,
} from 'vant/es'
import type { defineComponent } from 'vue'

type RecordType = NonNullable<LedgerRecord['type']>

const Comps: Record<RecordType, ReturnType<typeof defineComponent>> = {
  支出: Expenses,
  收入: Income,
  转账: Transfer,
}

// 类别
const type = ref<RecordType>('支出')
const showAction = ref(false)
const actions = [
  { name: '支出' },
  { name: '收入' },
  { name: '转账' },
] satisfies { name: RecordType }[]
function onActionSelect({ name }: ActionSheetAction) {
  type.value = name as RecordType
}

const instance = ref<InstanceType<typeof Expenses | typeof Income>>()
const formRef = ref<FormInstance>()
const router = useRouter()
async function onSubmit() {
  try { await formRef.value!.validate() }
  catch { return }
  await instance.value?.create()
  router.back()
}
</script>

<template>
  <van-nav-bar
    left-arrow
    right-text="添加"
    title="添加记账"
    @click-left="router.back"
    @click-right="onSubmit" />
  <van-form ref="formRef" validate-trigger="onSubmit" label-width="5em">
    <van-field
      v-model="type"
      label="类别"
      is-link
      readonly
      :rules="[{ required: true, message: '请选择类别' }]"
      @click="showAction = true" />
    <component :is="Comps[type]" ref="instance" />
  </van-form>

  <van-action-sheet
    v-model:show="showAction"
    :actions="actions"
    close-on-click-action
    cancel-text="取消"
    @select="onActionSelect" />
</template>
