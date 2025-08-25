/**
 * 財務健康診斷 API
 *
 * POST /api/ai-insights/health-diagnosis
 *
 * 功能：
 * - 分析使用者的財務健康狀況
 * - 提供 AI 驅動的建議和評分
 * - 支援本地計算備援方案
 */

import { z } from 'zod'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { useCacheManager } from '~/lib/ai/cache-manager'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import { DataPreprocessor, financialAnalyzer } from '~/lib/ai/financial-analyzer'
import { promptTemplates } from '~/lib/ai/prompt-templates'
import { canPerformAnalysis, saveAnalysisResult, getCachedAnalysisResult, formatWaitTime } from '~/lib/models/ai-analysis-record'
import type {
  AIEndpointResponse,
  FinancialHealthDiagnosis,
  UserFinancialSummary,
} from '~/types/ai'
import { Record } from '~/lib/models'

/**
 * 請求體驗證 Schema
 */
const RequestSchema = z.object({
  timeRange: z.enum(['1M', '3M', '6M', '1Y']).default('3M'),
  useAI: z.boolean().default(true),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    detailLevel: z.enum(['brief', 'detailed', 'comprehensive']).default('detailed'),
    language: z.enum(['zh-TW', 'zh-CN', 'en']).default('zh-TW'),
  }).optional(),
})

type RequestBody = z.infer<typeof RequestSchema>

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
      start.setMonth(end.getMonth() - 3) // 預設 3 個月
  }

  return { start, end }
}

/**
 * 從資料庫獲取使用者財務資料
 */
async function fetchUserFinancialData(
  userId: string,
  timeRange: { start: Date, end: Date },
): Promise<{
    records: unknown[]
    budgets: unknown[]
  }> {
  try {
    // 獲取時間範圍內的記錄
    const records = await Record.find({
      userId,
      date: {
        $gte: timeRange.start,
        $lte: timeRange.end,
      },
      isDeleted: { $ne: true },
    }).sort({ date: -1 }).lean()

    // TODO: 獲取預算資料（當預算 API 可用時）
    const budgets: unknown[] = []

    return {
      records: records || [],
      budgets,
    }
  }
  catch (error) {
    console.error('獲取使用者財務資料失敗:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '無法獲取財務資料',
    })
  }
}

/**
 * 使用 AI 進行健康診斷
 */
