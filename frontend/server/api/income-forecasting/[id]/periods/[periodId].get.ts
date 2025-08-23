/**
 * 獲取收入預測的特定期間詳情
 * GET /api/income-forecasting/[id]/periods/[periodId]
 */

import { IncomePeriod, IncomeForecasting } from '~/lib/models'
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

    // 獲取路由參數
    const forecastingId = getRouterParam(event, 'id')
    const periodId = getRouterParam(event, 'periodId')

    if (!forecastingId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少收入預測 ID',
      })
    }

    if (!periodId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少期間 ID',
      })
    }

    // 查詢特定期間和收入預測資訊
    const [period, forecasting] = await Promise.all([
      IncomePeriod.findOne({
        _id: periodId,
        forecastingId,
        userId: user._id,
        isDeleted: false,
      }).populate({
        path: 'matchedRecords.recordId',
        select: 'amount date description categoryId tags currency',
      }),
      // 獲取收入預測以取得貨幣資訊
      IncomeForecasting.findOne({
        _id: forecastingId,
        userId: user._id,
        isDeleted: false,
      }).select('currency'),
    ])

    if (!period || !forecasting) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的期間或收入預測',
      })
    }

    // 將貨幣資訊加入期間資料中
    const periodData = period.toObject()
    periodData.currency = forecasting.currency

    return {
      success: true,
      data: periodData,
    }
  }
  catch (error: any) {
    console.error('獲取期間詳情失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '獲取期間詳情失敗',
    })
  }
})
