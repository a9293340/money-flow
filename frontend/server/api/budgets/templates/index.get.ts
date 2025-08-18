/**
 * API: 獲取用戶的預算模板列表
 * 路由: GET /api/budgets/templates
 */

import { getUserBudgetTemplates } from '~/server/utils/recurring-budget-generator'
import { formatFrequencyDisplay, formatPeriodDisplay } from '~/lib/utils/recurring-budgets'
import ensureUserContext from '~/server/utils/ensureUserContext'

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)
    
    // 獲取用戶的所有模板
    const templates = await getUserBudgetTemplates((user as any)._id.toString())
    
    // 格式化回傳資料
    const formattedTemplates = templates.map(template => ({
      _id: template._id,
      name: template.name,
      description: template.description,
      amount: template.amount,
      currency: template.currency,
      categoryIds: template.categoryIds,
      periodType: template.periodType,
      templateFrequency: template.templateFrequency,
      frequencyDisplay: template.templateFrequency 
        ? formatFrequencyDisplay(template.templateFrequency as any)
        : '未設定',
      lastGeneratedPeriod: template.lastGeneratedPeriod,
      lastGeneratedPeriodDisplay: template.lastGeneratedPeriod && template.templateFrequency
        ? formatPeriodDisplay(template.templateFrequency as any, template.lastGeneratedPeriod)
        : '尚未生成',
      warningThreshold: template.warningThreshold,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }))

    return {
      success: true,
      data: {
        templates: formattedTemplates,
        count: formattedTemplates.length
      },
      message: '模板列表獲取成功'
    }
  } catch (error: any) {
    console.error('獲取模板列表失敗:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '獲取模板列表失敗'
    })
  }
})