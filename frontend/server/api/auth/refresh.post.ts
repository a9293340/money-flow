import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, setAuthCookies, generateTokenId, getRefreshTokenFromEvent, detectClientPlatform } from '~/lib/auth/jwt'

export default defineEventHandler(async (event) => {
  try {
    // 連接資料庫
    await connectMongoDB()

    // 從請求中取得 Refresh Token
    const refreshToken = getRefreshTokenFromEvent(event)
    if (!refreshToken) {
      return {
        success: false,
        message: 'Refresh token 不存在',
        errors: ['未提供有效的 refresh token'],
      }
    }

    // 驗證 Refresh Token
    const payload = verifyRefreshToken(refreshToken)

    // 查找使用者
    const user = await User.findById(payload.userId)
    if (!user) {
      return {
        success: false,
        message: '使用者不存在',
        errors: ['無效的使用者'],
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

    // 檢測客戶端平台
    const platform = detectClientPlatform(event)

    // 生成新的 tokens (使用動態平台設定)
    const newTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    }

    const newAccessToken = generateAccessToken(newTokenPayload, platform)
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenId: generateTokenId(),
    }, platform)

    // 設定新的 Cookies (使用動態平台設定)
    setAuthCookies(event, newAccessToken, newRefreshToken, platform)

    return {
      success: true,
      message: 'Token 刷新成功',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          emailVerified: user.security.emailVerified,
        },
      },
    }
  }
  catch (error: unknown) {
    console.error('Token 刷新錯誤:', error)

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
      message: 'Token 刷新失敗',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})
