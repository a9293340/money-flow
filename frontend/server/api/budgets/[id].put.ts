/**
 * API: 更新預算
 * 路由: PUT /api/budgets/:id
 *
 * 說明:
 * - 更新預算資訊
 * - 重新計算預算統計
 * - 驗證更新資料合法性
 */

import { z } from 'zod'
import mongoose from 'mongoose'
import { Budget, BudgetStatus, Category, Record } from '~/lib/models'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 預算更新請求驗證
const updateBudgetSchema = z.object({
  name: z.string()
    .min(1, '預算名稱不能為空')
    .max(100, '預算名稱不能超過 100 個字元')
    .trim()
    .optional(),

  description: z.string()
    .max(500, '預算描述不能超過 500 個字元')
    .trim()
    .optional(),

  amount: z.number()
    .positive('預算金額必須大於 0')
    .max(99999999, '預算金額過大')
    .optional(),

  currency: z.string()
    .length(3, '幣別代碼必須為 3 個字元')
    .regex(/^[A-Z]{3}$/, '幣別代碼必須為大寫字母')
    .optional(),

  categoryIds: z.array(z.string()).optional(),

  startDate: z.string()
    .transform(val => new Date(val))
    .refine(date => !Number.isNaN(date.getTime()), '無效的開始日期')
    .optional(),

  endDate: z.string()
    .transform(val => new Date(val))
    .refine(date => !Number.isNaN(date.getTime()), '無效的結束日期')
    .optional(),

  warningThreshold: z.number()
    .min(0, '警告閾值不能小於 0')
    .max(100, '警告閾值不能大於 100')
    .optional(),

  status: z.enum(['active', 'inactive', 'completed'])
    .optional(),

  isActive: z.boolean().optional(),
})

interface UpdateBudgetResponse {
  success: boolean
  data?: any
  message?: string
}

export default defineEventHandler(async (event): Promise<UpdateBudgetResponse> => {
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

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = updateBudgetSchema.parse(body)

    // 查詢現有預算
    const existingBudget = await Budget.findOne({
      _id: budgetId,
      userId: (user as any)._id.toString(),
      isDeleted: false,
    })

    if (!existingBudget) {
      throw createError({
        statusCode: 404,
        statusMessage: '預算不存在',
      })
    }

    // 檢查是否可以修改
    if (existingBudget.status === BudgetStatus.COMPLETED) {
      throw new Error('已完成的預算無法修改')
    }

    // 驗證日期範圍
    const newStartDate = validatedData.startDate || existingBudget.startDate
    const newEndDate = validatedData.endDate || existingBudget.endDate

    if (newStartDate >= newEndDate) {
      throw new Error('結束日期必須晚於開始日期')
    }

    // 驗證分類ID有效性
    if (validatedData.categoryIds) {
      if (validatedData.categoryIds.length > 0) {
        const validCategories = await Category.find({
          _id: { $in: validatedData.categoryIds },
          userId: (user as any)._id.toString(),
          isDeleted: false,
        })

        if (validCategories.length !== validatedData.categoryIds.length) {
          throw new Error('包含無效的分類ID')
        }
      }
    }

    // 驗證預算金額不能小於已花費金額
    if (validatedData.amount && validatedData.amount < existingBudget.currentSpent) {
      throw new Error(`預算金額不能小於已花費金額 $${existingBudget.currentSpent.toFixed(2)}`)
    }

    // 檢查是否存在衝突的預算（如果修改了關鍵欄位）
    if (validatedData.startDate || validatedData.endDate || validatedData.categoryIds) {
      const conflictingBudget = await Budget.findOne({
        _id: { $ne: budgetId }, // 排除當前預算
        userId: (user as any)._id.toString(),
        isDeleted: false,
        status: { $in: [BudgetStatus.ACTIVE] },

        // 檢查時間重疊
        startDate: { $lte: newEndDate },
        endDate: { $gte: newStartDate },

        // 檢查分類重疊
        $or: (validatedData.categoryIds || existingBudget.categoryIds).length === 0
          ? [
              { categoryIds: { $size: 0 } }, // 都是全分類預算
            ]
          : [
              { categoryIds: { $size: 0 } }, // 已存在全分類預算
              { categoryIds: { $in: validatedData.categoryIds || existingBudget.categoryIds } }, // 分類有重疊
            ],
      })

      if (conflictingBudget) {
        throw new Error('修改後的預算與現有預算衝突')
      }
    }

    // 準備更新資料
    const updateData: any = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency
    if (validatedData.categoryIds !== undefined) updateData.categoryIds = validatedData.categoryIds
    if (validatedData.startDate !== undefined) updateData.startDate = validatedData.startDate
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate
    if (validatedData.warningThreshold !== undefined) updateData.warningThreshold = validatedData.warningThreshold

    // 處理狀態更新
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      updateData.isActive = validatedData.status === 'active'
    }
    else if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive
      updateData.status = validatedData.isActive ? BudgetStatus.ACTIVE : BudgetStatus.INACTIVE
    }

    // 處理多幣別更新
    if (validatedData.currency && validatedData.currency !== 'TWD') {
      if (validatedData.amount) {
        updateData.baseCurrencyAmount = validatedData.amount // 這裡之後會整合匯率API
      }
    }

    // 更新預算
    Object.assign(existingBudget, updateData)

    // 重新計算統計資訊
    const relatedRecords = await Record.find({
      userId: (user as any)._id.toString(),
      isDeleted: false,
      type: 'expense',
      date: {
        $gte: existingBudget.startDate,
        $lte: existingBudget.endDate,
      },
      $or: existingBudget.categoryIds.length === 0
        ? [{}] // 全分類預算
        : [{ categoryId: { $in: existingBudget.categoryIds } }], // 特定分類
    }).lean()

    // 重新計算已花費金額
    const currentSpent = relatedRecords.reduce((sum, record) => {
      return sum + (record.baseCurrencyAmount || record.amount)
    }, 0)

    existingBudget.currentSpent = currentSpent
    if (existingBudget.currency !== 'TWD') {
      existingBudget.currentSpentBaseCurrency = currentSpent
    }

    // 重新計算統計
    existingBudget.calculateStats(relatedRecords)

    // 儲存更新
    await existingBudget.save()

    const response: UpdateBudgetResponse = {
      success: true,
      data: existingBudget.toObject(),
      message: '預算更新成功',
    }

    return response
  }
  catch (error: any) {
    console.error('更新預算失敗:', error)

    // 如果是 createError 拋出的錯誤，直接重新拋出
    if (error.statusCode) {
      throw error
    }

    // 根據錯誤類型返回適當的錯誤訊息
    let errorMessage = '更新預算失敗'

    if (error.name === 'ZodError') {
      const zodError = error as z.ZodError
      errorMessage = zodError.issues[0]?.message || '資料驗證失敗'
    }
    else if (error.message) {
      errorMessage = error.message
    }

    throw createError({
      statusCode: 400,
      statusMessage: errorMessage,
    })
  }
})
