/**
 * API: 取得預算統計概覽
 * 路由: GET /api/budgets/stats
 *
 * 說明:
 * - 獲取用戶預算統計概覽
 * - 提供儀表板所需的關鍵指標
 * - 包含警告和趨勢資訊
 */

import { Budget, BudgetStatus, BudgetWarningLevel } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface BudgetStatsResponse {
  success: boolean
  data: {
    overview: {
      totalBudgets: number
      activeBudgets: number
      completedBudgets: number
      totalAmount: number
      totalSpent: number
      totalRemaining: number
      avgUsageRate: number
    }
    warnings: {
      exceededBudgets: number
      dangerBudgets: number
      warningBudgets: number
      safeBudgets: number
    }
    currentMonth: {
      budgetCount: number
      totalAmount: number
      totalSpent: number
      usageRate: number
    }
    topSpendingBudgets: Array<{
      id: string
      name: string
      amount: number
      spent: number
      usageRate: number
      warningLevel: string
    }>
    recentlyUpdated: Array<{
      id: string
      name: string
      amount: number
      spent: number
      usageRate: number
      updatedAt: Date
    }>
  }
}

export default defineEventHandler(async (event): Promise<BudgetStatsResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 查詢所有非刪除的預算
    const allBudgets = await Budget.find({
      userId: (user as any)._id.toString(),
      isDeleted: false,
    }).lean()

    // 查詢啟用的預算
    const activeBudgets = allBudgets.filter(budget => budget.status === BudgetStatus.ACTIVE)

    // 查詢當月預算
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const currentMonthBudgets = activeBudgets.filter(budget =>
      budget.startDate <= currentMonthEnd && budget.endDate >= currentMonthStart,
    )

    // 計算總覽統計
    const totalAmount = allBudgets.reduce((sum, budget) => sum + (budget.baseCurrencyAmount || budget.amount), 0)
    const totalSpent = allBudgets.reduce((sum, budget) => sum + (budget.currentSpentBaseCurrency || budget.currentSpent), 0)
    const totalRemaining = totalAmount - totalSpent

    const overview = {
      totalBudgets: allBudgets.length,
      activeBudgets: activeBudgets.length,
      completedBudgets: allBudgets.filter(budget => budget.status === BudgetStatus.COMPLETED).length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalRemaining: Math.round(totalRemaining * 100) / 100,
      avgUsageRate: totalAmount > 0 ? Math.round((totalSpent / totalAmount) * 100 * 100) / 100 : 0,
    }

    // 計算警告統計
    const warningStats = activeBudgets.reduce((acc, budget) => {
      switch (budget.warningLevel) {
        case BudgetWarningLevel.EXCEEDED:
          acc.exceededBudgets++
          break
        case BudgetWarningLevel.DANGER:
          acc.dangerBudgets++
          break
        case BudgetWarningLevel.WARNING:
          acc.warningBudgets++
          break
        case BudgetWarningLevel.SAFE:
          acc.safeBudgets++
          break
      }
      return acc
    }, {
      exceededBudgets: 0,
      dangerBudgets: 0,
      warningBudgets: 0,
      safeBudgets: 0,
    })

    // 計算當月統計
    const currentMonthAmount = currentMonthBudgets.reduce((sum, budget) => sum + (budget.baseCurrencyAmount || budget.amount), 0)
    const currentMonthSpent = currentMonthBudgets.reduce((sum, budget) => sum + (budget.currentSpentBaseCurrency || budget.currentSpent), 0)

    const currentMonth = {
      budgetCount: currentMonthBudgets.length,
      totalAmount: Math.round(currentMonthAmount * 100) / 100,
      totalSpent: Math.round(currentMonthSpent * 100) / 100,
      usageRate: currentMonthAmount > 0 ? Math.round((currentMonthSpent / currentMonthAmount) * 100 * 100) / 100 : 0,
    }

    // 取得支出最高的預算 (前5名)
    const topSpendingBudgets = activeBudgets
      .sort((a, b) => (b.currentSpentBaseCurrency || b.currentSpent) - (a.currentSpentBaseCurrency || a.currentSpent))
      .slice(0, 5)
      .map(budget => ({
        id: (budget._id as any).toString(),
        name: budget.name,
        amount: Math.round((budget.baseCurrencyAmount || budget.amount) * 100) / 100,
        spent: Math.round((budget.currentSpentBaseCurrency || budget.currentSpent) * 100) / 100,
        usageRate: budget.usagePercentage,
        warningLevel: budget.warningLevel,
      }))

    // 取得最近更新的預算 (前5名)
    const recentlyUpdated = allBudgets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(budget => ({
        id: (budget._id as any).toString(),
        name: budget.name,
        amount: Math.round((budget.baseCurrencyAmount || budget.amount) * 100) / 100,
        spent: Math.round((budget.currentSpentBaseCurrency || budget.currentSpent) * 100) / 100,
        usageRate: budget.usagePercentage,
        updatedAt: budget.updatedAt,
      }))

    const response: BudgetStatsResponse = {
      success: true,
      data: {
        overview,
        warnings: warningStats,
        currentMonth,
        topSpendingBudgets,
        recentlyUpdated,
      },
    }

    return response
  }
  catch (error: any) {
    console.error('取得預算統計失敗:', error)

    return {
      success: false,
      data: {
        overview: {
          totalBudgets: 0,
          activeBudgets: 0,
          completedBudgets: 0,
          totalAmount: 0,
          totalSpent: 0,
          totalRemaining: 0,
          avgUsageRate: 0,
        },
        warnings: {
          exceededBudgets: 0,
          dangerBudgets: 0,
          warningBudgets: 0,
          safeBudgets: 0,
        },
        currentMonth: {
          budgetCount: 0,
          totalAmount: 0,
          totalSpent: 0,
          usageRate: 0,
        },
        topSpendingBudgets: [],
        recentlyUpdated: [],
      },
    }
  }
})
