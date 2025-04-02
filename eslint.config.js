import { yimo } from 'eslint-config-yimo'

export default yimo({
  vue: {
    overwrite: {
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  stylistic: {
    overwrite: {
      'stylistic/newline-per-chained-call': 'off',
    },
  },
})
