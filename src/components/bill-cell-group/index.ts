import SFC from './index.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    BillCellGroup: typeof SFC
  }
}
