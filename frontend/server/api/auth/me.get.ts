import { getHeader, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { verifyAccessToken, getAccessTokenFromEvent } from '~/lib/auth/jwt'
import { logApiError, logApiSuccess, logSecurityEvent, type ApiLogContext } from '~/lib/utils/logger'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const apiUrl = '/api/auth/me'
  const method = 'GET'

  const logContext: ApiLogContext = {
    apiUrl,
    method,
    ip: getClientIP(event),
    userAgent: getHeader(event, 'user-agent') || 'unknown',
    platform: getHeader(event, 'x-client-platform') || 'unknown',
  }

  try {
    // 連接資料庫
    await connectMongoDB()

    // 從請求中取得 Access Token
    const accessToken = getAccessTokenFromEvent(event)
    if (!accessToken) {
      logSecurityEvent('存取使用者資訊失敗 - 未提供 token', logContext)

      setResponseStatus(event, 401)
      return {
        success: false,
        message: '未提供認證 token',
        errors: ['需要登入'],
        requireLogin: true,
      }
    }

    // 驗證 Access Token
    const payload = verifyAccessToken(accessToken)

    // 查找使用者
    const user = await User.findById(payload.userId)
    if (!user) {
      logSecurityEvent('存取使用者資訊失敗 - 使用者不存在', {
        ...logContext,
        userId: payload.userId,
      })

      setResponseStatus(event, 401)
      return {
        success: false,
        message: '使用者不存在',
        errors: ['無效的使用者'],
        requireLogin: true,
      }
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked && user.isLocked()) {
      logSecurityEvent('存取使用者資訊失敗 - 帳戶被鎖定', {
        ...logContext,
        userId: user._id.toString(),
        email: user.email,
      })

      setResponseStatus(event, 401)
      return {
        success: false,
        message: '帳戶已被鎖定',
        errors: ['帳戶已被鎖定'],
        requireLogin: true,
      }
    }

    const duration = Date.now() - startTime
    logApiSuccess('使用者資訊取得成功', {
      ...logContext,
      userId: user._id.toString(),
      email: user.email,
      duration,
      statusCode: 200,
    })

    return {
      success: true,
      message: '使用者資訊取得成功',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          avatar: user.profile.avatar,
          emailVerified: user.security.emailVerified,
          preferences: user.profile.preferences,
          lastLoginAt: user.security.lastLoginAt,
          createdAt: user.createdAt,
        },
      },
    }
  }
  catch (error: unknown) {
    const duration = Date.now() - startTime

    // Token 過期或無效
    if (error instanceof Error && (error.message.includes('過期') || error.message.includes('無效'))) {
      logSecurityEvent('Token 驗證失敗', {
        ...logContext,
        error: error.message,
        duration,
        statusCode: 401,
      })

      setResponseStatus(event, 401)
      return {
        success: false,
        message: 'Token 已過期，請重新登入',
        errors: ['Token 已過期'],
        requireLogin: true,
      }
    }

    logApiError('取得使用者資訊 API 發生錯誤', {
      ...logContext,
      error,
      duration,
      statusCode: 500,
    })

    return {
      success: false,
      message: '取得使用者資訊失敗',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      requireLogin: true,
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
