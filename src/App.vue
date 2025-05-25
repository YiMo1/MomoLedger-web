<script setup lang="ts">
import {
  useAccountStore,
  useAssetsDataStore,
  useBillStore,
} from './store/index.ts'

const isLoad = ref(false)

useAssetsDataStore().reload()

onBeforeMount(async () => {
  await useAccountStore().loadAccounts()
  await useBillStore().loadBill()
  isLoad.value = true
})
</script>

<template>
  <router-view v-if="isLoad" #="{Component}">
    <keep-alive include="HomeView">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
