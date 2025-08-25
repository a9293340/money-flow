/**
 * AI 財務趨勢預測 API
 * POST /api/ai-insights/trend-prediction
 *
 * Phase 2 功能：基於歷史數據預測財務趨勢
 */

import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { connectMongoDB } from '~/lib/mongodb'
import { Record } from '~/lib/models/record'
import { Category } from '~/lib/models/category'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import { createTrendPredictionPrompt } from '~/lib/ai/prompt-templates'
import { AICacheManager } from '~/lib/ai/cache-manager'
import { canPerformAnalysis, saveAnalysisResult, getCachedAnalysisResult, formatWaitTime } from '~/lib/models/ai-analysis-record'
import type {
  TrendPredictionRequest,
  TrendPredictionResponse,
  UserFinancialData,
  TrendPrediction,
} from '~/types/ai'

export default defineEventHandler(async (event) => {
  try {
    console.log('📈 趨勢預測 API 請求開始')

    // 驗證用戶身份
    const user = await verifyAndGetUser(event)
    if (!user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: '需要登入才能使用 AI 趨勢預測功能',
      })
    }

    // 解析請求參數
    const body = await readBody<TrendPredictionRequest>(event)
    const {
      analysisRange = '6M',
      predictionPeriod = '3M',
      focusMetrics = ['income', 'expenses', 'savings'],
    } = body

    console.log('📈 趨勢預測參數:', {
      userId: user.id,
      analysisRange,
      predictionPeriod,
      focusMetrics: focusMetrics?.length || 0,
    })

    // 連接資料庫
    await connectMongoDB()

    // 檢查分析頻率限制
    const analysisCheck = await canPerformAnalysis(user.id, 'trend')

    if (!analysisCheck.canAnalyze) {
      // 返回緩存結果和等待時間信息
      const cachedResult = await getCachedAnalysisResult(user.id, 'trend')

      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          cached: true,
          message: `趨勢預測每週僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
        }
      }

      // 如果沒有緩存結果，返回錯誤
      throw createError({
        statusCode: 429,
        statusMessage: `趨勢預測每週僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
        data: {
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
          waitTime: formatWaitTime(analysisCheck.nextAvailableAt!),
        },
      })
    }

    // 檢查快取 (短期快取)
    const cacheKey = `trend_prediction:${user.id}:${analysisRange}:${predictionPeriod}`
    const cachedResult = await AICacheManager.get(cacheKey, 'trend_prediction')
    if (cachedResult) {
      console.log('✅ 從快取獲取趨勢預測')
      return {
        success: true,
        data: cachedResult,
        cached: true,
        message: '成功獲取財務趨勢預測 (快取)',
      }
    }

    // 收集用戶財務數據
    const financialData = await collectUserFinancialData(user.id, analysisRange)

    if (!financialData.records.length) {
      return {
        success: false,
        error: '數據不足：需要至少6個月的財務記錄才能進行趨勢預測',
        message: '請先添加更多財務記錄後再使用此功能',
      }
    }

    // 生成 AI 趨勢預測
    const prediction = await generateTrendPrediction({
      financialData,
      predictionPeriod,
      focusMetrics,
    })

    // 快取結果
    await AICacheManager.set(
      cacheKey,
      prediction,
      'trend_prediction',
      30 * 60 * 1000, // 30 分鐘快取
    )

    console.log('📈 財務趨勢預測生成完成')

    // 保存分析結果到頻率限制記錄
    try {
      await saveAnalysisResult(user.id, 'trend', prediction)
    }
    catch (saveError) {
      console.error('保存趨勢預測結果失敗:', saveError)
      // 不阻礙正常流程，僅記錄錯誤
    }

    return {
      success: true,
      data: prediction,
      cached: false,
      message: '成功生成財務趨勢預測',
    } as TrendPredictionResponse
  }
  catch (error: any) {
    console.error('📈 趨勢預測 API 錯誤:', error)

    // 錯誤統計
    await AICacheManager.incrementErrorCount('trend_prediction')

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '財務趨勢預測生成失敗',
      data: {
        error: error.message,
        timestamp: new Date().toISOString(),
        userId: (await verifyAndGetUser(event).catch(() => null))?.id,
      },
    })
  }
})

/**
 * 收集用戶財務數據（趨勢預測專用）
 */
