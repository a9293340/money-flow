/**
 * 權限中間件
 * 處理個人和群組模式的權限檢查
 */

// 權限檢查函數
export function checkPermission(user: any, action: string, resource: any = null, context: string = 'personal') {
  if (context === 'personal') {
    // 個人模式：只檢查資源是否屬於該用戶
    if (resource && resource.userId && resource.userId !== user._id) {
      return false
    }
    return true
  }

  // Phase 2: 群組模式權限檢查將在此實作
  if (context === 'group') {
    // if (!user.groupId || (resource && resource.groupId !== user.groupId)) {
    //   return false
    // }
    //
    // switch (action) {
    //   case 'read':
    //     return ['owner', 'admin', 'member'].includes(user.groupRole)
    //   case 'create':
    //     return ['owner', 'admin', 'member'].includes(user.groupRole)
    //   case 'update':
    //     return resource.createdBy === user._id ||
    //            ['owner', 'admin'].includes(user.groupRole)
    //   case 'delete':
    //     return resource.createdBy === user._id ||
    //            ['owner', 'admin'].includes(user.groupRole)
    //   default:
    //     return false
    // }

    throw new Error('Group context not implemented in Phase 1')
  }

  return false
}

// 權限檢查中間件工廠函數
export function requirePermission(_action: string) {
  return defineEventHandler(async (event) => {
    // 只處理需要權限檢查的路由
    const url = getRequestURL(event)
    const needsPermissionCheck = [
      '/api/records/',
      '/api/categories/',
    ].some(path => url.pathname.startsWith(path))

    if (!needsPermissionCheck) {
      return
    }

    try {
      // 取得使用者 Context（由 context.ts 中間件設定）
      const userContext = event.context.userContext
      if (!userContext) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required',
        })
      }

      const { user, context } = userContext

      // 對於 GET 請求（讀取操作），檢查基本權限
      if (event.node.req.method === 'GET') {
        const hasPermission = checkPermission(user, 'read', null, context)
        if (!hasPermission) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Insufficient permissions for read access',
          })
        }
      }

      // 對於 POST 請求（建立操作），檢查建立權限
      if (event.node.req.method === 'POST') {
        const hasPermission = checkPermission(user, 'create', null, context)
        if (!hasPermission) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Insufficient permissions for create access',
          })
        }
      }

      // 對於 PUT/DELETE 請求，會在各別的 API 端點中檢查特定資源的權限
      // 因為需要先取得資源才能檢查擁有權
    }
    catch (error) {
      console.error('Permission middleware error:', error)

      // 如果已經是 createError 創建的錯誤，直接拋出
      const err = error as any
      if (err.statusCode) {
        throw error
      }

      // 其他錯誤轉換為 500 錯誤
      throw createError({
        statusCode: 500,
        statusMessage: 'Permission check error',
      })
    }
  })
}

// 資源權限檢查輔助函數
export async function checkResourcePermission(user: any, resource: any, action: string, context: string = 'personal') {
  if (!resource) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  const hasPermission = checkPermission(user, action, resource, context)
  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: `Insufficient permissions for ${action} access`,
    })
  }

  return true
}

// 預設匯出基本權限檢查中間件
export default requirePermission('read')
