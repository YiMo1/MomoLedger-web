<script setup lang="ts">
import { useAccountStore, useLedgerRecordStore } from './store/index.ts'

onBeforeMount(() => {
  useAccountStore().loadAccounts()
  useLedgerRecordStore().loadLedgerRecord()
})
</script>

<template>
  <router-view #="{Component}">
    <keep-alive include="HomeView">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