async function collectUserFinancialData(
  userId: string,
  analysisRange: string,
): Promise<UserFinancialData> {
  const rangeDate = getDateRange(analysisRange)

  // 並行查詢所有相關資料
  const [records, categories] = await Promise.all([
    // 查詢指定時間範圍內的記錄（按時間排序用於趨勢分析）
    Record.find({
      userId,
      isDeleted: false,
      date: { $gte: rangeDate.startDate, $lte: rangeDate.endDate },
    }).populate('categoryId').sort({ date: 1 }), // 按日期升序排列

    // 查詢所有分類
    Category.find({
      userId,
      isDeleted: false,
    }),
  ])

  // 按月份統計數據（用於趨勢分析）
  const monthlyStats = generateMonthlyStats(records)

  // 計算總體統計
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalExpenses = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  // 按分類統計支出（包含趨勢）
  const expensesByCategory = calculateCategoryTrends(records)

  return {
    userId,
    analysisRange,
    dateRange: rangeDate,
    records,
    categories,
    budgets: [], // 趨勢預測不需要預算數據
    summary: {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      recordCount: records.length,
      expensesByCategory,
      monthlyStats, // 新增月度統計數據
    } as any,
  }
}

/**
 * 生成趨勢預測
 */
async function generateTrendPrediction(params: {
  financialData: UserFinancialData
  predictionPeriod: string
  focusMetrics: string[]
}): Promise<TrendPrediction> {
  const { financialData, predictionPeriod, focusMetrics } = params

  try {
    // 使用 OpenAI 生成智能趨勢預測
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
    }
    const prompt = createTrendPredictionPrompt(promptParams)

    const aiResponse = await openaiClient.generateTrendPrediction(prompt)

    // 調試日誌：記錄完整的 AI 回應
    console.log('🔮 趨勢預測 OpenAI 完整回應:', JSON.stringify(aiResponse, null, 2))
    console.log('📈 predictions 內容:', aiResponse.predictions)
    console.log('📊 trends 內容:', aiResponse.trends)
    console.log('🎯 opportunities 內容:', aiResponse.opportunities)
    console.log('⚠️ risks 內容:', aiResponse.risks)
    console.log('💡 recommendations 內容:', aiResponse.recommendations)

    // 轉換 OpenAI 回應格式為前端期望格式
    const convertedPredictions = convertOpenAIPredictions(aiResponse, financialData)
    console.log('🔄 轉換後的預測格式:', JSON.stringify(convertedPredictions, null, 2))

    // 結構化趨勢預測結果
    const prediction: TrendPrediction = {
      predictions: convertedPredictions,
      trends: aiResponse.trends || extractTrendsFromOpenAI(aiResponse),
      opportunities: aiResponse.opportunities || [],
      risks: aiResponse.risks || extractRisksFromOpenAI(aiResponse),
      recommendations: aiResponse.recommendations || extractRecommendationsFromOpenAI(aiResponse),
      confidence: aiResponse.confidence || 0.7,
      methodology: aiResponse.methodology || 'AI 分析基於歷史數據趨勢',
      generatedAt: new Date().toISOString(),
      analysisParams: {
        predictionPeriod,
        focusMetrics,
        analysisRange: financialData.analysisRange,
      },
    }

    return prediction
  }
  catch (error) {
    console.error('📈 AI 趨勢預測生成失敗，使用本地演算法:', error)

    // 本地備用演算法
    return generateFallbackTrendPrediction(financialData, predictionPeriod, focusMetrics)
  }
}

/**
 * 本地備用趨勢預測演算法
 */
