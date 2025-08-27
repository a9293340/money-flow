/**
 * 獲取用戶的歷史 AI 財務分析記錄
 * 路由: GET /api/financial-profile/history
 */

import { z } from 'zod'
import FinancialAnalysisResultModel from '~/server/models/FinancialAnalysisResult'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 查詢參數驗證
const querySchema = z.object({
  page: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1).max(50)).default(10),
  status: z.enum(['active', 'expired', 'archived']).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // 確保用戶已認證
    const user = ensureUserContext(event)

    // 驗證查詢參數
    const query = await getValidatedQuery(event, querySchema.parse)

    console.log('🔍 獲取用戶分析歷史:', {
      userId: user._id ? user._id.toString() : user.id,
      query,
    })

    // 建構查詢條件
    const filterConditions: Record<string, any> = {
      userId: user._id ? user._id.toString() : user.id,
    }

    if (query.status) {
      filterConditions.status = query.status
    }

    // 分頁計算
    const skip = (query.page - 1) * query.limit

    // 獲取分析記錄
    const [analysisRecords, totalCount] = await Promise.all([
      FinancialAnalysisResultModel.find(filterConditions)
        .select('_id createdAt expiresAt status analysis.healthScore analysis.riskProfile usage feedback')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),

      FinancialAnalysisResultModel.countDocuments(filterConditions),
    ])

    // 轉換為前端需要的格式
    const results = analysisRecords.map((record: any) => ({
      id: record._id.toString(),
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      status: record.status,
      healthScore: record.analysis?.healthScore || 0,
      riskProfile: record.analysis?.riskProfile || 'moderate',
      usage: record.usage,
      feedback: record.feedback,
      isExpired: new Date() > new Date(record.expiresAt),
    }))

    // 分頁資訊
    const pagination = {
      current: query.page,
      total: Math.ceil(totalCount / query.limit),
      hasNext: query.page < Math.ceil(totalCount / query.limit),
      hasPrevious: query.page > 1,
      totalRecords: totalCount,
    }

    console.log('✅ 獲取分析歷史成功:', {
      recordCount: results.length,
      totalCount,
      pagination,
    })

    return {
      success: true,
      results,
      pagination,
      filters: {
        status: query.status,
      },
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    console.error('❌ 獲取分析歷史失敗:', error)

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get analysis history: ${error.message}`,
    })
  }
})
