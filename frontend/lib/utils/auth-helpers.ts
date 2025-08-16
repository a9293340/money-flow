/**
 * 認證輔助函數
 * 簡化 API 中的用戶驗證流程
 */

import type { H3Event } from 'h3'
import { User } from '~/lib/models/user'
import { verifyAccessToken, getAccessTokenFromEvent } from '~/lib/auth/jwt'

/**
 * 驗證用戶並返回用戶資料
 */
export async function verifyAndGetUser(event: H3Event) {
  // 從請求中取得 Access Token
  const accessToken = getAccessTokenFromEvent(event)
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Access token required',
    })
  }

  // 驗證 Access Token
  let payload
  try {
    payload = verifyAccessToken(accessToken)
  }
  catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  // 查找使用者
  const user = await User.findById(payload.userId)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  // 檢查帳戶是否被鎖定
  if (user.isLocked && user.isLocked()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Account is locked',
    })
  }

  // 檢查郵件是否已驗證
  if (!user.security.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email not verified',
    })
  }

  return user
}