function generateFallbackTrendPrediction(
  financialData: UserFinancialData,
  predictionPeriod: string,
  focusMetrics: string[],
): TrendPrediction {
  const monthlyStats = (financialData.summary as any).monthlyStats
  const { summary } = financialData

  // 計算平均增長率
  const incomeGrowthRate = calculateGrowthRate(monthlyStats.map((m: any) => m.income))
  const expenseGrowthRate = calculateGrowthRate(monthlyStats.map((m: any) => m.expenses))

  // 基於歷史趨勢預測未來
  const predictions = {
    income: {
      predicted: summary.totalIncome * (1 + incomeGrowthRate),
      confidence: Math.max(0.3, 1 - Math.abs(incomeGrowthRate) * 2),
      trend: incomeGrowthRate > 0.05 ? 'increasing' as const : incomeGrowthRate < -0.05 ? 'decreasing' as const : 'stable' as const,
    },
    expenses: {
      predicted: summary.totalExpenses * (1 + expenseGrowthRate),
      confidence: Math.max(0.3, 1 - Math.abs(expenseGrowthRate) * 2),
      trend: expenseGrowthRate > 0.05 ? 'increasing' as const : expenseGrowthRate < -0.05 ? 'decreasing' as const : 'stable' as const,
    },
    savings: {
      predicted: summary.netAmount * (1 + (incomeGrowthRate - expenseGrowthRate)),
      confidence: 0.6,
      trend: incomeGrowthRate > expenseGrowthRate ? 'increasing' as const : 'decreasing' as const,
    },
  }

  return {
    predictions,
    trends: [
      {
        metric: '收入趨勢',
        direction: predictions.income.trend === 'increasing' ? 'up' : predictions.income.trend === 'decreasing' ? 'down' : 'stable',
        strength: Math.abs(incomeGrowthRate),
        description: `收入呈現${predictions.income.trend === 'increasing' ? '上升' : predictions.income.trend === 'decreasing' ? '下降' : '穩定'}趨勢`,
      },
      {
        metric: '支出趨勢',
        direction: predictions.expenses.trend === 'increasing' ? 'up' : predictions.expenses.trend === 'decreasing' ? 'down' : 'stable',
        strength: Math.abs(expenseGrowthRate),
        description: `支出呈現${predictions.expenses.trend === 'increasing' ? '上升' : predictions.expenses.trend === 'decreasing' ? '下降' : '穩定'}趨勢`,
      },
    ],
    opportunities: predictions.income.trend === 'increasing' ? ['收入增長趨勢良好，可考慮增加投資'] : [],
    risks: predictions.expenses.trend === 'increasing' && predictions.income.trend !== 'increasing' ? ['支出增長過快，需要控制開支'] : [],
    recommendations: [
      '建議持續監控收支變化',
      '根據趨勢調整財務規劃',
      '建立適當的風險預備金',
    ],
    confidence: 0.6,
    methodology: '基於歷史數據線性回歸分析',
    generatedAt: new Date().toISOString(),
    analysisParams: {
      predictionPeriod,
      focusMetrics,
      analysisRange: financialData.analysisRange,
    },
  }
}

/**
 * 生成月度統計數據
 */
function generateMonthlyStats(records: any[]) {
  const monthlyData = new Map()

  records.forEach((record) => {
    const monthKey = record.date.toISOString().substring(0, 7) // YYYY-MM

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { month: monthKey, income: 0, expenses: 0 })
    }

    const data = monthlyData.get(monthKey)
    if (record.type === 'income') {
      data.income += record.amount
    }
    else {
      data.expenses += record.amount
    }
  })

  return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * 計算分類趨勢
 */
function calculateCategoryTrends(records: any[]) {
  const categoryStats = new Map()

  records.filter(r => r.type === 'expense').forEach((record) => {
    const categoryId = record.categoryId?._id?.toString() || 'uncategorized'
    const categoryName = record.categoryId?.name || '未分類'

    if (!categoryStats.has(categoryId)) {
      categoryStats.set(categoryId, {
        categoryId,
        categoryName,
        totalAmount: 0,
        recordCount: 0,
        averageAmount: 0,
      })
    }

    const stats = categoryStats.get(categoryId)
    stats.totalAmount += record.amount
    stats.recordCount += 1
    stats.averageAmount = stats.totalAmount / stats.recordCount
  })

  return Array.from(categoryStats.values())
}

/**
 * 計算增長率
 */
function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0

  // 使用簡單線性回歸計算趨勢
  const n = values.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = values

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgY = sumY / n

  // 返回相對增長率
  return avgY > 0 ? slope / avgY : 0
}

/**
 * 生成備用預測數據
 */
function generateFallbackPredictions(financialData: UserFinancialData) {
  const { summary } = financialData

  return {
    income: {
      predicted: summary.totalIncome * 1.02, // 假設2%增長
      confidence: 0.5,
      trend: 'stable' as const,
    },
    expenses: {
      predicted: summary.totalExpenses * 1.03, // 假設3%增長
      confidence: 0.5,
      trend: 'increasing' as const,
    },
    savings: {
      predicted: summary.netAmount * 0.98, // 假設儲蓄略減
      confidence: 0.4,
      trend: 'decreasing' as const,
    },
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
      startDate.setMonth(endDate.getMonth() - 6)
  }

  return { startDate, endDate }
}

