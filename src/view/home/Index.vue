<script setup lang="ts">
import Wallet from './wallet/Index.vue'
import Ledger from './ledger/Index.vue'

import type { Account } from '@/database/index.ts'

defineOptions({ name: 'HomeView' })

const activeTabbar = useSessionStorage('active_tabbar', 0)

type ActionSheetAction = Vant.ActionSheetAction & { value: Account['type'] }
const show = ref(false)
const actions = [
  { name: '资金账户', value: '资金' },
  { name: '信贷账户', value: '信贷' },
] satisfies ActionSheetAction[]
const router = useRouter()
const ledgerRef = ref<InstanceType<typeof Ledger>>()
const { width, height } = useWindowSize()
const bubbleOffset = computed<Vant.FloatingBubbleOffset>(() => {
  return { x: width.value - 85, y: height.value - 135 }
})
function onBubbleClick() {
  const strategys = [ledgerRef.value?.addNewRecord, () => show.value = true]
  const method = strategys[activeTabbar.value]
  method?.()
}
</script>

<template>
  <van-tabs v-model:active="activeTabbar" :show-header="false" swipeable>
    <van-tab><ledger ref="ledgerRef" /></van-tab>
    <van-tab><wallet /></van-tab>
  </van-tabs>
  <van-tabbar
    v-model="activeTabbar"
    style="--van-tabbar-item-icon-margin-bottom: 0; --van-tabbar-item-icon-size: 28px"
    inactive-color="#6b7280"
  >
    <van-tabbar-item icon="home-04" icon-prefix="iconfont" />
    <van-tabbar-item icon="qianbao" icon-prefix="iconfont" />
  </van-tabbar>
  <van-floating-bubble
    style="
      --van-floating-bubble-size: 60px;
      --van-floating-bubble-z-index: 2
    "
    axis="lock"
    :offset="bubbleOffset"
    icon="plus"
    @click="onBubbleClick" />
  <van-action-sheet
    v-model:show="show"
    :actions="actions"
    close-on-click-action
    teleport="body"
    @select="(item: ActionSheetAction) => router.push({
      path: '/account/create',
      query: { type: item.value },
    })" />
</template>
