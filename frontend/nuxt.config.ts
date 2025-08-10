// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  // Modules 配置
  modules: [
    '@nuxt/devtools',
    '@nuxt/eslint',
  ],

  // 服務端渲染配置
  ssr: true,
  devtools: { enabled: true },

  // CSS 配置
  css: [],

  // Runtime 配置
  runtimeConfig: {
    // Server-side 環境變數 (只在 server 端可用)
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,

    // Public 環境變數 (client 和 server 都可用)
    public: {
      appName: process.env.APP_NAME || 'Personal Finance Manager',
      apiUrl: process.env.API_URL || '',
    },
  },
  compatibilityDate: '2025-07-15',

  // Nitro 配置
  nitro: {
    experimental: {
      wasm: true,
    },
    // 確保在生產環境中正確處理
    preset: 'node-server',
  },

  // TypeScript 配置
  typescript: {
    typeCheck: true,
  },

  // ESLint 配置
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
