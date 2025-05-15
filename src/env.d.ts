declare module '*.vue'{
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

namespace Vant {
  import('vant/es')
  export type * from 'vant/es'
}
