/**
 * AI 智能預算建議 API
 * POST /api/ai-insights/budget-recommendations
 *
 * Phase 2 功能：基於用戶財務數據提供個人化預算建議
 */

import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { connectMongoDB } from '~/lib/mongodb'
import { Record } from '~/lib/models/record'
import { Budget } from '~/lib/models/budget'
import { Category } from '~/lib/models/category'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import { createBudgetRecommendationPrompt } from '~/lib/ai/prompt-templates'
import { AICacheManager } from '~/lib/ai/cache-manager'
import { canPerformAnalysis, saveAnalysisResult, getCachedAnalysisResult, formatWaitTime } from '~/lib/models/ai-analysis-record'
import type {
  BudgetRecommendationRequest,
  BudgetRecommendationResponse,
  UserFinancialData,
  BudgetRecommendation,
} from '~/types/ai'

export default defineEventHandler(async (event) => {
  try {
    console.log('🎯 智能預算建議 API 請求開始')

    // 驗證用戶身份
    const user = await verifyAndGetUser(event)
    if (!user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: '需要登入才能使用 AI 預算建議功能',
      })
    }

    // 解析請求參數
    const body = await readBody<BudgetRecommendationRequest>(event)
    const {
      analysisRange = '3M',
      budgetGoal = 'optimize',
      focusAreas = [],
      currentBudgetId,
    } = body

    console.log('📊 預算建議參數:', {
      userId: user.id,
      analysisRange,
      budgetGoal,
      focusAreas: focusAreas?.length || 0,
      currentBudgetId,
    })

    // 連接資料庫
    await connectMongoDB()

    // 檢查分析頻率限制
    const analysisCheck = await canPerformAnalysis(user.id, 'budget')

    if (!analysisCheck.canAnalyze) {
      // 返回緩存結果和等待時間信息
      const cachedResult = await getCachedAnalysisResult(user.id, 'budget')

      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          cached: true,
          message: `智能預算建議每週僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
        }
      }

      // 如果沒有緩存結果，返回錯誤
      throw createError({
        statusCode: 429,
        statusMessage: `智能預算建議每週僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
        data: {
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
          waitTime: formatWaitTime(analysisCheck.nextAvailableAt!),
        },
      })
    }

    // 檢查快取 (短期快取)
    const cacheKey = `budget_recommendations:${user.id}:${analysisRange}:${budgetGoal}`
    const cachedResult = await AICacheManager.get(cacheKey, 'budget_recommendations')
    if (cachedResult) {
      console.log('✅ 從快取獲取預算建議')
      return {
        success: true,
        data: cachedResult,
        cached: true,
        message: '成功獲取智能預算建議 (快取)',
      }
    }

    // 收集用戶財務數據
    const financialData = await collectUserFinancialData(user.id, analysisRange)

    if (!financialData.records.length) {
      return {
        success: false,
        error: '數據不足：需要至少一筆財務記錄才能提供預算建議',
        message: '請先添加一些收支記錄後再使用此功能',
      }
    }

    // 獲取當前預算資訊（如果有）
    let currentBudget = null
    if (currentBudgetId) {
      currentBudget = await Budget.findOne({
        _id: currentBudgetId,
        userId: user.id,
        isDeleted: false,
      }).populate('items.categoryId')
    }

    // 生成 AI 預算建議
    const recommendations = await generateBudgetRecommendations({
      financialData,
      currentBudget,
      budgetGoal,
      focusAreas,
      analysisRange,
    })

    // 快取結果
    await AICacheManager.set(
      cacheKey,
      recommendations,
      'budget_recommendations',
      15 * 60 * 1000, // 15 分鐘快取
    )

    console.log('🎯 智能預算建議生成完成')

    // 保存分析結果到頻率限制記錄
    try {
      await saveAnalysisResult(user.id, 'budget', recommendations)
    }
    catch (saveError) {
      console.error('保存預算建議結果失敗:', saveError)
      // 不阻礙正常流程，僅記錄錯誤
    }

    return {
      success: true,
      data: recommendations,
      cached: false,
      message: '成功生成智能預算建議',
    } as BudgetRecommendationResponse
  }
  catch (error: any) {
    console.error('🎯 智能預算建議 API 錯誤:', error)

    // 錯誤統計
    await AICacheManager.incrementErrorCount('budget_recommendations')

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '智能預算建議生成失敗',
      data: {
        error: error.message,
        timestamp: new Date().toISOString(),
        userId: (await verifyAndGetUser(event).catch(() => null))?.id,
      },
    })
  }
})

