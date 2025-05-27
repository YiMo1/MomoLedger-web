import AccountSelectPopup from './AccountSelectPopup.vue'

export default AccountSelectPopup

declare module 'vue' {
  export interface GlobalComponents {
    AccountSelectPopup: typeof AccountSelectPopup
  }
}
