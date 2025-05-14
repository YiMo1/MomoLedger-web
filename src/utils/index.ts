import mitt from 'mitt'

import type { Account } from '@/database/index.ts'

type Events = {
  'reload-assets-data': Account
}
export const emitter = mitt<Events>()
