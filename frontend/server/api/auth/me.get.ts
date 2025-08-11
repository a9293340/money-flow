import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { verifyAccessToken, getAccessTokenFromEvent } from '~/lib/auth/jwt'

export default defineEventHandler(async (event) => {
  try {
    // 連接資料庫
    await connectMongoDB()

    // 從請求中取得 Access Token
    const accessToken = getAccessTokenFromEvent(event)
    if (!accessToken) {
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
      return {
        success: false,
        message: '使用者不存在',
        errors: ['無效的使用者'],
        requireLogin: true,
      }
    }

    // 檢查帳戶是否被鎖定
    if (user.isLocked && user.isLocked()) {
      return {
        success: false,
        message: '帳戶已被鎖定',
        errors: ['帳戶已被鎖定'],
        requireLogin: true,
      }
    }

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
    console.error('取得使用者資訊錯誤:', error)

    // Token 過期或無效
    if (error instanceof Error && (error.message.includes('過期') || error.message.includes('無效'))) {
      return {
        success: false,
        message: 'Token 已過期，請重新登入',
        errors: ['Token 已過期'],
        requireLogin: true,
      }
    }

    return {
      success: false,
      message: '取得使用者資訊失敗',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      requireLogin: true,
    }
  }
})
