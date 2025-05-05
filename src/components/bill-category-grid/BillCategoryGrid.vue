<script setup lang="ts">
import { chunk } from 'es-toolkit'

import GridCell from './BillCategoryGridCell.vue'

import type { Category } from '@/database/index.ts'

const value = defineModel<Category[]>({ required: true, default: () => [] })
const props = withDefaults(defineProps<{ list: Category[]; leave2?: boolean }>(), {
  leave2: false,
})
const COLUMN_COUNT = 5

const rows = computed(() => chunk(props.list, COLUMN_COUNT))
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <div v-for="(row, index) in rows" :key="index">
      <div>
        <grid-cell
          v-for="category in row"
          :key="category.id"
          class="w-1/5"
          :text="category.text"
          :icon-name="category.icon"
          :more="category.children.length > 0"
          :active="value[0] === category"
          @click="value = [category]" />
      </div>
      <div
        v-if="leave2 && row.includes(value[0])"
        class="mx-4 mt-1 grid grid-cols-5 overflow-hidden rounded bg-[#f7f7f7] py-2 text-center"
      >
        <div
          v-for="category in value[0].children"
          :key="category.id"
          @click="value[1] = category"
        >
          <van-icon
            class-prefix="iconfont"
            :name="category.icon"
            size="24px"
            :class="[
              'rounded-full p-2',
              value[1] === category ? 'bg-[#acd5c7]' : 'bg-[#f4f4f4]',
            ]" />
          <div
            :class="[
              'mt-1 text-nowrap',
              value[1] === category ? 'text-black' : 'text-[#878787]',
            ]"
          >
            {{ category.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
