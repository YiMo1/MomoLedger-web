// @ts-check
import { yimo } from 'eslint-config-yimo'

export default yimo({
  formatters: true,
  rules: {
    'antfu/if-newline': 'off',
    'style/max-statements-per-line': ['error', { max: 1, ignoredNodes: ['BreakStatement'] }],
  },
})
