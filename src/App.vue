<script setup lang="ts">
import { useAccountStore } from './store/index.ts'

onBeforeMount(() => { useAccountStore().loadAccounts() })
</script>

<template>
  <router-view />
</template>
