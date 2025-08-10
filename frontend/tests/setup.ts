import { vi, beforeEach } from 'vitest'

// 模擬 Nuxt 3 內建函數
vi.mock('#imports', () => ({
  defineEventHandler: vi.fn(handler => handler),
  createError: vi.fn((options) => {
    const error = new Error(options.statusMessage || 'Error')
    Object.assign(error, options)
    return error
  }),
  readBody: vi.fn(),
  assertMethod: vi.fn(),
  setResponseStatus: vi.fn(),
}))

// 設定測試環境變數
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purpose'
process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing'

// 全域測試設定
beforeEach(() => {
  vi.clearAllMocks()
})
