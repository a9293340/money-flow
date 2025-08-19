/**
 * API: 手動生成當前期間的重複預算
 * 路由: POST /api/budgets/templates/generate-current
 */

import { z } from 'zod'
import { manuallyGenerateFromTemplate } from '~/server/utils/recurring-budget-generator'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 請求驗證
const generateCurrentBudgetSchema = z.object({
  templateId: z.string()
    .min(1, '模板ID不能為空')
    .regex(/^[0-9a-f]{24}$/i, '無效的模板ID格式'),
})

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 驗證請求資料
    const body = await readBody(event)
    const { templateId } = generateCurrentBudgetSchema.parse(body)

    // 手動生成預算
    const newBudget = await manuallyGenerateFromTemplate(
      templateId,
      (user as any)._id.toString(),
    )

    return {
      success: true,
      data: {
        budget: newBudget.toObject(),
      },
      message: '預算生成成功',
    }
  }
  catch (error: any) {
    console.error('手動生成預算失敗:', error)

    // 根據錯誤類型返回適當的錯誤訊息
    let errorMessage = '生成預算失敗'
    let statusCode = 400

    if (error.name === 'ZodError') {
      const zodError = error as z.ZodError
      errorMessage = zodError.issues[0]?.message || '資料驗證失敗'
    }
    else if (error.message) {
      errorMessage = error.message
    }

    // 特定錯誤處理
    if (error.message?.includes('找不到')) {
      statusCode = 404
    }
    else if (error.message?.includes('已存在')) {
      statusCode = 409
      errorMessage = '該期間預算已存在，無需重複生成'
    }

    throw createError({
      statusCode,
      statusMessage: errorMessage,
    })
  }
})
