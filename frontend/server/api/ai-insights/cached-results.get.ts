/**
 * 獲取用戶的已緩存 AI 分析結果
 * GET /api/ai-insights/cached-results
 *
 * 功能：頁面載入時獲取最新的分析結果和使用限制狀態
 */

import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { connectMongoDB } from '~/lib/mongodb'
import { canPerformAnalysis, getCachedAnalysisResult, formatWaitTime } from '~/lib/models/ai-analysis-record'

export default defineEventHandler(async (event) => {
  try {
    console.log('📋 獲取已緩存 AI 分析結果請求開始')

    // 驗證用戶身份
    const user = await verifyAndGetUser(event)
    if (!user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: '需要登入才能查看分析結果',
      })
    }

    // 連接資料庫
    await connectMongoDB()

    // 並行檢查三種分析的狀態和結果
    const [healthCheck, budgetCheck, trendCheck] = await Promise.all([
      // 健康分析
      Promise.all([
        canPerformAnalysis(user.id, 'health'),
        getCachedAnalysisResult(user.id, 'health'),
      ]),
      // 預算建議
      Promise.all([
        canPerformAnalysis(user.id, 'budget'),
        getCachedAnalysisResult(user.id, 'budget'),
      ]),
      // 趨勢預測
      Promise.all([
        canPerformAnalysis(user.id, 'trend'),
        getCachedAnalysisResult(user.id, 'trend'),
      ]),
    ])

    // 組織回應數據
    const responseData = {
      health: {
        canAnalyze: healthCheck[0].canAnalyze,
        hasResult: !!healthCheck[1],
        result: healthCheck[1],
        nextAvailable: healthCheck[0].nextAvailableAt?.toISOString(),
        waitTime: healthCheck[0].nextAvailableAt ? formatWaitTime(healthCheck[0].nextAvailableAt) : null,
        lastAnalyzedAt: healthCheck[0].lastAnalyzedAt?.toISOString(),
      },
      budget: {
        canAnalyze: budgetCheck[0].canAnalyze,
        hasResult: !!budgetCheck[1],
        result: budgetCheck[1],
        nextAvailable: budgetCheck[0].nextAvailableAt?.toISOString(),
        waitTime: budgetCheck[0].nextAvailableAt ? formatWaitTime(budgetCheck[0].nextAvailableAt) : null,
        lastAnalyzedAt: budgetCheck[0].lastAnalyzedAt?.toISOString(),
      },
      trend: {
        canAnalyze: trendCheck[0].canAnalyze,
        hasResult: !!trendCheck[1],
        result: trendCheck[1],
        nextAvailable: trendCheck[0].nextAvailableAt?.toISOString(),
        waitTime: trendCheck[0].nextAvailableAt ? formatWaitTime(trendCheck[0].nextAvailableAt) : null,
        lastAnalyzedAt: trendCheck[0].lastAnalyzedAt?.toISOString(),
      },
    }

    console.log('✅ AI 分析結果狀態檢查完成:', {
      health: { canAnalyze: responseData.health.canAnalyze, hasResult: responseData.health.hasResult },
      budget: { canAnalyze: responseData.budget.canAnalyze, hasResult: responseData.budget.hasResult },
      trend: { canAnalyze: responseData.trend.canAnalyze, hasResult: responseData.trend.hasResult },
    })

    return {
      success: true,
      data: responseData,
      message: '成功獲取 AI 分析狀態',
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    console.error('📋 獲取已緩存分析結果 API 錯誤:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '獲取分析結果失敗',
      data: {
        error: error.message,
        timestamp: new Date().toISOString(),
        userId: (await verifyAndGetUser(event).catch(() => null))?.id,
      },
    })
  }
})
