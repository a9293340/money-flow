/**
 * 認證相關工具函數
 * 處理 token 自動刷新、認證狀態管理等
 */

import { apiFetch, detectCurrentPlatform, saveTokensToStorage, clearTokensFromStorage } from './client'

/**
 * 帶有自動 token 刷新功能的 API 請求函數
 * 當 access token 過期時，會自動嘗試使用 refresh token 刷新，然後重試請求
 */
export async function authenticatedFetch<T = Record<string, unknown>>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    // 第一次嘗試請求
    return await apiFetch<T>(url, options)
  }
  catch (error) {
    console.log('API 請求失敗，檢查是否需要刷新 token:', error)

    // 檢查是否是認證錯誤（401 或包含認證相關的錯誤訊息）
    const isAuthError = error instanceof Error && (
      error.message.includes('401')
      || error.message.includes('HTTP error! status: 401')
      || error.message.toLowerCase().includes('unauthorized')
      || error.message.includes('token')
      || error.message.includes('過期')
    )

    if (isAuthError) {
      console.log('檢測到認證錯誤，嘗試刷新 token...')

      try {
        // 移動端需要在 refresh 請求中發送 refresh token
        const platform = detectCurrentPlatform()
        const refreshOptions: RequestInit = { method: 'POST' }

        if (platform === 'mobile') {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            refreshOptions.headers = {
              'X-Refresh-Token': refreshToken,
            }
          }
        }

        // 嘗試刷新 token
        const refreshResponse = await apiFetch<{
          success: boolean
          message: string
          data?: {
            tokens: {
              accessToken: string
              refreshToken: string
            }
            user: Record<string, unknown>
          }
          requireLogin?: boolean
          errors?: string[]
        }>('/api/auth/refresh', refreshOptions)

        if (refreshResponse.success) {
          console.log('Token 刷新成功，重新嘗試原始請求...')

          // 移動端更新 localStorage 中的 tokens
          if (platform === 'mobile' && refreshResponse.data?.tokens) {
            saveTokensToStorage(
              refreshResponse.data.tokens.accessToken,
              refreshResponse.data.tokens.refreshToken,
            )
          }

          // Token 刷新成功，重新嘗試原始請求
          return await apiFetch<T>(url, options)
        }
        else if (refreshResponse.requireLogin || refreshResponse.errors?.some(err => err.includes('過期'))) {
          // Refresh token 也過期了，需要重新登入
          console.log('Refresh token 也已過期，需要重新登入')
          throw new Error('REQUIRE_LOGIN')
        }
        else {
          // 其他刷新失敗的情況
          throw new Error(`Token 刷新失敗: ${refreshResponse.message}`)
        }
      }
      catch (refreshError) {
        console.error('Token 刷新過程出錯:', refreshError)
        // 如果刷新失敗，拋出需要登入的錯誤
        throw new Error('REQUIRE_LOGIN')
      }
    }
    else {
      // 不是認證錯誤，直接拋出原始錯誤
      throw error
    }
  }
}

/**
 * 檢查用戶認證狀態
 * 返回用戶資訊，如果未認證則返回 null
 */
export async function checkAuthStatus(): Promise<{
  user: Record<string, unknown>
} | null> {
  try {
    const platform = detectCurrentPlatform()
    console.log(`認證狀態檢查 - 平台: ${platform}`)

    const response = await authenticatedFetch<{
      success: boolean
      message: string
      data?: {
        user: Record<string, unknown>
      }
      requireLogin?: boolean
      errors?: string[]
    }>('/api/auth/me')

    console.log('認證狀態檢查響應:', response)

    if (response.success && response.data?.user) {
      console.log('認證狀態檢查成功')
      return { user: response.data.user }
    }

    if (response.requireLogin) {
      console.log('認證狀態檢查失敗: 需要登入')
      throw new Error('REQUIRE_LOGIN')
    }

    console.log('認證狀態檢查失敗: 未知原因')
    return null
  }
  catch (error) {
    console.log('認證檢查過程出錯:', error)

    if (error instanceof Error && error.message === 'REQUIRE_LOGIN') {
      throw error
    }

    // 對於其他錯誤，檢查是否包含需要重新登入的標誌
    const errorString = String(error)
    if (errorString.includes('401')
      || errorString.includes('unauthorized')
      || errorString.includes('token')
      || errorString.includes('過期')) {
      console.log('從錯誤訊息判斷需要重新登入')
      throw new Error('REQUIRE_LOGIN')
    }

    return null
  }
}

/**
 * 處理需要登入的情況
 * 統一處理跳轉邏輯
 */
export function handleRequireLogin(message = 'Token 已過期，請重新登入') {
  console.warn(message)

  // 移動端清除 localStorage 中的 tokens
  const platform = detectCurrentPlatform()
  if (platform === 'mobile') {
    clearTokensFromStorage()
    console.log('已清除移動端 localStorage 中的 tokens')
  }

  // 跳轉到登入頁面
  navigateTo('/login')
}
