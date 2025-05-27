import mitt from 'mitt'

type Events = {
  'create-bill': unknown
}
export const emitter = mitt<Events>()
export function formatMoney(input: number) {
  return (input / 100).toFixed(2)
}
