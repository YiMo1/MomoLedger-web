import { yimo } from 'eslint-config-yimo'

export default yimo({
  vue: {
    overwrite: {
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
})
