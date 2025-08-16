/**
 * 確保用戶上下文函數
 * 用於需要用戶認證的 API 端點
 */

export default function ensureUserContext(event: any) {
  const userContext = event.context.userContext

  if (!userContext || !userContext.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: User context not found',
    })
  }

  return userContext.user
}
