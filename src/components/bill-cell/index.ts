import SFC from './index.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    BillCell: typeof SFC
  }
}
