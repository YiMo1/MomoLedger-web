export type Account = {
  id: number
  name: string
  balance: number
  note: string
  type: 'assets' | 'credit'
  limit?: number
}
