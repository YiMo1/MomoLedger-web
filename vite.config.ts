import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: './src/auto-imports.d.ts',
      resolvers: [VantResolver()],
    }),
    Components({
      dts: false,
      resolvers: [VantResolver()],
    }),
  ],
})
