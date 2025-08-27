/**
 * 獲取特定的 AI 財務分析結果
 * 路由: GET /api/financial-profile/[id]
 */

import FinancialAnalysisResultModel from '~/server/models/FinancialAnalysisResult'
import ensureUserContext from '~/server/utils/ensureUserContext'

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶已認證
    const user = ensureUserContext(event)

    // 獲取分析記錄 ID
    const analysisId = getRouterParam(event, 'id')

    if (!analysisId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing analysis ID',
      })
    }

    console.log('🔍 獲取分析記錄:', {
      analysisId,
      userId: user._id ? user._id.toString() : user.id,
    })

    // 獲取指定的分析記錄
    const analysisRecord: any = await FinancialAnalysisResultModel.findOne({
      _id: analysisId,
      userId: user._id ? user._id.toString() : user.id, // 確保只能訪問自己的記錄
    }).lean()

    if (!analysisRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Analysis record not found',
      })
    }

    console.log('✅ 找到分析記錄:', analysisRecord._id)

    // 轉換為前端需要的格式
    const result = {
      id: analysisRecord._id.toString(),
      userId: analysisRecord.userId,
      profileId: analysisRecord.profileId,
      analysis: analysisRecord.analysis,
      recommendations: analysisRecord.recommendations,
      riskAssessment: analysisRecord.riskAssessment,
      financialPlan: analysisRecord.financialPlan,
      budgetSuggestions: analysisRecord.budgetSuggestions,
      investmentAdvice: analysisRecord.investmentAdvice,
      goalStrategies: analysisRecord.goalStrategies,
      usage: analysisRecord.usage,
      createdAt: analysisRecord.createdAt,
      updatedAt: analysisRecord.updatedAt,
      expiresAt: analysisRecord.expiresAt,
      status: analysisRecord.status,
      feedback: analysisRecord.feedback,
    }

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    console.error('❌ 獲取分析記錄失敗:', error)

    // 如果已經是 createError 創建的錯誤，直接拋出
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get analysis record: ${error.message}`,
    })
  }
})
