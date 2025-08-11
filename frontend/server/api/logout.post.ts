import { clearAuthCookies, detectClientPlatform } from '~/lib/auth/jwt'

export default defineEventHandler(async (event) => {
  try {
    // 檢測客戶端平台並清除認證 Cookies
    const platform = detectClientPlatform(event)
    clearAuthCookies(event, platform)

    return {
      success: true,
      message: '登出成功',
    }
  }
  catch (error: unknown) {
    console.error('登出 API 錯誤:', error)

    return {
      success: false,
      message: '登出過程發生錯誤',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})
