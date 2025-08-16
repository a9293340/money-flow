/**
 * Context 中間件
 * 處理個人/群組模式的 Context 識別和驗證
 */

import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

export default defineEventHandler(async (event) => {
  // 只處理 /api/records、/api/categories 和 /api/statistics 的請求
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/records')
    && !url.pathname.startsWith('/api/categories')
    && !url.pathname.startsWith('/api/statistics')) {
    return
  }

  try {
    // 取得使用者資訊
    let user
    try {
      user = await verifyAndGetUser(event)
    }
    catch {
      // 如果沒有有效的 JWT，讓後續的 API 處理認證錯誤
      return
    }

    // 從 Header 或 Query 參數取得 Context
    const contextHeader = getHeader(event, 'x-context')
    const contextQuery = getQuery(event).context as string
    const context = contextHeader || contextQuery || 'personal'

    // 驗證 Context 有效性
    if (!['personal', 'group'].includes(context)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid context. Must be "personal" or "group"',
      })
    }

    // Phase 1: 只支援個人模式
    if (context === 'group') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group context not implemented in Phase 1',
      })
    }

    // 個人模式驗證
    if (context === 'personal') {
      // 個人模式下，所有資源都屬於該使用者
      event.context.userContext = {
        user,
        context: 'personal',
        groupId: null,
      }
      return
    }

    // Phase 2: 群組模式驗證將在此實作
    // if (context === 'group') {
    //   if (!user.groupId) {
    //     throw createError({
    //       statusCode: 403,
    //       statusMessage: 'User not in any group',
    //     })
    //   }
    //
    //   event.context.userContext = {
    //     user,
    //     context: 'group',
    //     groupId: user.groupId,
    //   }
    //   return
    // }
  }
  catch (error) {
    console.error('Context middleware error:', error)

    // 如果已經是 createError 創建的錯誤，直接拋出
    const err = error as any
    if (err.statusCode) {
      throw error
    }

    // 其他錯誤轉換為 500 錯誤
    throw createError({
      statusCode: 500,
      statusMessage: 'Context processing error',
    })
  }
})
