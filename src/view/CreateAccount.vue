<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()

// eslint-disable-next-line stylistic/no-confusing-arrow
const type = computed(() => route.query.accountType === '信贷账户' ? 'credit' : 'assets')
const title = computed(() => {
  switch (type.value) {
    case 'assets': return '新增资产账户'
    case 'credit': return '新增信贷账户'
    default: { const _: never = type.value }
  }
})
const LABEL_WIDTH = '2.6em'
const name = ref('')
const balance = ref('')
const note = ref('')
const limit = ref('')

async function createAccount() {
  if (name.value === '') { showToast({ type: 'text', message: '请输入账户名称' }) }
  await accountStore.createAccount({
    name: name.value,
    balance: Math.round(Number(balance.value) * 100),
    note: note.value,
    type: type.value,
    limit: Math.round(Number(limit.value) * 100),
  })
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
    <van-form>
      <van-cell-group inset>
        <van-field
          v-model="name"
          label="名称"
          :label-width="LABEL_WIDTH"
          placeholder="请输入账户名称" />
        <van-field
          v-model="balance"
          label="余额"
          type="number"
          :label-width="LABEL_WIDTH"
          placeholder="请输入账户余额" />
        <van-field
          v-model="note"
          label="备注"
          :label-width="LABEL_WIDTH"
          placeholder="请输入账户备注" />
        <van-field
          v-if="type === 'credit'"
          v-model="limit"
          label="额度"
          type="number"
          :label-width="LABEL_WIDTH"
          placeholder="请输入账户额度" />
      </van-cell-group>
    </van-form>
  </div>
</template>
