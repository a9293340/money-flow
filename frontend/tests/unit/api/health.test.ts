import { describe, it, expect, beforeEach } from 'vitest'

describe('Health Check APIs', () => {
  describe('/api/health/env', () => {
    beforeEach(() => {
      // 設定測試環境變數
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'
      process.env.NODE_ENV = 'test'
    })

    it('should return environment health status', async () => {
      // 基本測試：確保函數可以載入
      const { validateEnvironment } = await import('~/server/utils/env')

      const result = validateEnvironment()

      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(typeof result.valid).toBe('boolean')
      expect(Array.isArray(result.errors)).toBe(true)
    })
  })

  describe('Configuration Validation', () => {
    it('should validate required configuration fields', async () => {
      const { getAppConfig } = await import('~/server/utils/env')

      // 設定最小必要環境變數
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long'
      process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long'

      const config = getAppConfig()

      // 驗證必要欄位存在
      expect(config.mongodbUri).toBeDefined()
      expect(config.jwtSecret).toBeDefined()
      expect(config.encryptionKey).toBeDefined()
      expect(config.nodeEnv).toBeDefined()

      // 驗證類型
      expect(typeof config.mongodbUri).toBe('string')
      expect(typeof config.jwtSecret).toBe('string')
      expect(typeof config.encryptionKey).toBe('string')
      expect(typeof config.bcryptRounds).toBe('number')
    })
  })
})
