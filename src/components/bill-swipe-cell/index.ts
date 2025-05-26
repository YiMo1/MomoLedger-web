import BillSwipeCell from './BillSwipeCell.vue'

export default BillSwipeCell

declare module 'vue'{
  export interface GlobalComponents {
    BillSwipeCell: typeof BillSwipeCell
  }
}
