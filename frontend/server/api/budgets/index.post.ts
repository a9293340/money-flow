/**
 * API: 創建新預算
 * 路由: POST /api/budgets
 *
 * 說明:
 * - 創建新的預算記錄
 * - 驗證預算資料完整性
 * - 自動設定初始統計資訊
 */

import { z } from 'zod'
import type { BudgetPeriodType } from '~/lib/models'
import { Budget, BudgetStatus, BudgetUtils, Category } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 預算創建請求驗證
const createBudgetSchema = z.object({
  name: z.string()
    .min(1, '預算名稱不能為空')
    .max(100, '預算名稱不能超過 100 個字元')
    .trim(),

  description: z.string()
    .max(500, '預算描述不能超過 500 個字元')
    .trim()
    .optional(),

  amount: z.number()
    .positive('預算金額必須大於 0')
    .max(99999999, '預算金額過大'),

  currency: z.string()
    .length(3, '幣別代碼必須為 3 個字元')
    .regex(/^[A-Z]{3}$/, '幣別代碼必須為大寫字母')
    .default('TWD'),

  categoryIds: z.array(z.string())
    .default([]),

  periodType: z.enum(['monthly', 'quarterly', 'yearly'])
    .default('monthly'),

  startDate: z.string()
    .transform(val => new Date(val))
    .refine(date => !Number.isNaN(date.getTime()), '無效的開始日期'),

  endDate: z.string()
    .transform(val => new Date(val))
    .refine(date => !Number.isNaN(date.getTime()), '無效的結束日期')
    .optional(),

  warningThreshold: z.number()
    .min(0, '警告閾值不能小於 0')
    .max(100, '警告閾值不能大於 100')
    .default(80),

  isActive: z.boolean().default(true),
})

interface CreateBudgetResponse {
  success: boolean
  data?: any
  message?: string
}

export default defineEventHandler(async (event): Promise<CreateBudgetResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = createBudgetSchema.parse(body)

    // 如果沒有提供結束日期，根據週期類型自動生成
    if (!validatedData.endDate) {
      const period = BudgetUtils.generateBudgetPeriod(
        validatedData.periodType as BudgetPeriodType,
        validatedData.startDate,
      )
      validatedData.endDate = period.endDate
    }

    // 驗證日期範圍
    if (validatedData.startDate >= validatedData.endDate) {
      throw new Error('結束日期必須晚於開始日期')
    }

    // 驗證分類ID有效性
    if (validatedData.categoryIds.length > 0) {
      // 轉換字符串ID為ObjectId
      const mongoose = await import('mongoose')
      const categoryObjectIds = validatedData.categoryIds.map(id => {
        if (!mongoose.default.Types.ObjectId.isValid(id)) {
          throw new Error(`無效的分類ID格式: ${id}`)
        }
        return new mongoose.default.Types.ObjectId(id)
      })

      const validCategories = await Category.find({
        _id: { $in: categoryObjectIds },
        userId: (user as any)._id.toString(),
        isDeleted: false,
        type: 'expense', // 只允許支出分類
      })

      console.log(`驗證分類ID: 提供=${validatedData.categoryIds.length}, 找到=${validCategories.length}`)
      console.log('提供的分類ID:', validatedData.categoryIds)
      console.log('找到的有效分類:', validCategories.map(c => ({ id: c._id.toString(), name: c.name, type: c.type })))

      if (validCategories.length !== validatedData.categoryIds.length) {
        const foundIds = validCategories.map(c => c._id.toString())
        const invalidIds = validatedData.categoryIds.filter(id => !foundIds.includes(id))
        throw new Error(`包含無效的分類ID: ${invalidIds.join(', ')}`)
      }
    }

    // 檢查同一期間的預算數量限制（最多3筆）
    const existingBudgetsCount = await Budget.countDocuments({
      userId: (user as any)._id.toString(),
      isDeleted: false,
      status: { $in: [BudgetStatus.ACTIVE, BudgetStatus.INACTIVE] },
      periodType: validatedData.periodType,

      // 檢查時間重疊
      startDate: { $lte: validatedData.endDate },
      endDate: { $gte: validatedData.startDate },
    })

    if (existingBudgetsCount >= 3) {
      throw new Error('同一期間最多只能創建3筆預算')
    }

    // 創建預算資料
    const budgetData: any = {
      userId: (user as any)._id.toString(),
      name: validatedData.name,
      description: validatedData.description,
      amount: validatedData.amount,
      currency: validatedData.currency,
      categoryIds: validatedData.categoryIds,
      periodType: validatedData.periodType,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      warningThreshold: validatedData.warningThreshold,
      status: validatedData.isActive ? BudgetStatus.ACTIVE : BudgetStatus.INACTIVE,
      isActive: validatedData.isActive,
      isDeleted: false, // 確保設置刪除標記
      context: 'personal' as const,

      // 初始統計值
      currentSpent: 0,
      usagePercentage: 0,
      remainingAmount: validatedData.amount,
      remainingDays: Math.ceil((validatedData.endDate.getTime() - validatedData.startDate.getTime()) / (1000 * 60 * 60 * 24)),
      avgDailySpent: 0,
      projectedTotal: 0,
      warningLevel: 'safe' as const,
    }

    // 處理多幣別 (如果不是基準幣別)
    if (validatedData.currency !== 'TWD') {
      // 這裡之後會整合匯率API，目前暫時設為相同值
      budgetData.baseCurrencyAmount = validatedData.amount
      budgetData.currentSpentBaseCurrency = 0
    }

    // 創建預算
    const budget = new Budget(budgetData)

    // 計算初始統計 (會觸發 calculateStats 方法)
    budget.calculateStats([])

    // 儲存預算
    await budget.save()

    const response: CreateBudgetResponse = {
      success: true,
      data: budget.toObject(),
      message: '預算創建成功',
    }

    return response
  }
  catch (error: any) {
    console.error('創建預算失敗:', error)

    // 根據錯誤類型返回適當的錯誤訊息
    let errorMessage = '創建預算失敗'

    if (error.name === 'ZodError') {
      const zodError = error as z.ZodError
      errorMessage = zodError.issues[0]?.message || '資料驗證失敗'
    }
    else if (error.message) {
      errorMessage = error.message
    }
    else if (error.code === 11000) {
      errorMessage = '預算名稱重複，請使用不同的名稱'
    }

    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    })
  }
})
