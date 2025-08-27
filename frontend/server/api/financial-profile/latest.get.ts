/**
 * 獲取用戶最新的 AI 財務分析結果
 * 路由: GET /api/financial-profile/latest
 */

import FinancialAnalysisResultModel from '~/server/models/FinancialAnalysisResult'
import ensureUserContext from '~/server/utils/ensureUserContext'

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶已認證
    const user = ensureUserContext(event)

    console.log('🔍 獲取用戶最新分析結果:', user._id ? user._id.toString() : user.id)

    // 獲取用戶最新的活躍分析結果
    const latestAnalysis: any = await FinancialAnalysisResultModel.findOne({
      userId: user._id ? user._id.toString() : user.id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean()

    if (!latestAnalysis) {
      return {
        success: true,
        data: null,
        message: 'No active analysis found',
      }
    }

    console.log('✅ 找到最新分析結果:', latestAnalysis._id)

    // 轉換為前端需要的格式
    const result = {
      id: latestAnalysis._id.toString(),
      userId: latestAnalysis.userId,
      profileId: latestAnalysis.profileId,
      analysis: latestAnalysis.analysis,
      recommendations: latestAnalysis.recommendations,
      riskAssessment: latestAnalysis.riskAssessment,
      financialPlan: latestAnalysis.financialPlan,
      budgetSuggestions: latestAnalysis.budgetSuggestions,
      investmentAdvice: latestAnalysis.investmentAdvice,
      goalStrategies: latestAnalysis.goalStrategies,
      usage: latestAnalysis.usage,
      createdAt: latestAnalysis.createdAt,
      expiresAt: latestAnalysis.expiresAt,
      status: latestAnalysis.status,
      feedback: latestAnalysis.feedback,
    }

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    console.error('❌ 獲取最新分析結果失敗:', error)

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get latest analysis: ${error.message}`,
    })
  }
})
