<script setup lang="ts">
import {
  useAccountStore,
  useBillStore,
  useCategoryStore,
} from './store/index.ts'

const isLoad = ref(false)

onBeforeMount(() => {
  Promise.all([
    useAccountStore().loadAccounts(),
    useCategoryStore().loadCategorys(),
  ]).then(() => useBillStore().loadBill()).then(() => isLoad.value = true)
})
</script>

<template>
  <router-view v-if="isLoad" #="{Component}">
    <keep-alive include="HomeView">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
