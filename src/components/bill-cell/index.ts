import SFC from './BillCell.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    BillCell: typeof SFC
  }
}
