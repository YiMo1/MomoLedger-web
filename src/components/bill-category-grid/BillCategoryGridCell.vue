<script setup lang="ts">
import { isUndefined } from 'es-toolkit'

const props = withDefaults(defineProps<{
  text: string
  iconName?: string
  active?: boolean
  more?: boolean
}>(), {
  active: false,
  more: false,
})
const firstChar = computed(() => {
  const char = props.text.codePointAt(0)
  return isUndefined(char) ? '无' : String.fromCodePoint(char)
})
const offset: [number, number] = [-6, -8]
</script>

<template>
  <div class="inline-block p-1 text-center">
    <van-badge
      position="bottom-right"
      :offset="offset"
      style="--van-badge-background: initial; --van-badge-border-width: initial"
    >
      <div
        :class="[
          'mb-0.5 inline-block size-11 rounded-full p-2 leading-none',
          active ? 'bg-[#acd5c7]' : 'bg-[#f4f4f4]',
        ]"
      >
        <van-icon
          v-if="iconName"
          class-prefix="iconfont"
          :name="iconName"
          size="28px" />
        <div v-else class="size-7 py-0.5 text-2xl/none">
          {{ firstChar }}
        </div>
      </div>
      <template #content>
        <van-icon
          v-if="more"
          name="more"
          size="14px"
          :color="active ? '#63aa92' : '#92dac2'"
          class="size-[18px] rounded-full bg-white p-0.5" />
      </template>
    </van-badge>
    <div :class="['mt-1', active ? 'text-black' : 'text-[#878787]']">{{ text }}</div>
  </div>
</template>
