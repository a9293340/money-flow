/**
 * API: 重新計算預算統計
 * 路由: POST /api/budgets/:id/recalculate
 *
 * 說明:
 * - 強制重新計算指定預算的統計資訊
 * - 用於資料同步和修正
 * - 更新預算狀態和警告級別
 */

import mongoose from 'mongoose'
import { Budget, Record } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface RecalculateBudgetResponse {
  success: boolean
  data?: {
    budget: any
    changes: {
      oldSpent: number
      newSpent: number
      oldUsageRate: number
      newUsageRate: number
      oldWarningLevel: string
      newWarningLevel: string
    }
  }
  message?: string
}

export default defineEventHandler(async (event): Promise<RecalculateBudgetResponse> => {
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

    // 保存重新計算前的狀態
    const oldSpent = budget.currentSpent
    const oldUsageRate = budget.usagePercentage
    const oldWarningLevel = budget.warningLevel

    // 獲取相關記錄
    const relatedRecords = await Record.find({
      userId: (user as any)._id.toString(),
      isDeleted: false,
      type: 'expense',
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate,
      },
      $or: budget.categoryIds.length === 0
        ? [{}] // 全分類預算，包含所有記錄
        : [{ categoryId: { $in: budget.categoryIds } }], // 特定分類
    }).lean()

    // 重新計算已花費金額
    const currentSpent = relatedRecords.reduce((sum, record) => {
      return sum + (record.baseCurrencyAmount || record.amount)
    }, 0)

    // 更新已花費金額
    budget.currentSpent = currentSpent
    if (budget.currency !== 'TWD') {
      budget.currentSpentBaseCurrency = currentSpent
    }

    // 重新計算所有統計資訊
    budget.calculateStats(relatedRecords)

    // 儲存更新
    await budget.save()

    // 計算變更差異
    const changes = {
      oldSpent: Math.round(oldSpent * 100) / 100,
      newSpent: Math.round(budget.currentSpent * 100) / 100,
      oldUsageRate: Math.round(oldUsageRate * 100) / 100,
      newUsageRate: Math.round(budget.usagePercentage * 100) / 100,
      oldWarningLevel,
      newWarningLevel: budget.warningLevel,
    }

    const response: RecalculateBudgetResponse = {
      success: true,
      data: {
        budget: budget.toObject(),
        changes,
      },
      message: '預算統計重新計算完成',
    }

    return response
  }
  catch (error: any) {
    console.error('重新計算預算統計失敗:', error)

    // 如果是 createError 拋出的錯誤，直接重新拋出
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '重新計算預算統計失敗',
    })
  }
})