/**
 * 轉換 OpenAI 回應為前端期望的預測格式
 */
function convertOpenAIPredictions(aiResponse: any, financialData: UserFinancialData) {
  const { summary } = financialData

  // 如果 OpenAI 已經提供了正確格式，直接使用
  if (aiResponse.predictions
    && typeof aiResponse.predictions === 'object'
    && aiResponse.predictions.income) {
    return aiResponse.predictions
  }

  // 否則基於現有數據和 AI 分析生成預測
  const avgMonthlyIncome = summary.totalIncome / 6 // 6個月平均
  const avgMonthlyExpenses = summary.totalExpenses / 6

  // 從 AI 分析中提取趨勢信息
  let incomeGrowthRate = 0.02 // 預設 2% 增長
  let expenseGrowthRate = 0.03 // 預設 3% 增長

  if (Array.isArray(aiResponse.predictions)) {
    // 分析各類別預測來調整整體趨勢
    for (const pred of aiResponse.predictions) {
      if (pred.currentTrend === 'increasing') {
        expenseGrowthRate += pred.predictedChange ? pred.predictedChange / 100 : 0.05
      }
      else if (pred.currentTrend === 'decreasing') {
        expenseGrowthRate -= pred.predictedChange ? pred.predictedChange / 100 : 0.05
      }
    }
  }

  // 限制增長率在合理範圍內
  incomeGrowthRate = Math.max(-0.2, Math.min(0.2, incomeGrowthRate))
  expenseGrowthRate = Math.max(-0.2, Math.min(0.3, expenseGrowthRate))

  return {
    income: {
      predicted: avgMonthlyIncome * (1 + incomeGrowthRate) * 3, // 3個月預測
      confidence: 0.7,
      trend: incomeGrowthRate > 0.05 ? 'increasing' : incomeGrowthRate < -0.05 ? 'decreasing' : 'stable',
    },
    expenses: {
      predicted: avgMonthlyExpenses * (1 + expenseGrowthRate) * 3,
      confidence: 0.8,
      trend: expenseGrowthRate > 0.05 ? 'increasing' : expenseGrowthRate < -0.05 ? 'decreasing' : 'stable',
    },
    savings: {
      predicted: (avgMonthlyIncome * (1 + incomeGrowthRate) - avgMonthlyExpenses * (1 + expenseGrowthRate)) * 3,
      confidence: 0.6,
      trend: (incomeGrowthRate - expenseGrowthRate) > 0.02 ? 'increasing' : (incomeGrowthRate - expenseGrowthRate) < -0.02 ? 'decreasing' : 'stable',
    },
  }
}

/**
 * 從 OpenAI 回應中提取趨勢信息
 */
function extractTrendsFromOpenAI(aiResponse: any) {
  const trends = []

  if (Array.isArray(aiResponse.predictions)) {
    for (const pred of aiResponse.predictions) {
      trends.push({
        metric: pred.category || '支出趨勢',
        direction: pred.currentTrend === 'increasing' ? 'up' : pred.currentTrend === 'decreasing' ? 'down' : 'stable',
        strength: pred.predictedChange ? pred.predictedChange / 100 : 0.1,
        description: `${pred.category}呈現${pred.currentTrend === 'increasing' ? '上升' : pred.currentTrend === 'decreasing' ? '下降' : '穩定'}趨勢`,
      })
    }
  }

  return trends
}

/**
 * 從 OpenAI 回應中提取風險警示
 */
function extractRisksFromOpenAI(aiResponse: any) {
  const risks = []

  if (Array.isArray(aiResponse.alerts)) {
    for (const alert of aiResponse.alerts) {
      if (alert.type === 'warning' && alert.message) {
        risks.push(alert.message)
      }
    }
  }

  return risks
}

/**
 * 從 OpenAI 回應中提取建議
 */
function extractRecommendationsFromOpenAI(aiResponse: any) {
  const recommendations = []

  if (Array.isArray(aiResponse.alerts)) {
    for (const alert of aiResponse.alerts) {
      if (alert.recommendation) {
        recommendations.push(alert.recommendation)
      }
    }
  }

  // 添加通用建議
  if (aiResponse.opportunities && Array.isArray(aiResponse.opportunities)) {
    for (const opportunity of aiResponse.opportunities) {
      recommendations.push(`建議：${opportunity}`)
    }
  }

  return recommendations
}
