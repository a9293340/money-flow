/**
 * API: 取得單一預算詳情
 * 路由: GET /api/budgets/:id
 *
 * 說明:
 * - 獲取特定預算的詳細資訊
 * - 包含預算統計和相關記錄
 * - 自動更新預算狀態
 */

import mongoose from 'mongoose'
import { Budget, Record, Category } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface BudgetDetailResponse {
  success: boolean
  data?: {
    budget: any
    relatedRecords: any[]
    categories: any[]
    statistics: {
      dailyAverage: number
      weeklyAverage: number
      daysActive: number
      projectedEndDate: Date | null
      efficiency: string
    }
  }
  message?: string
}

export default defineEventHandler(async (event): Promise<BudgetDetailResponse> => {
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
    })
      .sort({ date: -1 })
      .populate('categoryId', 'name icon color type')
      .lean()

    // 獲取相關分類資訊
    let categories: any[] = []
    if (budget.categoryIds.length > 0) {
      categories = await Category.find({
        _id: { $in: budget.categoryIds },
        userId: (user as any)._id.toString(),
        isDeleted: false,
      }).lean()
    }
    else {
      // 全分類預算，獲取所有分類
      categories = await Category.find({
        userId: (user as any)._id.toString(),
        isDeleted: false,
      }).lean()
    }

    // 重新計算預算統計
    const currentSpent = relatedRecords.reduce((sum, record) => {
      return sum + (record.baseCurrencyAmount || record.amount)
    }, 0)

    budget.currentSpent = currentSpent
    if (budget.currency !== 'TWD') {
      budget.currentSpentBaseCurrency = currentSpent
    }

    // 更新統計資訊
    budget.calculateStats(relatedRecords)
    await budget.save()

    // 計算額外統計資訊
    const now = new Date()
    const startDate = budget.startDate
    const endDate = budget.endDate

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysActive = Math.min(
      Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      totalDays,
    )

    const dailyAverage = daysActive > 0 ? currentSpent / daysActive : 0
    const weeklyAverage = dailyAverage * 7

    // 預測結束日期和期間結束時的預估狀態
    let projectedEndDate: Date | null = null
    let projectedEndBalance: number | null = null
    let projectedStatus: 'on_track' | 'under_budget' | 'over_budget' = 'on_track'

    if (dailyAverage > 0 && budget.remainingAmount > 0) {
      const daysToFinish = Math.ceil(budget.remainingAmount / dailyAverage)
      const wouldFinishDate = new Date(now.getTime() + (daysToFinish * 24 * 60 * 60 * 1000))

      if (wouldFinishDate <= endDate) {
        // 能在期間內花完
        projectedEndDate = wouldFinishDate
        projectedStatus = 'on_track'
      }
      else {
        // 無法在期間內花完，計算期間結束時的預估餘額
        const remainingDaysInPeriod = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const projectedSpendInRemainingDays = dailyAverage * remainingDaysInPeriod
        projectedEndBalance = Math.max(0, budget.remainingAmount - projectedSpendInRemainingDays)
        projectedStatus = 'under_budget'
      }
    }
    else if (budget.remainingAmount <= 0) {
      // 預算已用完或超支
      projectedStatus = 'over_budget'
      projectedEndBalance = budget.remainingAmount < 0 ? Math.abs(budget.remainingAmount) : 0
    }
    else {
      // 沒有消費記錄，預估餘額為全部預算
      projectedEndBalance = budget.remainingAmount
      projectedStatus = 'under_budget'
    }

    // 預算效率評估
    let efficiency = 'excellent'
    if (budget.usagePercentage > 100) {
      efficiency = 'exceeded'
    }
    else if (budget.usagePercentage > 90) {
      efficiency = 'poor'
    }
    else if (budget.usagePercentage > 70) {
      efficiency = 'fair'
    }
    else if (budget.usagePercentage > 50) {
      efficiency = 'good'
    }

    const statistics = {
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      weeklyAverage: Math.round(weeklyAverage * 100) / 100,
      daysActive,
      projectedEndDate,
      projectedEndBalance,
      projectedStatus,
      efficiency,
    }

    const response: BudgetDetailResponse = {
      success: true,
      data: {
        budget: budget.toObject(),
        relatedRecords,
        categories,
        statistics,
      },
    }

    return response
  }
  catch (error: any) {
    console.error('取得預算詳情失敗:', error)

    // 如果是 createError 拋出的錯誤，直接重新拋出
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '取得預算詳情失敗',
    })
  }
})
