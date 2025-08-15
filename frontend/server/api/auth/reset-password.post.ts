import { z } from 'zod'
import { readBody, getHeader, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import {
  logApiError,
  logValidationError,
  logSecurityEvent,
  logAuthEvent,
  type ApiLogContext,
} from '~/lib/utils/logger'

// 重置密碼驗證 Schema
const resetPasswordSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
  token: z.string().min(1, '重置 Token 為必填欄位'),
  newPassword: z
    .string()
    .min(8, '密碼至少需要 8 個字元')
    .max(128, '密碼不能超過 128 個字元')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '密碼必須包含至少一個小寫字母、一個大寫字母和一個數字',
    ),
  confirmPassword: z.string().min(1, '確認密碼為必填欄位'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '密碼和確認密碼不相符',
  path: ['confirmPassword'],
})

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const apiUrl = '/api/auth/reset-password'
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
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message)

      logValidationError('重置密碼資料驗證失敗', {
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

    const { email, token, newPassword } = validationResult.data

    // 計算 Token hash (與生成時相同的方式)
    const crypto = await import('node:crypto')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // 查找使用者並檢查重置 Token
    const user = await User.findOne({
      'email': email.toLowerCase(),
      'security.passwordResetToken': hashedToken,
      'security.passwordResetExpires': { $gt: new Date() }, // Token 未過期
    })

    if (!user) {
      logSecurityEvent('密碼重置失敗 - 無效或過期的 Token', {
        ...logContext,
        email: email.toLowerCase(),
        tokenHash: hashedToken.substring(0, 8) + '...', // 只記錄部分 hash 以供調試
      })

      return {
        success: false,
        message: '重置連結無效或已過期',
        errors: ['重置連結無效或已過期，請重新申請密碼重置'],
      }
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked && user.isLocked()) {
      logSecurityEvent('密碼重置失敗 - 帳戶被鎖定', {
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

    // 更新密碼和清除重置 Token
    user.passwordHash = newPassword // pre-save hook 會自動加密
    user.security.passwordResetToken = undefined
    user.security.passwordResetExpires = undefined

    // 重置登入失敗次數（如果有的話）
    if (user.security.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    await user.save()

    // 記錄成功的密碼重置
    const duration = Date.now() - startTime
    logAuthEvent('密碼重置成功', {
      ...logContext,
      userId: user._id.toString(),
      email: user.email,
      duration,
      statusCode: 200,
    })

    return {
      success: true,
      message: '密碼重置成功，請使用新密碼登入',
    }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime

    logApiError('重置密碼 API 發生錯誤', {
      ...logContext,
      error,
      duration,
      statusCode: 500,
    })

    return {
      success: false,
      message: '處理密碼重置時發生錯誤',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})

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
