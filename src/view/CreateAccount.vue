<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'

import type { Account } from '../database/index.ts'
import type { FormInstance } from 'vant/es'

const router = useRouter()
const route = useRoute()
const store = useAccountStore()

const type = computed<Account['type']>(() => route.query.accountType === '信贷账户'
  ? '信贷'
  : '资产')
const title = computed(() => {
  switch (type.value) {
    case '资产': return '新增资产账户'
    case '信贷': return '新增信贷账户'
    default: { const _: never = type.value }
  }
})
const name = ref('')
const balance = ref<number>()
const note = ref('')
const limit = ref<number>()

const formRel = ref<FormInstance>()
async function createAccount() {
  try { await formRel.value?.validate() }
  catch { return }

  let options: Parameters<typeof store.createAccount>[0]
  switch (type.value) {
    case '信贷': {
      options = {
        name: name.value,
        note: note.value,
        type: '信贷',
        limit: Math.round((limit.value ?? 0) * 100),
        debt: Math.round((balance.value ?? 0) * 100),
      }
      break
    }
    case '资产': {
      options = {
        name: name.value,
        note: note.value,
        type: '资产',
        balance: Math.round((balance.value ?? 0) * 100),
      }
      break
    }
  }

  await store.createAccount(options)
  router.back()
}
</script>

<template>
  <van-nav-bar
    :title="title"
    left-text="取消"
    right-text="确定"
    @click-left="router.back()"
    @click-right="createAccount" />
  <div class="py-4">
    <van-form ref="formRel" label-width="2.6em">
      <van-cell-group inset>
        <van-field
          v-model="name"
          label="名称"
          placeholder="请输入账户名称"
          :rules="[{ required: true, message: '请输入账户名称' }]" />
        <van-field
          v-model.number="balance"
          label="余额"
          type="number"
          placeholder="请输入账户余额" />
        <van-field
          v-model="note"
          label="备注"
          placeholder="请输入账户备注" />
        <van-field
          v-if="type === '信贷'"
          v-model.number="limit"
          label="额度"
          type="number"
          placeholder="请输入账户额度" />
      </van-cell-group>
    </van-form>
  </div>
</template>
