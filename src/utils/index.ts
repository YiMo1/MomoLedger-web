import mitt from 'mitt'

type Events = {
  'delete-account': unknown
  'create-account': unknown
}
export const emitter = mitt<Events>()
