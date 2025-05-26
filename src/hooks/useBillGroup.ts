import { groupBy } from 'es-toolkit'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { Bill } from '@/database/index.ts'

dayjs.extend(customParseFormat)

export function useBillGroup(bills: MaybeRef<Bill[]>) {
  return computed(() => {
    const dateFormat = 'YYYY-MM-DD'
    return Object.entries(groupBy(
      toValue(bills),
      (item) => item.billTime.format(dateFormat),
    )).map(([date, list]) => [dayjs(date, dateFormat), list] as const)
  })
}
