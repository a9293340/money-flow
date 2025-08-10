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

  // 應用程式 HEAD 配置
  app: {
    head: {
      title: 'Money Flow - 個人財務管理',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Money Flow 是一個簡約時尚的個人財務管理應用，幫助您輕鬆追蹤收支並管理財務目標。' },
        { name: 'keywords', content: '記帳, 財務管理, 個人理財, Money Flow, 收支管理' },
        { name: 'author', content: 'Money Flow Team' },
        { name: 'theme-color', content: '#1E40AF' },
        { name: 'msapplication-TileColor', content: '#1E40AF' },
        { property: 'og:title', content: 'Money Flow - 個人財務管理' },
        { property: 'og:description', content: '簡約時尚的個人財務管理應用，輕鬆追蹤收支並管理財務目標。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/android-chrome-512x512.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  // Runtime 配置
  runtimeConfig: {
    // Server-side 環境變數 (只在 server 端可用)
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,

    // Public 環境變數 (client 和 server 都可用)
    public: {
      appName: process.env.APP_NAME || 'Money Flow',
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
