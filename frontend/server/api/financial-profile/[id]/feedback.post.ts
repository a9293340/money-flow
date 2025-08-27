/**
 * 提交用戶對 AI 財務分析結果的反饋
 * 路由: POST /api/financial-profile/[id]/feedback
 */

import { z } from 'zod'
import FinancialAnalysisResultModel from '~/server/models/FinancialAnalysisResult'
import ensureUserContext from '~/server/utils/ensureUserContext'

// 反饋資料驗證
const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  helpful: z.boolean().optional(),
  comments: z.string().max(500).optional(),
})

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

    // 驗證請求體
    const body = await readBody(event)
    const feedbackData = feedbackSchema.parse(body)

    console.log('📝 用戶提交反饋:', {
      analysisId,
      userId: user._id ? user._id.toString() : user.id,
      rating: feedbackData.rating,
      helpful: feedbackData.helpful,
      hasComments: !!feedbackData.comments,
    })

    // 檢查分析記錄是否存在且屬於當前用戶
    const analysisRecord = await FinancialAnalysisResultModel.findOne({
      _id: analysisId,
      userId: user._id ? user._id.toString() : user.id,
    })

    if (!analysisRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Analysis record not found',
      })
    }

    // 允許更新現有反饋（而非阻止重複提交）
    const isUpdating = !!analysisRecord.feedback

    // 更新反饋資料
    const updateData = {
      feedback: {
        rating: feedbackData.rating,
        helpful: feedbackData.helpful,
        comments: feedbackData.comments,
        feedbackAt: new Date(),
      },
      updatedAt: new Date(),
    }

    const updatedRecord: any = await FinancialAnalysisResultModel.findByIdAndUpdate(
      analysisId,
      updateData,
      { new: true, lean: true },
    )

    if (!updatedRecord) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update analysis record',
      })
    }

    console.log(`✅ 反饋${isUpdating ? '更新' : '提交'}成功:`, analysisId)

    return {
      success: true,
      message: `Feedback ${isUpdating ? 'updated' : 'submitted'} successfully`,
      data: {
        id: updatedRecord._id.toString(),
        feedback: updatedRecord.feedback,
      },
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    console.error('❌ 提交反饋失敗:', error)

    // 如果是 Zod 驗證錯誤
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid feedback data: ${error.errors.map((e: any) => e.message).join(', ')}`,
      })
    }

    // 如果已經是 createError 創建的錯誤，直接拋出
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to submit feedback: ${error.message}`,
    })
  }
})
