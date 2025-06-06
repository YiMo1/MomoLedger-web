<script setup lang="ts">
import { useAccountStore } from '@/store/account.ts'

import type { Account } from '../database/index.ts'

const props = defineProps<{ type: Account['type'] }>()

const title = computed(() => {
  if (props.type === '信贷') return '新增信贷账户'
  if (props.type === '资金') return '新增资金账户'
  const never: never = props.type
  return never
})

const form = ref({
  limit: '0.00',
  debt: '0.00',
  name: '',
  note: '',
  balance: '0.00',
})

const router = useRouter()

const formRel = ref<Vant.FormInstance>()
async function onSubmit() {
  const { name, note, limit, balance, debt } = form.value
  const { type } = props
  switch (type) {
    case '信贷': {
      await useAccountStore().createAccount({
        name,
        type,
        note: note || undefined,
        debt: Math.round(Number(debt) * 100),
        limit: Math.round(Number(limit) * 100),
      })
      break
    }
    case '资金': {
      await useAccountStore().createAccount({
        name,
        type,
        note: note || undefined,
        balance: Math.round(Number(balance) * 100),
      })
      break
    }
  }
  router.back()
}

function onFailed({ errors }: { errors: { message: string }[] }) {
  showToast({ message: errors[0].message, position: 'top' })
}
</script>

<template>
  <van-nav-bar
    fixed
    placeholder
    safe-area-inset-top
    :title="title"
    left-text="取消"
    right-text="确定"
    @click-left="$router.back"
    @click-right="formRel?.submit"
  />

  <van-form
    ref="formRel"
    class="py-4"
    style="--van-cell-group-inset-radius: 4px"
    label-width="2.6em"
    validate-trigger="onSubmit"
    :show-error-message="false"
    @submit="onSubmit"
    @failed="onFailed"
  >
    <van-space direction="vertical" fill size="16px">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="名称"
          class="after:hidden"
          placeholder="请输入名称"
          :rules="[{ required: true, message: '请输入名称' }]"
        />
        <van-field
          v-if="type === '资金'"
          v-model="form.balance"
          label="余额"
          class="after:hidden"
          type="number"
          placeholder="请输入余额"
          @focus="(event: Event) => (event.target as HTMLInputElement).select()"
        />
        <van-field
          v-else-if="type === '信贷'"
          v-model="form.debt"
          label="欠款"
          type="number"
          class="after:hidden"
          placeholder="请输入欠款"
          @focus="(event: Event) => (event.target as HTMLInputElement).select()"
        />
        <van-field
          v-model="form.note"
          label="备注"
          class="after:hidden"
          placeholder="请输入备注"
        />
      </van-cell-group>

      <van-cell-group v-if="type === '信贷'" inset>
        <van-field
          v-model="form.limit"
          label="总额度"
          type="number"
          is-link
          label-width="4em"
          input-align="right"
          class="after:hidden active:bg-white"
          placeholder="请输入额度"
          @focus="(event: Event) => (event.target as HTMLInputElement).select()"
        />
      </van-cell-group>
    </van-space>
  </van-form>
</template>
