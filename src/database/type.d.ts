export {}

interface Account {
  id: number
  name: string
  note: string
}

export interface AssetsAccount extends Account {
  balance: number
  type: '资产'
}

export interface CreditAccount extends Account {
  debt: number
  type: '信贷'
  limit: number
}
