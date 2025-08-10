import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAppConfig, validateEnvironment, isDevelopment, isProduction, isTest } from '~/server/utils/env'

describe('Environment Utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // 重置 process.env
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getAppConfig', () => {
    it('should throw error when required env vars are missing', () => {
      delete process.env.MONGODB_URI
      delete process.env.JWT_SECRET
      delete process.env.ENCRYPTION_KEY

      expect(() => getAppConfig()).toThrow('Required environment variable')
    })

    it('should return config with required environment variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'

      const config = getAppConfig()

      expect(config.mongodbUri).toBe('mongodb://localhost:27017/test')
      expect(config.jwtSecret).toBe('test-jwt-secret')
      expect(config.encryptionKey).toBe('test-encryption-key')
      expect(config.nodeEnv).toBe('test') // current environment
    })

    it('should use default values for optional environment variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'

      const config = getAppConfig()

      expect(config.bcryptRounds).toBe(12)
      expect(config.defaultPageSize).toBe(20)
      expect(config.maxPageSize).toBe(100)
      expect(config.appName).toBe('Personal Finance Manager')
    })

    it('should parse number environment variables correctly', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'
      process.env.BCRYPT_ROUNDS = '10'
      process.env.DEFAULT_PAGE_SIZE = '25'

      const config = getAppConfig()

      expect(config.bcryptRounds).toBe(10)
      expect(config.defaultPageSize).toBe(25)
    })

    it('should throw error for invalid number environment variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'
      process.env.BCRYPT_ROUNDS = 'invalid-number'

      expect(() => getAppConfig()).toThrow('must be a valid number')
    })
  })

  describe('validateEnvironment', () => {
    it('should return valid when all required env vars are present', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.ENCRYPTION_KEY = 'test-encryption-key'

      const result = validateEnvironment()

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return invalid when required env vars are missing', () => {
      delete process.env.MONGODB_URI
      delete process.env.JWT_SECRET

      const result = validateEnvironment()

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('environment detection functions', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development'
      expect(isDevelopment()).toBe(true)
      expect(isProduction()).toBe(false)
      expect(isTest()).toBe(false)
    })

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production'
      expect(isDevelopment()).toBe(false)
      expect(isProduction()).toBe(true)
      expect(isTest()).toBe(false)
    })

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test'
      expect(isDevelopment()).toBe(false)
      expect(isProduction()).toBe(false)
      expect(isTest()).toBe(true)
    })
  })
})
