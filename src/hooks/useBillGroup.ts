import { groupBy } from 'es-toolkit'

import { dayjs } from '@/utils/index.ts'

import type { Bill } from '@/database/index.ts'

export function useBillGroup(bills: MaybeRef<Bill[]>) {
  return computed(() => {
    const dateFormat = 'YYYY-MM-DD'
    return Object.entries(groupBy(
      toValue(bills),
      (item) => item.billTime.format(dateFormat),
    )).map(([date, list]) => [dayjs(date, dateFormat), list] as const)
  })
}
