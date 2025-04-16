<script setup lang="ts">
import WalletIcon from '../../assets/icon/钱包.svg?component'
import LedgerIcon from '../../assets/icon/家.svg?component'
import Wallet from './wallet/Index.vue'
import Ledger from './ledger/Index.vue'

const activeTabbar = ref(0)
</script>

<template>
  <van-tabs v-model:active="activeTabbar" :show-header="false" swipeable>
    <van-tab><ledger /></van-tab>
    <van-tab><wallet /></van-tab>
  </van-tabs>
  <van-tabbar v-model="activeTabbar" style="--van-tabbar-item-icon-margin-bottom: 0">
    <van-tabbar-item>
      <template #icon="{ active }">
        <ledger-icon :class="['size-7', active ? 'fill-emerald-600' : 'fill-gray-500']" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item>
      <template #icon="{ active: isActive }">
        <wallet-icon :class="['size-7', isActive ? 'fill-emerald-600' : 'fill-gray-500']" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>
