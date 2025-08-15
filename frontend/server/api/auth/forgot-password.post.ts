import { z } from 'zod'
import { readBody, getHeader, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { sendPasswordResetEmail } from '~/lib/utils/email'
import {
  logApiError,
  logValidationError,
  logSecurityEvent,
  logAuthEvent,
  type ApiLogContext,
} from '~/lib/utils/logger'

// 忘記密碼驗證 Schema
const forgotPasswordSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
})

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const apiUrl = '/api/auth/forgot-password'
  const method = 'POST'
  const clientIP = getClientIP(event)
  const userAgent = getHeader(event, 'user-agent') || 'unknown'
  const platform = getHeader(event, 'x-client-platform') || 'unknown'

  const logContext: ApiLogContext = {
    apiUrl,
    method,
    ip: clientIP,
    userAgent,
    platform,
  }

  try {
    // 連接資料庫
    await connectMongoDB()

    // 讀取請求資料
    const body = await readBody(event)

    // Zod 驗證
    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message)

      logValidationError('忘記密碼資料驗證失敗', {
        ...logContext,
        validationErrors: errors,
        email: body?.email || 'unknown',
      })

      return {
        success: false,
        message: '輸入資料驗證失敗',
        errors,
      }
    }

    const { email } = validationResult.data

    // 查找使用者
    const user = await User.findOne({ email: email.toLowerCase() })

    // 基於安全考量：無論使用者是否存在，都返回相同的成功訊息
    // 避免攻擊者透過此端點探測有效的電子郵件地址
    const successResponse = {
      success: true,
      message: '如果該電子郵件地址已註冊，您將收到密碼重置指示',
    }

    if (!user) {
      // 記錄安全事件但不透露使用者不存在
      logSecurityEvent('密碼重置請求 - 使用者不存在', {
        ...logContext,
        email: email.toLowerCase(),
      })

      // 延遲回應以防止時間攻擊
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
      return successResponse
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked && user.isLocked()) {
      logSecurityEvent('密碼重置請求 - 帳戶被鎖定', {
        ...logContext,
        email: email.toLowerCase(),
        userId: user._id.toString(),
      })

      return {
        success: false,
        message: '帳戶已被暫時鎖定，請稍後再試',
        errors: ['帳戶已被暫時鎖定'],
      }
    }

    // 生成密碼重置 Token
    const resetToken = await user.generatePasswordResetToken()
    await user.save()

    // 構建重置 URL
    const appUrl = getAppUrl()
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // 發送重置郵件
    const emailSent = await sendPasswordResetEmail({
      to: email,
      name: user.profile.name,
      resetToken,
      resetUrl,
    })

    if (!emailSent) {
      logApiError('密碼重置郵件發送失敗', {
        ...logContext,
        userId: user._id.toString(),
        email: email.toLowerCase(),
      })

      return {
        success: false,
        message: '郵件發送失敗，請稍後再試',
        errors: ['郵件服務暫時不可用'],
      }
    }

    // 記錄成功的密碼重置請求
    const duration = Date.now() - startTime
    logAuthEvent('密碼重置請求成功', {
      ...logContext,
      userId: user._id.toString(),
      email: user.email,
      duration,
      statusCode: 200,
    })

    return successResponse
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime

    logApiError('忘記密碼 API 發生錯誤', {
      ...logContext,
      error,
      duration,
      statusCode: 500,
    })

    return {
      success: false,
      message: '處理密碼重置請求時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})

// 輔助函數：獲取應用程式 URL
function getAppUrl(): string {
  const isDev = process.env.NODE_ENV === 'development'
  const productionDomain = process.env.PRODUCTION_DOMAIN

  if (isDev || !productionDomain) {
    return 'http://localhost:3000'
  }

  return `https://${productionDomain}`
}

// 輔助函數：獲取客戶端 IP
function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }

  return (realIP as string) || remoteAddress || 'unknown'
}
