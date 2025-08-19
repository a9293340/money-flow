/**
 * API: 檢查指定期間的預算數量
 * 路由: GET /api/budgets/check-period
 *
 * 查詢參數:
 * - periodType: 期間類型 (monthly, quarterly, yearly)
 * - startDate: 開始日期
 * - endDate: 結束日期 (可選)
 * - countOnly: 只返回數量 (true/false)
 */

import { z } from 'zod'
import { Budget, BudgetStatus } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 查詢參數驗證
const checkPeriodSchema = z.object({
  periodType: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)).optional(),
  countOnly: z.string().transform(val => val === 'true').default(false),
})

interface CheckPeriodResponse {
  success: boolean
  data?: {
    count: number
    maxAllowed: number
    canCreate: boolean
    budgets?: any[]
  }
  message?: string
}

export default defineEventHandler(async (event): Promise<CheckPeriodResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 驗證查詢參數
    const query = getQuery(event)
    const validatedQuery = checkPeriodSchema.parse(query)

    // 如果沒有提供結束日期，根據開始日期和期間類型計算
    let endDate = validatedQuery.endDate
    if (!endDate) {
      const startDate = validatedQuery.startDate
      switch (validatedQuery.periodType) {
        case 'monthly':
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
          break
        case 'quarterly': {
          const quarter = Math.floor(startDate.getMonth() / 3)
          endDate = new Date(startDate.getFullYear(), quarter * 3 + 3, 0)
          break
        }
        case 'yearly':
          endDate = new Date(startDate.getFullYear(), 11, 31)
          break
      }
    }

    // 查詢該期間的預算
    const query_conditions = {
      userId: (user as any)._id.toString(),
      isDeleted: false,
      status: { $in: [BudgetStatus.ACTIVE, BudgetStatus.INACTIVE] },
      periodType: validatedQuery.periodType,

      // 檢查時間重疊
      startDate: { $lte: endDate },
      endDate: { $gte: validatedQuery.startDate },
    }

    const maxAllowed = 3

    if (validatedQuery.countOnly) {
      // 只返回數量
      const count = await Budget.countDocuments(query_conditions)

      return {
        success: true,
        data: {
          count,
          maxAllowed,
          canCreate: count < maxAllowed,
        },
      }
    }

    // 返回完整資訊
    const budgets = await Budget.find(query_conditions)
      .select('name amount currentSpent usagePercentage status startDate endDate')
      .sort({ createdAt: -1 })

    const count = budgets.length

    return {
      success: true,
      data: {
        count,
        maxAllowed,
        canCreate: count < maxAllowed,
        budgets: budgets.map(budget => budget.toObject()),
      },
    }
  }
  catch (error: any) {
    console.error('檢查期間預算失敗:', error)

    return {
      success: false,
      message: error.message || '檢查期間預算失敗',
    }
  }
})
