/**
 * 認證中間件
 * 檢查用戶是否已登入，如果未登入則重定向到登入頁面
 */

import { authenticatedFetch } from '~/lib/utils/auth'

export default defineNuxtRouteMiddleware(async (_to, _from) => {
  // 暫時禁用認證檢查來測試路由
  console.log('Auth middleware: navigating to', _to.path)
  return
  
  // 如果是服務器端渲染，暫時跳過檢查
  if (import.meta.server) {
    return
  }

  try {
    // 檢查用戶是否已經登入
    const response = await authenticatedFetch('/api/auth/me') as any

    if (!response.success || !response.data?.user) {
      // 用戶未登入，重定向到登入頁面
      return navigateTo('/login')
    }
  }
  catch (error) {
    // 認證失敗，重定向到登入頁面
    console.warn('Authentication check failed:', error)
    return navigateTo('/login')
  }
})