<script setup lang="ts">
import { useAccountStore, useLedgerRecordStore } from './store/index.ts'

onBeforeMount(() => {
  useAccountStore().loadAccounts()
  useLedgerRecordStore().loadLedgerRecord()
})
</script>

<template>
  <router-view />
</template>
