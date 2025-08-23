/**
 * 執行智能匹配更新
 * POST /api/income-forecasting/[id]/match
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
      isActive: true,
    })

    if (!forecasting) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的收入預測項目或項目已停用',
      })
    }

    // 檢查是否啟用自動匹配
    if (!forecasting.matchingConfig.autoMatch) {
      throw createError({
        statusCode: 400,
        statusMessage: '此收入預測項目未啟用自動匹配',
      })
    }

    // 執行智能匹配
    const matchedCount = await forecasting.performAutoMatch()

    // 更新統計
    await forecasting.updateStatistics()

    // 重新載入數據
    await forecasting.populate('incomeCategory', 'name type color icon')

    return {
      success: true,
      data: {
        forecasting,
        matchedCount,
      },
      message: `智能匹配完成，成功匹配 ${matchedCount} 筆記錄`,
    }
  }
  catch (error: any) {
    console.error('智能匹配失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '智能匹配失敗',
    })
  }
})
