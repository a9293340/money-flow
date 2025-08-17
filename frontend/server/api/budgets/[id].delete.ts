/**
 * API: 刪除預算
 * 路由: DELETE /api/budgets/:id
 *
 * 說明:
 * - 軟刪除預算記錄
 * - 保留預算歷史資料
 * - 驗證刪除權限
 */

import mongoose from 'mongoose'
import { Budget } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface DeleteBudgetResponse {
  success: boolean
  message?: string
}

export default defineEventHandler(async (event): Promise<DeleteBudgetResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 獲取預算ID
    const budgetId = getRouterParam(event, 'id')

    if (!budgetId || !mongoose.Types.ObjectId.isValid(budgetId)) {
      throw createError({
        statusCode: 400,
        statusMessage: '無效的預算ID',
      })
    }

    // 查詢預算
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: (user as any)._id.toString(),
      isDeleted: false,
    })

    if (!budget) {
      throw createError({
        statusCode: 404,
        statusMessage: '預算不存在',
      })
    }

    // 執行軟刪除
    budget.isDeleted = true
    budget.isActive = false
    budget.status = 'inactive' as any

    await budget.save()

    const response: DeleteBudgetResponse = {
      success: true,
      message: '預算刪除成功',
    }

    return response
  }
  catch (error: any) {
    console.error('刪除預算失敗:', error)

    // 如果是 createError 拋出的錯誤，直接重新拋出
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '刪除預算失敗',
    })
  }
})
