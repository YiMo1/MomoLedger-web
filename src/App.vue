<script setup lang="ts">
import HomeIcon from './assets/icon/家.svg?component'
import WalletIcon from './assets/icon/钱包.svg?component'

const activeTabbar = ref(0)
</script>

<template>
  <van-tabbar v-model="activeTabbar" style="--van-tabbar-item-icon-margin-bottom: 0">
    <van-tabbar-item>
      <template #icon="{ active }">
        <home-icon :class="['size-7', active ? 'fill-emerald-600' : 'fill-gray-500']" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item>
      <template #icon="{ active }">
        <wallet-icon :class="['size-7', active ? 'fill-emerald-600' : 'fill-gray-500']" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>
