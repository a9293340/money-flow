import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: {
      semi: false,
      quotes: 'single',
      indent: 2,
    },
  },
  dirs: {
    src: [
      './components',
      './composables',
      './layouts',
      './middleware',
      './pages',
      './plugins',
      './server',
      './utils',
    ],
  },
})
  .override('nuxt/typescript/rules', {
    rules: {
    // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  })
  .override('nuxt/vue/rules', {
    rules: {
    // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  })
