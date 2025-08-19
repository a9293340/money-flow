/**
 * API: 取得預算列表
 * 路由: GET /api/budgets
 *
 * 說明:
 * - 獲取用戶的預算列表
 * - 支援分頁、篩選和排序
 * - 自動計算預算統計資訊
 */

import { z } from 'zod'
import { Budget, BudgetStatus, Record } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 查詢參數驗證
const querySchema = z.object({
  page: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(10),
  status: z.enum(['active', 'inactive', 'completed', 'exceeded']).optional(),
  periodType: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'startDate', 'endDate', 'amount', 'usagePercentage']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isTemplate: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
})

interface BudgetListResponse {
  success: boolean
  data: {
    items: any[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
    summary: {
      totalBudgets: number
      activeBudgets: number
      warningBudgets: number
      exceededBudgets: number
      totalAmount: number
      totalSpent: number
    }
  }
}

export default defineEventHandler(async (event): Promise<BudgetListResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 驗證查詢參數
    const query = await getValidatedQuery(event, querySchema.parse)

    // 建立查詢條件
    const baseFilter: any = {
      userId: (user as any)._id.toString(),
      isDeleted: false,
    }

    // 狀態篩選
    if (query.status) {
      baseFilter.status = query.status
    }

    // 週期類型篩選
    if (query.periodType) {
      baseFilter.periodType = query.periodType
    }

    // 分類篩選
    if (query.categoryId) {
      baseFilter.$or = [
        { categoryIds: { $size: 0 } }, // 全分類預算
        { categoryIds: query.categoryId }, // 特定分類預算
      ]
    }

    // 模板篩選
    if (query.isTemplate !== undefined) {
      baseFilter.isTemplate = query.isTemplate
    }

    // 搜尋條件
    if (query.search) {
      baseFilter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ]
    }

    // 計算總數
    const total = await Budget.countDocuments(baseFilter)

    // 計算分頁
    const pages = Math.ceil(total / query.limit)
    const skip = (query.page - 1) * query.limit

    // 排序設定
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1
    const sortConfig: any = { [query.sortBy]: sortOrder }

    // 查詢預算
    const budgets = await Budget.find(baseFilter)
      .sort(sortConfig)
      .skip(skip)
      .limit(query.limit)
      .lean()

    // 獲取相關記錄並重新計算預算統計
    const records = await Record.find({
      userId: (user as any)._id.toString(),
      isDeleted: false,
      type: 'expense',
    }).lean()

    // 更新每個預算的統計資訊
    const updatedBudgets = await Promise.all(
      budgets.map(async (budgetData) => {
        // 查詢完整的預算文檔以使用實例方法
        const budget = await Budget.findById(budgetData._id)
        if (!budget) return budgetData

        // 計算該預算相關的記錄支出
        const relevantRecords = records.filter((record) => {
          const recordDate = new Date(record.date)
          const isInPeriod = recordDate >= budget.startDate && recordDate <= budget.endDate

          // 檢查是否影響此預算
          if (budget.categoryIds.length === 0) {
            return isInPeriod // 全分類預算
          }

          return isInPeriod && budget.categoryIds.includes(record.categoryId)
        })

        // 計算當前已花費金額
        const currentSpent = relevantRecords.reduce((sum, record) => {
          return sum + (record.baseCurrencyAmount || record.amount)
        }, 0)

        // 更新已花費金額並重新計算統計
        budget.currentSpent = currentSpent
        if (budget.currency !== 'TWD' && budget.baseCurrencyAmount) {
          budget.currentSpentBaseCurrency = currentSpent
        }

        // 計算統計資訊
        budget.calculateStats(relevantRecords)

        // 儲存更新的統計資訊
        await budget.save()

        return budget.toObject()
      }),
    )

    // 計算匯總統計
    const summary = {
      totalBudgets: total,
      activeBudgets: updatedBudgets.filter(b => b.status === BudgetStatus.ACTIVE).length,
      warningBudgets: updatedBudgets.filter(b =>
        b.status === BudgetStatus.ACTIVE
        && (b.warningLevel === 'warning' || b.warningLevel === 'danger'),
      ).length,
      exceededBudgets: updatedBudgets.filter(b => b.status === BudgetStatus.EXCEEDED).length,
      totalAmount: updatedBudgets.reduce((sum, b) => sum + (b.baseCurrencyAmount || b.amount), 0),
      totalSpent: updatedBudgets.reduce((sum, b) => sum + (b.currentSpentBaseCurrency || b.currentSpent), 0),
    }

    const response: BudgetListResponse = {
      success: true,
      data: {
        items: updatedBudgets,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
        },
        summary,
      },
    }

    return response
  }
  catch (error: any) {
    console.error('取得預算列表失敗:', error)

    return {
      success: false,
      data: {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
        summary: {
          totalBudgets: 0,
          activeBudgets: 0,
          warningBudgets: 0,
          exceededBudgets: 0,
          totalAmount: 0,
          totalSpent: 0,
        },
      },
    }
  }
})
