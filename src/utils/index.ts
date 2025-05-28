import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(customParseFormat)

export { dayjs }

export function formatMoney(input: number) {
  return (input / 100).toFixed(2)
}
