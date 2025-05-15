import mitt from 'mitt'

type Events = {
  'delete-account': unknown
  'create-account': unknown
  'create-bill': unknown
}
export const emitter = mitt<Events>()
