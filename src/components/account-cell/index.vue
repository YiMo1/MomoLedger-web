<script setup lang="ts">
import type { Account } from '@/database/index.ts'

defineOptions({ name: 'AccountCell' })
defineProps<{ account: Account; secret: boolean; secretText?: string }>()
</script>

<template>
  <div class="flex justify-between bg-white p-4 active:bg-slate-50">
    <div>{{ account.name }}</div>
    <div
      :class="[
        'text-black',
        {
          'text-emerald-500': account.type === '资产' && account.balance > 0,
          'text-red-500': account.type === '信贷' || account.balance < 0,
        },
      ]"
    >
      <template v-if="secret">{{ secretText }}</template>
      <template v-else-if="account.type === '信贷'">
        {{ `-${account.displayDebt}` }}
      </template>
      <template v-else-if="account.type === '资产'">
        {{ account.displayBalance }}
      </template>
    </div>
  </div>
</template>
