/**
 * 重複預算生成器
 * 處理自動生成重複預算的核心邏輯
 */

import { Budget, BudgetStatus, type IBudget } from '~/lib/models'
import { 
  getCurrentPeriod, 
  calculatePeriodDates, 
  type TemplateFrequency 
} from '~/lib/utils/recurring-budgets'

/**
 * 檢查並生成到期的重複預算
 */
export async function checkAndGenerateRecurringBudgets(): Promise<{
  generated: number
  errors: Array<{ templateId: string, error: string }>
}> {
  let generated = 0
  const errors: Array<{ templateId: string, error: string }> = []

  try {
    // 1. 找出所有啟用的模板預算
    const templates = await Budget.find({
      isTemplate: true,
      isDeleted: false,
      isActive: true,
      templateFrequency: { $exists: true }
    })

    console.log(`找到 ${templates.length} 個啟用的預算模板`)

    // 2. 檢查每個模板是否需要生成新期間
    for (const template of templates) {
      try {
        const currentPeriod = getCurrentPeriod(
          template.templateFrequency as TemplateFrequency
        )
        
        // 如果當前期間與最後生成期間不同，需要生成新預算
        if (template.lastGeneratedPeriod !== currentPeriod) {
          console.log(`模板 ${template.name} 需要生成新期間: ${currentPeriod}`)
          
          await generateBudgetFromTemplate(template, currentPeriod)
          generated++
        }
      } catch (error: any) {
        console.error(`生成模板 ${template._id} 的預算時發生錯誤:`, error)
        errors.push({
          templateId: template._id.toString(),
          error: error.message
        })
      }
    }

    console.log(`重複預算檢查完成: 生成 ${generated} 個, 錯誤 ${errors.length} 個`)
    
    return { generated, errors }
  } catch (error: any) {
    console.error('重複預算檢查時發生系統錯誤:', error)
    return { generated, errors: [{ templateId: 'system', error: error.message }] }
  }
}

/**
 * 從模板生成新預算
 */
export async function generateBudgetFromTemplate(
  template: IBudget,
  targetPeriod: string
): Promise<IBudget> {
  if (!template.templateFrequency) {
    throw new Error('模板缺少重複頻率設定')
  }

  // 1. 檢查是否已存在相同期間的預算（避免重複生成）
  const { startDate, endDate } = calculatePeriodDates(
    template.templateFrequency as TemplateFrequency,
    targetPeriod
  )

  const existingBudget = await Budget.findOne({
    userId: template.userId,
    name: template.name,
    periodType: template.periodType,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
    isDeleted: false,
    isTemplate: false
  })

  if (existingBudget) {
    console.log(`期間 ${targetPeriod} 已存在相同預算，跳過生成`)
    // 更新模板的最後生成期間，避免重複檢查
    template.lastGeneratedPeriod = targetPeriod
    await template.save()
    return existingBudget
  }

  // 2. 複製模板資料創建新預算
  const templateObject = template.toObject()
  delete templateObject._id
  delete templateObject.createdAt
  delete templateObject.updatedAt
  delete templateObject.__v

  const newBudgetData = {
    ...templateObject,
    // 關鍵設定
    isTemplate: false,                    // 不是模板
    templateFrequency: undefined,         // 清除模板設定
    lastGeneratedPeriod: undefined,       // 清除模板設定
    
    // 新期間日期
    startDate,
    endDate,
    
    // 重置統計數據
    currentSpent: 0,
    currentSpentBaseCurrency: 0,
    usagePercentage: 0,
    remainingAmount: templateObject.amount,
    remainingDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    avgDailySpent: 0,
    projectedTotal: 0,
    warningLevel: 'safe' as const,
    status: BudgetStatus.ACTIVE,
    lastCalculatedAt: new Date(),
    
    // 重置多幣別統計（如果有）
    ...(templateObject.currency !== 'TWD' && {
      baseCurrencyAmount: templateObject.amount,
      currentSpentBaseCurrency: 0
    })
  }

  // 3. 創建新預算
  const newBudget = new Budget(newBudgetData)
  await newBudget.save()

  // 4. 更新模板的最後生成期間
  template.lastGeneratedPeriod = targetPeriod
  await template.save()

  console.log(`成功從模板 ${template.name} 生成新預算，期間: ${targetPeriod}`)
  
  return newBudget
}

/**
 * 手動為指定模板生成下一期預算
 */
export async function manuallyGenerateFromTemplate(
  templateId: string,
  userId?: string
): Promise<IBudget> {
  const template = await Budget.findOne({
    _id: templateId,
    isTemplate: true,
    isDeleted: false,
    ...(userId && { userId })
  })

  if (!template) {
    throw new Error('找不到指定的預算模板')
  }

  if (!template.templateFrequency) {
    throw new Error('模板缺少重複頻率設定')
  }

  const currentPeriod = getCurrentPeriod(
    template.templateFrequency as TemplateFrequency
  )

  return await generateBudgetFromTemplate(template, currentPeriod)
}

/**
 * 獲取用戶的所有模板預算
 */
export async function getUserBudgetTemplates(userId: string) {
  return await Budget.find({
    userId,
    isTemplate: true,
    isDeleted: false
  }).sort({ updatedAt: -1 })
}

/**
 * 獲取模板的生成統計
 */
export async function getTemplateGenerationStats(templateId: string) {
  const template = await Budget.findById(templateId)
  if (!template || !template.isTemplate) {
    throw new Error('找不到指定的模板')
  }

  // 計算從該模板生成的預算數量
  const generatedCount = await Budget.countDocuments({
    userId: template.userId,
    name: template.name,
    periodType: template.periodType,
    isTemplate: false,
    isDeleted: false
  })

  return {
    template: template.toObject(),
    generatedCount,
    lastGeneratedPeriod: template.lastGeneratedPeriod,
    currentPeriod: template.templateFrequency 
      ? getCurrentPeriod(template.templateFrequency as TemplateFrequency)
      : null
  }
}