/**
 * 生成收入預測追蹤期間
 * POST /api/income-forecasting/[id]/generate-periods
 */

import mongoose from 'mongoose'
import { IncomeForecasting } from '~/lib/models'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

interface GeneratePeriodsRequest {
  count?: number // 要生成的期間數量，預設為 3
}

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

    // 獲取請求體
    const body: GeneratePeriodsRequest = await readBody(event) || {}
    const count = Math.min(Math.max(body.count || 3, 1), 12) // 限制在 1-12 之間

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

    const generatedPeriods = []
    let successCount = 0

    // 生成指定數量的期間
    for (let i = 0; i < count; i++) {
      try {
        const period = await forecasting.generateNextPeriod()

        if (!period) {
          // 可能已經達到結束日期，無法生成更多期間
          break
        }

        generatedPeriods.push(period)
        successCount++
      }
      catch (error) {
        console.error(`生成第 ${i + 1} 個期間失敗:`, error)
        // 繼續嘗試生成下一個期間
        break
      }
    }

    // 更新統計
    await forecasting.updateStatistics()

    // 如果啟用自動匹配，為新期間執行匹配
    if (forecasting.matchingConfig.autoMatch && generatedPeriods.length > 0) {
      await forecasting.performAutoMatch()
    }

    return {
      success: true,
      data: {
        generatedCount: successCount,
        periods: generatedPeriods,
        forecasting: await IncomeForecasting.findById(forecastingId)
          .populate('incomeCategory', 'name type color icon'),
      },
      message: `成功生成 ${successCount} 個追蹤期間`,
    }
  }
  catch (error: any) {
    console.error('生成追蹤期間失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '生成追蹤期間失敗',
    })
  }
})
