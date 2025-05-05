import SFC from './BillCellGroup.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    BillCellGroup: typeof SFC
  }
}
