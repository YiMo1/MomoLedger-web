<script setup lang="ts">
import { useAccountStore } from '@/store/index.ts'

const route = useRoute()
const router = useRouter()
const store = useAccountStore()

const account = store.map.get(Number(route.params.id))!

const name = ref('')
const debt = ref(0)
const limit = ref(0)
const balance = ref(0)
const note = ref('')

const navTitle = computed(() => `编辑${name.value}账户`)

onBeforeMount(() => {
  name.value = account.name
  note.value = account.note
  switch (account.type) {
    case '信贷': {
      debt.value = account.debt / 100
      limit.value = account.limit / 100
      break
    }
    case '资产': {
      balance.value = account.balance / 100
      break
    }
    default: { const _: never = account }
  }
})

const formRel = ref<Vant.FormInstance>()
async function submit() {
  try { await formRel.value?.validate() }
  catch { return }

  let options: Parameters<typeof store.updateAccount>[0]
  switch (account.type) {
    case '信贷': {
      options = {
        type: '信贷',
        id: account.id,
        name: name.value,
        note: note.value,
        limit: Math.round((limit.value ?? 0) * 100),
        debt: Math.round((balance.value ?? 0) * 100),
      }
      break
    }
    case '资产': {
      options = {
        id: account.id,
        name: name.value,
        note: note.value,
        type: '资产',
        balance: Math.round((balance.value ?? 0) * 100),
      }
      break
    }
  }

  await store.updateAccount(options)
  router.back()
}
</script>

<template>
  <van-nav-bar
    :title="navTitle"
    right-text="编辑"
    fixed
    placeholder
    safe-area-inset-top
    @click-right="submit"
    @click-left="$router.back"
  >
    <template #left>
      <van-icon name="cross" size="24px" />
    </template>
    <template #right>
      <van-icon name="success" size="24px" />
    </template>
  </van-nav-bar>
  <van-form ref="formRel" label-width="2.6em">
    <van-cell-group>
      <van-field
        v-model="name"
        label="名称"
        placeholder="请输入账户名称"
        :rules="[{ required: true, message: '请输入账户名称' }]" />
      <van-field
        v-if="account.type === '资产'"
        v-model.number="balance"
        label="余额"
        type="number"
        placeholder="请输入账户余额" />
      <template v-else-if="account.type === '信贷'">
        <van-field v-model.number="debt" type="number" label="欠款" />
        <van-field v-model.number="limit" type="number" label="额度" />
      </template>
      <van-field v-model="note" label="备注" placeholder="请输入备注" />
    </van-cell-group>
  </van-form>
</template>
