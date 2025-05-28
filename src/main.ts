import { createApp } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import App from './App.vue'
import router from './router.ts'
import pinia from './store/index.ts'
import './style/index.ts'

dayjs.locale('zh-cn')

createApp(App).use(router).use(pinia).mount('#app')
