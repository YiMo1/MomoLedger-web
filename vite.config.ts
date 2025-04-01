import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: './src/auto-imports.d.ts',
      resolvers: [VantResolver()],
      imports: ['vue', 'vue-router'],
    }),
    Components({
      dts: './src/components.d.ts',
      resolvers: [VantResolver()],
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
