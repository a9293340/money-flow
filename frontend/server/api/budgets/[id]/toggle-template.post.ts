/**
 * API: 切換預算的模板狀態
 * 路由: POST /api/budgets/:id/toggle-template
 */

import { z } from 'zod'
import { Budget } from '~/lib/models'
import { getCurrentPeriod, type TemplateFrequency } from '~/lib/utils/recurring-budgets'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 請求驗證
const toggleTemplateSchema = z.object({
  isTemplate: z.boolean(),
  templateFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
}).refine((data) => {
  // 如果設為模板，必須提供頻率
  if (data.isTemplate && !data.templateFrequency) {
    return false
  }
  return true
}, {
  message: '設為模板時必須提供重複頻率',
})

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 獲取預算ID
    const budgetId = getRouterParam(event, 'id')
    if (!budgetId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少預算ID',
      })
    }

    // 驗證請求資料
    const body = await readBody(event)
    const { isTemplate, templateFrequency } = toggleTemplateSchema.parse(body)

    // 查找預算
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: (user as any)._id.toString(),
      isDeleted: false,
    })

    if (!budget) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的預算',
      })
    }

    // 更新模板狀態
    budget.isTemplate = isTemplate

    if (isTemplate) {
      // 設為模板
      budget.templateFrequency = templateFrequency
      budget.lastGeneratedPeriod = getCurrentPeriod(
        templateFrequency as TemplateFrequency,
        budget.startDate,
      )
    }
    else {
      // 取消模板
      budget.templateFrequency = undefined
      budget.lastGeneratedPeriod = undefined
    }

    await budget.save()

    return {
      success: true,
      data: {
        budget: budget.toObject(),
      },
      message: isTemplate ? '已設為重複模板' : '已取消重複模板',
    }
  }
  catch (error: any) {
    console.error('切換模板狀態失敗:', error)

    // 根據錯誤類型返回適當的錯誤訊息
    let errorMessage = '切換模板狀態失敗'

    if (error.name === 'ZodError') {
      const zodError = error as z.ZodError
      errorMessage = zodError.issues[0]?.message || '資料驗證失敗'
    }
    else if (error.statusCode) {
      throw error
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
