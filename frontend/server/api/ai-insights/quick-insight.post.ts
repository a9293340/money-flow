/**
 * 快速財務洞察 API
 *
 * POST /api/ai-insights/quick-insight
 *
 * 功能：
 * - 提供快速的財務分析洞察
 * - 適用於儀表板展示
 * - 低延遲、簡潔回應
 */

import { z } from 'zod'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { useCacheManager } from '~/lib/ai/cache-manager'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import { DataPreprocessor } from '~/lib/ai/financial-analyzer'
import { promptTemplates } from '~/lib/ai/prompt-templates'
import type { AIEndpointResponse, UserFinancialSummary } from '~/types/ai'
import { Record } from '~/lib/models'

/**
 * 請求體驗證 Schema
 */
const RequestSchema = z.object({
  timeRange: z.enum(['1M', '3M', '6M', '1Y']).default('1M'),
  useAI: z.boolean().default(true),
})

/**
 * 快速洞察回應類型
 */
interface QuickInsightResponse {
  keyFindings: string[]
  quickRecommendations: string[]
  alertPoints: string[]
  summary: {
    income: number
    expense: number
    balance: number
    savingsRate: number
    topExpenseCategory: string
  }
  isAIGenerated: boolean
}

/**
 * 計算時間範圍
 */
function getTimeRange(range: string): { start: Date, end: Date } {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case '1M':
      start.setMonth(end.getMonth() - 1)
      break
    case '3M':
      start.setMonth(end.getMonth() - 3)
      break
    case '6M':
      start.setMonth(end.getMonth() - 6)
      break
    case '1Y':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      start.setMonth(end.getMonth() - 1) // 預設 1 個月
  }

  return { start, end }
}

/**
 * 生成本地快速洞察
 */
function generateLocalInsight(summary: UserFinancialSummary): QuickInsightResponse {
  const savingsRate = summary.balance.net / summary.income.total
  const topCategory = summary.expenses.byCategory[0]

  const keyFindings: string[] = []
  const quickRecommendations: string[] = []
  const alertPoints: string[] = []

  // 生成關鍵發現
  if (savingsRate >= 0.2) {
    keyFindings.push('儲蓄表現良好，超過 20% 儲蓄率')
  }
  else if (savingsRate >= 0.1) {
    keyFindings.push('儲蓄率達到 10-20%，還有提升空間')
  }
  else if (savingsRate > 0) {
    keyFindings.push('儲蓄率偏低，建議檢視支出')
    alertPoints.push('儲蓄率不足 10%，需要注意')
  }
  else {
    keyFindings.push('支出超過收入，需要立即調整')
    alertPoints.push('出現負儲蓄，財務風險較高')
  }

  if (topCategory) {
    keyFindings.push(`主要支出類別為 ${topCategory.category}，佔 ${topCategory.percentage.toFixed(1)}%`)

    if (topCategory.percentage > 50) {
      alertPoints.push(`${topCategory.category} 支出比例過高`)
      quickRecommendations.push(`考慮減少 ${topCategory.category} 相關支出`)
    }
  }

  // 生成快速建議
  if (savingsRate < 0.1) {
    quickRecommendations.push('建議設定自動儲蓄計劃')
    quickRecommendations.push('檢視並減少非必要支出')
  }

  if (summary.expenses.byCategory.length > 1) {
    const secondCategory = summary.expenses.byCategory[1]
    if (secondCategory.percentage > 20) {
      quickRecommendations.push(`關注 ${secondCategory.category} 支出控制`)
    }
  }

  return {
    keyFindings,
    quickRecommendations,
    alertPoints,
    summary: {
      income: summary.income.total,
      expense: summary.expenses.total,
      balance: summary.balance.net,
      savingsRate: savingsRate * 100,
      topExpenseCategory: topCategory?.category || '無資料',
    },
    isAIGenerated: false,
  }
}

/**
 * 使用 AI 生成快速洞察
 */
