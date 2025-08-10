// 環境變數驗證和取得工具

export interface AppConfig {
  // 資料庫
  mongodbUri: string
  
  // 安全
  jwtSecret: string
  encryptionKey: string
  bcryptRounds: number
  
  // JWT 設定
  jwtExpiresIn: string
  passwordResetExpires: string
  emailVerificationExpires: string
  
  // 應用設定
  appName: string
  appUrl: string
  frontendUrl: string
  nodeEnv: string
  
  // 分頁設定
  defaultPageSize: number
  maxPageSize: number
  
  // 檔案上傳 (未來)
  maxFileSize: number
  uploadPath: string
  allowedFileTypes: string[]
  
  // 外部 API (可選)
  exchangeRateApiKey?: string
  fcmServerKey?: string
  
  // Redis (可選)
  redisUrl?: string
  
  // 日誌
  logLevel: string
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`)
  }
  return parsed
}

export function getAppConfig(): AppConfig {
  return {
    // 資料庫
    mongodbUri: getRequiredEnv('MONGODB_URI'),
    
    // 安全
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    encryptionKey: getRequiredEnv('ENCRYPTION_KEY'),
    bcryptRounds: getNumberEnv('BCRYPT_ROUNDS', 12),
    
    // JWT 設定
    jwtExpiresIn: getOptionalEnv('JWT_EXPIRES_IN', '7d')!,
    passwordResetExpires: getOptionalEnv('PASSWORD_RESET_EXPIRES', '1h')!,
    emailVerificationExpires: getOptionalEnv('EMAIL_VERIFICATION_EXPIRES', '24h')!,
    
    // 應用設定
    appName: getOptionalEnv('APP_NAME', 'Personal Finance Manager')!,
    appUrl: getOptionalEnv('APP_URL', 'http://localhost:3000')!,
    frontendUrl: getOptionalEnv('FRONTEND_URL', 'http://localhost:3000')!,
    nodeEnv: getOptionalEnv('NODE_ENV', 'development')!,
    
    // 分頁設定
    defaultPageSize: getNumberEnv('DEFAULT_PAGE_SIZE', 20),
    maxPageSize: getNumberEnv('MAX_PAGE_SIZE', 100),
    
    // 檔案上傳
    maxFileSize: getNumberEnv('MAX_FILE_SIZE', 10485760), // 10MB
    uploadPath: getOptionalEnv('UPLOAD_PATH', './uploads')!,
    allowedFileTypes: getOptionalEnv('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/webp')!.split(','),
    
    // 外部 API (可選)
    exchangeRateApiKey: getOptionalEnv('EXCHANGE_RATE_API_KEY'),
    fcmServerKey: getOptionalEnv('FCM_SERVER_KEY'),
    
    // Redis (可選)
    redisUrl: getOptionalEnv('REDIS_URL'),
    
    // 日誌
    logLevel: getOptionalEnv('LOG_LEVEL', 'info')!
  }
}

// 快取配置避免重複驗證
let cachedConfig: AppConfig | null = null

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = getAppConfig()
  }
  return cachedConfig
}

// 驗證必要的環境變數
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    getAppConfig()
    return { valid: true, errors: [] }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown validation error')
    return { valid: false, errors }
  }
}

// 開發模式檢查
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}