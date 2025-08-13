import { z } from 'zod'
import { getHeader, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  generateTokenId,
  detectClientPlatform,
} from '~/lib/auth/jwt'
import {
  logApiError,
  logValidationError,
  logSecurityEvent,
  logAuthEvent,
  type ApiLogContext,
} from '~/lib/utils/logger'

// 登入驗證 Schema
const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
  password: z.string().min(1, '密碼為必填欄位'),
  rememberMe: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const apiUrl = '/api/login'
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

    // 讀取請求資料 (支援 JSON 和 FormData)
    let body: any
    const contentType = getHeader(event, 'content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // 處理 FormData (移動端)
      const formData = await readMultipartFormData(event)
      body = {}

      formData?.forEach((field) => {
        const key = field.name
        const value = field.data?.toString('utf8')

        if (key && value !== undefined) {
          if (key === 'rememberMe') {
            body[key] = value === 'true'
          }
          else {
            body[key] = value
          }
        }
      })
    }
    else {
      // 處理 JSON (Web 端)
      body = await readBody(event)
    }

    // Zod 驗證
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message)

      logValidationError('登入資料驗證失敗', {
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

    const { email, password } = validationResult.data

    // 查找使用者（包含密碼）
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
    if (!user) {
      logSecurityEvent('登入嘗試失敗 - 使用者不存在', {
        ...logContext,
        email: email.toLowerCase(),
      })

      return {
        success: false,
        message: '電子郵件或密碼錯誤',
        errors: ['電子郵件或密碼錯誤'],
      }
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked && user.isLocked()) {
      logSecurityEvent('登入嘗試失敗 - 帳戶被鎖定', {
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

    // 驗證密碼
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      // 增加失敗嘗試次數
      await user.incLoginAttempts()

      logSecurityEvent('登入嘗試失敗 - 密碼錯誤', {
        ...logContext,
        email: email.toLowerCase(),
        userId: user._id.toString(),
      })

      return {
        success: false,
        message: '電子郵件或密碼錯誤',
        errors: ['電子郵件或密碼錯誤'],
      }
    }

    // 密碼正確，重置失敗嘗試次數
    if (user.security.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    // 更新最後登入時間和 IP
    const clientIP = getClientIP(event)
    user.security.lastLoginAt = new Date()
    user.security.lastLoginIP = clientIP
    await user.save()

    // 檢測客戶端平台
    const platform = detectClientPlatform(event)

    // 生成 JWT tokens (使用動態平台設定)
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    }

    const accessToken = generateAccessToken(tokenPayload, platform)
    const refreshToken = generateRefreshToken(
      {
        userId: user._id.toString(),
        tokenId: generateTokenId(),
      },
      platform,
    )

    // 設定 Cookie (使用動態平台設定)
    setAuthCookies(event, accessToken, refreshToken, platform)

    // 記錄成功登入
    const duration = Date.now() - startTime
    logAuthEvent('使用者登入成功', {
      ...logContext,
      userId: user._id.toString(),
      email: user.email,
      duration,
      statusCode: 200,
      platform: platform,
    })

    // 返回成功結果（不包含敏感資訊）
    return {
      success: true,
      message: '登入成功',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          emailVerified: user.security.emailVerified,
          preferences: user.profile.preferences,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime

    logApiError('登入 API 發生錯誤', {
      ...logContext,
      error,
      duration,
      statusCode: 500,
    })

    return {
      success: false,
      message: '登入過程發生錯誤',
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