async function performAIDiagnosis(
  summary: UserFinancialSummary,
  options: RequestBody['options'] = {
    includeRecommendations: true,
    detailLevel: 'detailed',
    language: 'zh-TW',
  },
): Promise<{
    success: boolean
    diagnosis?: FinancialHealthDiagnosis
    error?: string
    isAIGenerated: boolean
  }> {
  try {
    const openaiClient = useOpenAIClient()

    // 準備提示詞參數
    const promptParams = {
      userName: '使用者', // 暫時使用匿名
      timeRange: `${Math.round((summary.timeRange.end.getTime() - summary.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} 天`,
      totalIncome: summary.income.total,
      totalExpense: summary.expenses.total,
      categories: summary.expenses.byCategory.map(cat => ({
        name: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
      recentTransactions: [], // TODO: 從 summary 中提取最近交易
    }

    // 生成提示詞
    const { systemPrompt, userPrompt } = promptTemplates.healthDiagnosis(promptParams)

    // 調用 OpenAI API
    const aiResponse = await openaiClient.analyzeFinancialHealth(
      systemPrompt,
      userPrompt,
      {
        maxTokens: options?.detailLevel === 'comprehensive'
          ? 1500
          : options?.detailLevel === 'brief' ? 500 : 1000,
        temperature: 0.7,
      },
    )

    if (aiResponse.success && aiResponse.data) {
      // 合併 AI 回應和本地計算結果
      const localDiagnosis = financialAnalyzer.calculateHealth(summary)

      const enhancedDiagnosis: FinancialHealthDiagnosis = {
        healthScore: aiResponse.data.score || localDiagnosis.healthScore,
        grade: (aiResponse.data.grade as FinancialHealthDiagnosis['grade']) || localDiagnosis.grade,
        metrics: (aiResponse.data.metrics as any) || localDiagnosis.metrics,
        recommendations: aiResponse.data.recommendations?.length
          ? aiResponse.data.recommendations
          : localDiagnosis.recommendations,
        analysis: aiResponse.data.analysis || localDiagnosis.analysis,
        lastUpdated: new Date(),
      }

      return {
        success: true,
        diagnosis: enhancedDiagnosis,
        isAIGenerated: true,
      }
    }
    else {
      // AI 失敗時使用本地計算作為備援
      console.warn('AI 分析失敗，使用本地計算:', aiResponse.error?.message)
      return {
        success: true,
        diagnosis: financialAnalyzer.calculateHealth(summary),
        isAIGenerated: false,
      }
    }
  }
  catch (error) {
    console.error('AI 診斷失敗:', error)

    // 完全失敗時使用本地計算
    return {
      success: true,
      diagnosis: financialAnalyzer.calculateHealth(summary),
      isAIGenerated: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 主要 API 處理函數
 */
export default defineEventHandler(async (event): Promise<AIEndpointResponse<FinancialHealthDiagnosis & {
  isAIGenerated: boolean
  summary: UserFinancialSummary
}>> => {
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

    // 檢查分析頻率限制
    const analysisCheck = await canPerformAnalysis(user.id, 'health')

    if (!analysisCheck.canAnalyze) {
      // 返回緩存結果和等待時間信息
      const cachedResult = await getCachedAnalysisResult(user.id, 'health')

      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          message: `健康分析每24小時僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          cached: true,
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
        }
      }

      // 如果沒有緩存結果，返回錯誤
      throw createError({
        statusCode: 429,
        statusMessage: `健康分析每24小時僅能執行一次，${formatWaitTime(analysisCheck.nextAvailableAt!)}`,
        data: {
          nextAvailable: analysisCheck.nextAvailableAt?.toISOString(),
          waitTime: formatWaitTime(analysisCheck.nextAvailableAt!),
        },
      })
    }

    // 檢查快取 (短期快取，用於避免重複計算)
    if (validatedBody.useAI) {
      const cached = cacheManager.get(
        user.id,
        'health_diagnosis',
        validatedBody.timeRange,
        { timeRange: validatedBody.timeRange, options: validatedBody.options },
      )

      if (cached && cached.success) {
        return {
          success: true,
          data: cached.data as any,
          message: '從快取獲取分析結果',
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }
      }
    }

    // 獲取財務資料
    const { records, budgets } = await fetchUserFinancialData(user.id, timeRange)

    // 預處理資料
    const summary = DataPreprocessor.processUserData(
      user.id,
      records,
      budgets,
      timeRange,
    )

    // 執行健康診斷
    let result
    if (validatedBody.useAI) {
      result = await performAIDiagnosis(summary, validatedBody.options)
    }
    else {
      // 純本地計算
      result = {
        success: true,
        diagnosis: financialAnalyzer.calculateHealth(summary),
        isAIGenerated: false,
      }
    }

    if (!result.success || !result.diagnosis) {
      throw createError({
        statusCode: 500,
        statusMessage: '財務健康診斷失敗',
      })
    }

    // 準備回應資料
    const responseData = {
      ...result.diagnosis,
      isAIGenerated: result.isAIGenerated,
      summary,
    }

    // 儲存到快取
    if (validatedBody.useAI && result.success) {
      cacheManager.set(
        user.id,
        'health_diagnosis',
        validatedBody.timeRange,
        { timeRange: validatedBody.timeRange, options: validatedBody.options },
        {
          success: true,
          data: {
            ...responseData,
            timestamp: new Date().toISOString(),
          } as any,
        },
      )
    }

    // 保存分析結果到頻率限制記錄
    try {
      await saveAnalysisResult(user.id, 'health', responseData)
    }
    catch (saveError) {
      console.error('保存健康分析結果失敗:', saveError)
      // 不阻礙正常流程，僅記錄錯誤
    }

    // 回應成功結果
    return {
      success: true,
      data: responseData,
      message: result.isAIGenerated
        ? 'AI 財務健康診斷完成'
        : '本地財務健康計算完成',
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }
  }
  catch (error) {
    console.error('財務健康診斷 API 錯誤:', error)

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
