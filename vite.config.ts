/// <reference types="vitest" />

import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

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
      resolvers: [VantResolver(), ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
    }),
    Components({
      dts: false,
      resolvers: [VantResolver(), ElementPlusResolver()],
      globs: 'src/components/*/index.ts',
    }),
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
  test: { watch: false },
})
