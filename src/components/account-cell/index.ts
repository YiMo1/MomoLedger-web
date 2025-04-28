import SFC from './index.vue'

export default SFC

declare module 'vue'{
  interface GlobalComponents {
    AccountCell: typeof SFC
  }
}