async function generateAIInsight(summary: UserFinancialSummary): Promise<QuickInsightResponse> {
  try {
    const openaiClient = useOpenAIClient()

    // 準備簡化的提示詞參數
    const promptParams = {
      userName: '使用者',
      timeRange: `${Math.round((summary.timeRange.end.getTime() - summary.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} 天`,
      totalIncome: summary.income.total,
      totalExpense: summary.expenses.total,
      categories: summary.expenses.byCategory.slice(0, 5).map(cat => ({
        name: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
      recentTransactions: [], // 快速洞察不需要詳細交易
    }

    // 使用快速洞察提示詞模板
    const { systemPrompt, userPrompt } = promptTemplates.quickInsight(promptParams)

    // 調用 OpenAI API（較少 tokens）
    const aiResponse = await openaiClient.analyzeFinancialHealth(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 300, // 限制回應長度
        temperature: 0.5, // 較保守的創意度
      },
    )

    if (aiResponse.success && aiResponse.data?.analysis) {
      // 解析 AI 回應
      const analysis = aiResponse.data.analysis

      // 嘗試從 AI 回應中提取結構化資訊
      const lines = analysis.split('\n').filter(line => line.trim())

      const keyFindings: string[] = []
      const quickRecommendations: string[] = []
      const alertPoints: string[] = []

      // 簡單的文字解析（可以後續改進）
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.includes('發現') || trimmedLine.includes('觀察')) {
          keyFindings.push(trimmedLine)
        }
        else if (trimmedLine.includes('建議') || trimmedLine.includes('應該')) {
          quickRecommendations.push(trimmedLine)
        }
        else if (trimmedLine.includes('注意') || trimmedLine.includes('警示')) {
          alertPoints.push(trimmedLine)
        }
      }

      // 如果解析失敗，使用完整回應作為發現
      if (keyFindings.length === 0 && quickRecommendations.length === 0) {
        keyFindings.push(analysis)
      }

      const topCategory = summary.expenses.byCategory[0]
      const savingsRate = summary.balance.net / summary.income.total

      return {
        keyFindings,
        quickRecommendations,
        alertPoints,
        summary: {
          income: summary.income.total,
          expense: summary.expenses.total,
          balance: summary.balance.net,
          savingsRate: savingsRate * 100,
          topExpenseCategory: topCategory?.category || '無資料',
        },
        isAIGenerated: true,
      }
    }
    else {
      // AI 失敗時回退到本地生成
      console.warn('AI 快速洞察失敗，使用本地生成:', aiResponse.error?.message)
      return generateLocalInsight(summary)
    }
  }
  catch (error) {
    console.error('AI 快速洞察生成失敗:', error)
    // 錯誤時回退到本地生成
    return generateLocalInsight(summary)
  }
}

/**
 * 主要 API 處理函數
 */
export default defineEventHandler(async (event): Promise<AIEndpointResponse<QuickInsightResponse>> => {
  try {
    // 驗證請求方法
    assertMethod(event, 'POST')

    // 驗證使用者身份
    const user = await verifyAndGetUser(event)

    // 解析請求體
    const body = await readBody(event)
    const validatedBody = RequestSchema.parse(body)

    // 計算時間範圍
    const timeRange = getTimeRange(validatedBody.timeRange)

    // 初始化快取管理器
    const cacheManager = useCacheManager()

    // 檢查快取（快速洞察使用較短的 TTL）
    if (validatedBody.useAI) {
      const cached = cacheManager.get(
        user.id,
        'quick_insight',
        validatedBody.timeRange,
        { timeRange: validatedBody.timeRange },
      )

      if (cached && cached.success) {
        return {
          success: true,
          data: cached.data as any,
          message: '從快取獲取快速洞察',
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }
      }
    }

    // 獲取財務資料
    const records = await Record.find({
      userId: user.id,
      date: {
        $gte: timeRange.start,
        $lte: timeRange.end,
      },
      isDeleted: { $ne: true },
    }).sort({ date: -1 }).lean()

    // 預處理資料
    const summary = DataPreprocessor.processUserData(
      user.id,
      records || [],
      [], // 快速洞察不需要預算資料
      timeRange,
    )

    // 生成洞察
    let insightData: QuickInsightResponse
    if (validatedBody.useAI) {
      insightData = await generateAIInsight(summary)
    }
    else {
      insightData = generateLocalInsight(summary)
    }

    // 儲存到快取（較短的 TTL）
    if (validatedBody.useAI) {
      cacheManager.set(
        user.id,
        'quick_insight',
        validatedBody.timeRange,
        { timeRange: validatedBody.timeRange },
        {
          success: true,
          data: {
            ...insightData,
            timestamp: new Date().toISOString(),
          } as any,
        },
      )
    }

    return {
      success: true,
      data: insightData,
      message: insightData.isAIGenerated
        ? '快速 AI 洞察完成'
        : '快速本地洞察完成',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }
  }
  catch (error) {
    console.error('快速洞察 API 錯誤:', error)

    // 處理驗證錯誤
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '請求參數錯誤',
          stack: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
        },
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }
    }

    // 處理 HTTP 錯誤
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 處理未知錯誤
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '內部伺服器錯誤',
        stack: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : undefined,
      },
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }
  }
})