/**
 * 收集用戶財務數據
 */
async function collectUserFinancialData(
  userId: string,
  analysisRange: string,
): Promise<UserFinancialData> {
  const rangeDate = getDateRange(analysisRange)

  // 並行查詢所有相關資料
  const [records, categories, budgets] = await Promise.all([
    // 查詢指定時間範圍內的記錄
    Record.find({
      userId,
      isDeleted: false,
      date: { $gte: rangeDate.startDate, $lte: rangeDate.endDate },
    }).populate('categoryId').sort({ date: -1 }),

    // 查詢所有分類
    Category.find({
      userId,
      isDeleted: false,
    }),

    // 查詢現有預算
    Budget.find({
      userId,
      'isDeleted': false,
      'period.startDate': { $lte: new Date() },
      'period.endDate': { $gte: new Date() },
    }).populate('items.categoryId'),
  ])

  // 計算統計資訊
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalExpenses = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  // 按分類統計支出
  const expensesByCategory = records
    .filter(r => r.type === 'expense')
    .reduce((acc: any, record) => {
      const categoryId = (record.categoryId as any)?._id?.toString() || 'uncategorized'
      const categoryName = (record.categoryId as any)?.name || '未分類'

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          totalAmount: 0,
          recordCount: 0,
          averageAmount: 0,
        }
      }

      acc[categoryId].totalAmount += record.amount
      acc[categoryId].recordCount += 1
      acc[categoryId].averageAmount = acc[categoryId].totalAmount / acc[categoryId].recordCount

      return acc
    }, {})

  return {
    userId,
    analysisRange,
    dateRange: rangeDate,
    records,
    categories,
    budgets,
    summary: {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      recordCount: records.length,
      expensesByCategory: Object.values(expensesByCategory),
    },
  }
}

/**
 * 生成預算建議
 */
async function generateBudgetRecommendations(params: {
  financialData: UserFinancialData
  currentBudget: any
  budgetGoal: string
  focusAreas: string[]
  analysisRange: string
}): Promise<BudgetRecommendation> {
  const { financialData, currentBudget, budgetGoal, focusAreas } = params

  try {
    // 使用 OpenAI 生成智能建議
    const openaiClient = useOpenAIClient()
    const promptParams = {
      userName: 'User',
      timeRange: financialData.analysisRange,
      totalIncome: financialData.summary.totalIncome,
      totalExpense: financialData.summary.totalExpenses,
      categories: financialData.summary.expensesByCategory.map((cat: any) => ({
        name: cat.categoryName,
        amount: cat.totalAmount,
        percentage: (cat.totalAmount / financialData.summary.totalExpenses) * 100,
      })),
      recentTransactions: financialData.records.slice(-10).map((record: any) => ({
        date: record.date.toISOString().split('T')[0],
        description: record.description,
        amount: record.amount,
        category: (record.categoryId as any)?.name || '未分類',
      })),
      budgetData: currentBudget
        ? {
            totalBudget: currentBudget.totalBudget,
            usedBudget: currentBudget.usedBudget,
            remainingBudget: currentBudget.remainingBudget,
          }
        : undefined,
    }
    const prompt = createBudgetRecommendationPrompt(promptParams)

    const aiResponse = await openaiClient.generateBudgetRecommendation(prompt)

    // 調試日誌：記錄完整的 AI 回應
    console.log('🤖 OpenAI 完整回應:', JSON.stringify(aiResponse, null, 2))
    console.log('📊 improvements 內容:', aiResponse.improvements)
    console.log('⚠️ riskWarnings 內容:', aiResponse.riskWarnings)

    // 解析 AI 回應並結構化
    const recommendation: BudgetRecommendation = {
      recommendedBudget: aiResponse.recommendedBudget || generateFallbackBudget(financialData),
      recommendations: aiResponse.recommendations || [],
      insights: aiResponse.insights || [],
      improvements: aiResponse.improvements || [],
      riskWarnings: aiResponse.riskWarnings || [],
      nextSteps: aiResponse.nextSteps || [],
      confidence: aiResponse.confidence || 0.7,
      methodology: aiResponse.methodology || 'AI 分析基於您的歷史財務數據和最佳實踐',
      generatedAt: new Date().toISOString(),
      analysisParams: {
        budgetGoal,
        focusAreas,
        analysisRange: params.analysisRange,
        dataPoints: financialData.records.length,
      },
    }

    return recommendation
  }
  catch (error) {
    console.error('🎯 AI 預算建議生成失敗，使用本地演算法:', error)

    // 本地備用演算法
    return generateFallbackBudgetRecommendation(financialData, budgetGoal, focusAreas)
  }
}

