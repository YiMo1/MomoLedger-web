import SFC from './BillSwipeCell.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    BillSwipeCell: typeof SFC
  }
}
