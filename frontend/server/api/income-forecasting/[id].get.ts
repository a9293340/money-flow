/**
 * 獲取單一收入預測項目詳情
 * GET /api/income-forecasting/[id]
 */

import mongoose from 'mongoose'
import { IncomeForecasting, IncomePeriod } from '~/lib/models'
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
    }).populate('incomeCategory', 'name type color icon')

    if (!forecasting) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的收入預測項目',
      })
    }

    // 獲取查詢參數
    const query = getQuery(event)
    const includePeriods = query.includePeriods === 'true'
    const periodsLimit = Number.parseInt(query.periodsLimit as string) || 10

    let periods = []
    if (includePeriods) {
      // 查詢相關的追蹤期間
      periods = await IncomePeriod.find({
        forecastingId: forecasting._id,
        userId: user._id,
        isDeleted: false,
      })
        .sort({ periodNumber: -1 })
        .limit(periodsLimit)
        .populate({
          path: 'matchedRecords.recordId',
          select: 'amount date description account',
        })
    }

    // 更新統計資訊（如果需要）
    if (query.refreshStats === 'true') {
      await forecasting.updateStatistics()
      await forecasting.reload()
    }

    return {
      success: true,
      data: {
        forecasting,
        periods: includePeriods ? periods : undefined,
        periodsCount: includePeriods ? periods.length : undefined,
      },
    }
  }
  catch (error: any) {
    console.error('獲取收入預測項目失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '獲取收入預測項目失敗',
    })
  }
})
