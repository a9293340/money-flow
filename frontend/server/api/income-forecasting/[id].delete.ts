/**
 * 刪除收入預測項目（軟刪除）
 * DELETE /api/income-forecasting/[id]
 */

import mongoose from 'mongoose'
import { IncomeForecasting } from '~/lib/models'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 獲取用戶信息
    const user = await verifyAndGetUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '未授權訪問',
      })
    }

    // 獲取收入預測項目 ID
    const forecastingId = getRouterParam(event, 'id')
    if (!forecastingId || !mongoose.Types.ObjectId.isValid(forecastingId)) {
      throw createError({
        statusCode: 400,
        statusMessage: '無效的收入預測項目 ID',
      })
    }

    // 查詢收入預測項目
    const forecasting = await IncomeForecasting.findOne({
      _id: forecastingId,
      userId: user._id,
      isDeleted: false,
    })

    if (!forecasting) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的收入預測項目',
      })
    }

    // 執行軟刪除
    await forecasting.softDelete()

    return {
      success: true,
      message: '收入預測項目刪除成功',
    }
  }
  catch (error: any) {
    console.error('刪除收入預測項目失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '刪除收入預測項目失敗',
    })
  }
})
