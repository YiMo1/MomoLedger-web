import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import svgLoader from 'vite-svg-loader'

function optimizeVant() {
  const includes = readdirSync('node_modules/vant/es').filter((item) => ![
    'style',
    'vue-tsx-shim.d.ts',
    'vue-sfc-shim.d.ts',
    'utils',
    'index.d.ts',
    'index.mjs',
    'composables',
  ].includes(item)).
    map((item) => `vant/es/${item}/style/index`)
  return ['vant/es', ...includes]
}

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: './src/auto-imports.d.ts',
      resolvers: [VantResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
    }),
    Components({
      dts: './src/components.d.ts',
      resolvers: [VantResolver()],
    }),
    svgLoader({ defaultImport: 'url' }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  optimizeDeps: { include: [...optimizeVant()] },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/'),
    },
  },
})
