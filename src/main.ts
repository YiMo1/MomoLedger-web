import { createApp } from 'vue'

import App from './App.vue'
import router from './router.ts'
import pinia from './store/index.ts'
import './style/index.ts'

createApp(App).use(router).use(pinia).mount('#app')
