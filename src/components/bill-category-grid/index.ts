import BillCategoryGrid from './BillCategoryGrid.vue'

export default BillCategoryGrid

declare module 'vue'{
  interface GlobalComponents {
    BillCategoryGrid: typeof BillCategoryGrid
  }
}