/**
 * 本地備用預算建議演算法
 */
function generateFallbackBudgetRecommendation(
  financialData: UserFinancialData,
  budgetGoal: string,
  focusAreas: string[],
): BudgetRecommendation {
  const { summary } = financialData

  // 基於 50/30/20 規則的預算建議
  const monthlyIncome = summary.totalIncome
  const necessities = monthlyIncome * 0.5 // 必需品 50%
  const wants = monthlyIncome * 0.3 // 娛樂支出 30%
  const savings = monthlyIncome * 0.2 // 儲蓄 20%

  const recommendedBudget = {
    totalBudget: monthlyIncome,
    categories: [
      { name: '住房', amount: necessities * 0.6, percentage: 30 },
      { name: '食物', amount: necessities * 0.25, percentage: 12.5 },
      { name: '交通', amount: necessities * 0.15, percentage: 7.5 },
      { name: '娛樂', amount: wants, percentage: 30 },
      { name: '儲蓄', amount: savings, percentage: 20 },
    ],
  }

  return {
    recommendedBudget,
    recommendations: [
      '建議採用 50/30/20 預算分配原則',
      '優先確保基本生活需求的資金充足',
      '設定明確的儲蓄目標並自動化執行',
    ],
    insights: [
      `您的當前儲蓄率為 ${summary.savingsRate.toFixed(1)}%`,
      '建議將儲蓄率提升至 20% 以上',
    ],
    improvements: [],
    riskWarnings: summary.savingsRate < 10 ? ['儲蓄率偏低，建議增加儲蓄'] : [],
    nextSteps: [
      '建立緊急備用金',
      '設定自動儲蓄計劃',
      '定期檢視和調整預算',
    ],
    confidence: 0.6,
    methodology: '基於本地演算法和 50/30/20 預算原則',
    generatedAt: new Date().toISOString(),
    analysisParams: {
      budgetGoal,
      focusAreas,
      analysisRange: financialData.analysisRange,
      dataPoints: financialData.records.length,
    },
  }
}

/**
 * 生成備用預算結構
 */
function generateFallbackBudget(financialData: UserFinancialData) {
  const monthlyIncome = financialData.summary.totalIncome

  return {
    totalBudget: monthlyIncome,
    categories: [
      { name: '住房', amount: monthlyIncome * 0.3, percentage: 30 },
      { name: '食物', amount: monthlyIncome * 0.125, percentage: 12.5 },
      { name: '交通', amount: monthlyIncome * 0.075, percentage: 7.5 },
      { name: '娛樂', amount: monthlyIncome * 0.3, percentage: 30 },
      { name: '儲蓄', amount: monthlyIncome * 0.2, percentage: 20 },
    ],
  }
}

/**
 * 獲取日期範圍
 */
function getDateRange(range: string) {
  const endDate = new Date()
  const startDate = new Date()

  switch (range) {
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6)
      break
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    default:
      startDate.setMonth(endDate.getMonth() - 3)
  }

  return { startDate, endDate }
}
