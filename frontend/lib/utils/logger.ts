/**
 * 統一的 API 日誌工具
 * 確保所有日誌都有正確的 JSON 格式供 Cloud Run 日誌系統解析
 */

export interface ApiLogContext {
  apiUrl?: string
  method?: string
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  platform?: string
  requestId?: string
  duration?: number
  statusCode?: number
  error?: unknown
}

/**
 * 記錄 API 成功日誌
 */
export function logApiSuccess(message: string, context: ApiLogContext = {}) {
  console.log(JSON.stringify({
    level: 'INFO',
    message,
    type: 'api_success',
    timestamp: new Date().toISOString(),
    ...context,
  }))
}

/**
 * 記錄 API 警告日誌
 */
export function logApiWarning(message: string, context: ApiLogContext = {}) {
  console.warn(JSON.stringify({
    level: 'WARN',
    message,
    type: 'api_warning',
    timestamp: new Date().toISOString(),
    ...context,
  }))
}

/**
 * 記錄 API 錯誤日誌
 */
export function logApiError(message: string, context: ApiLogContext = {}) {
  console.error(JSON.stringify({
    level: 'ERROR',
    message,
    type: 'api_error',
    timestamp: new Date().toISOString(),
    error: context.error ? String(context.error) : undefined,
    ...context,
  }))
}

/**
 * 記錄認證相關日誌
 */
export function logAuthEvent(message: string, context: ApiLogContext = {}) {
  console.log(JSON.stringify({
    level: 'INFO',
    message,
    type: 'auth_event',
    timestamp: new Date().toISOString(),
    ...context,
  }))
}

/**
 * 記錄驗證失敗日誌
 */
export function logValidationError(message: string, context: ApiLogContext & { validationErrors?: string[] } = {}) {
  console.warn(JSON.stringify({
    level: 'WARN',
    message,
    type: 'validation_error',
    timestamp: new Date().toISOString(),
    ...context,
  }))
}

/**
 * 記錄安全相關日誌
 */
export function logSecurityEvent(message: string, context: ApiLogContext = {}) {
  console.warn(JSON.stringify({
    level: 'WARN',
    message,
    type: 'security_event',
    timestamp: new Date().toISOString(),
    ...context,
  }))
}
