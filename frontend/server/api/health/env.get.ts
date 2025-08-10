import { validateEnvironment, getConfig, isDevelopment } from '../../utils/env'

export default defineEventHandler(async (event) => {
  try {
    const validation = validateEnvironment()

    if (!validation.valid) {
      setResponseStatus(event, 500)
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        errors: validation.errors,
      }
    }

    const config = getConfig()

    // 在生產環境隱藏敏感資訊
    const sanitizedConfig = {
      appName: config.appName,
      nodeEnv: config.nodeEnv,
      appUrl: config.appUrl,
      frontendUrl: config.frontendUrl,
      defaultPageSize: config.defaultPageSize,
      maxPageSize: config.maxPageSize,
      maxFileSize: config.maxFileSize,
      logLevel: config.logLevel,
      // 顯示是否設定了可選的環境變數，但不顯示值
      hasExchangeRateApiKey: !!config.exchangeRateApiKey,
      hasFcmServerKey: !!config.fcmServerKey,
      hasRedisUrl: !!config.redisUrl,
      // 敏感資訊只在開發模式下顯示部分
      ...(isDevelopment() && {
        mongodbUri: config.mongodbUri.replace(/\/\/[^@]+@/, '//***:***@'), // 隱藏用戶名密碼
        jwtSecretLength: config.jwtSecret.length,
        encryptionKeyLength: config.encryptionKey.length,
      }),
    }

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      config: sanitizedConfig,
    }
  }
  catch (error) {
    console.error('Environment health check failed:', error)

    setResponseStatus(event, 500)
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
