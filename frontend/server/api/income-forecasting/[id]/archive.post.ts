/**
 * 手動歸檔收入記錄到預測項目
 * POST /api/income-forecasting/[id]/archive
 */

import mongoose from 'mongoose'
import { IncomeForecasting, IncomePeriod, Record } from '~/lib/models'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

interface ArchiveRecordRequest {
  recordId: string
  periodId?: string // 可選：指定特定期間，否則自動選擇最適合的期間
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
    const body: ArchiveRecordRequest = await readBody(event)

    if (!body.recordId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少記錄 ID',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(body.recordId)) {
      throw createError({
        statusCode: 400,
        statusMessage: '無效的記錄 ID',
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

    // 查詢要歸檔的記錄
    const record = await Record.findOne({
      _id: body.recordId,
      userId: user._id,
      type: 'income',
      isDeleted: false,
    })

    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的收入記錄或記錄不是收入類型',
      })
    }

    // 檢查記錄是否已經被匹配
    if (record.incomeForecastMatching?.forecastingId) {
      throw createError({
        statusCode: 400,
        statusMessage: '該記錄已經被匹配到其他收入預測項目',
      })
    }

    // 驗證記錄分類是否匹配
    if (record.category?.toString() !== forecasting.incomeCategory.toString()) {
      throw createError({
        statusCode: 400,
        statusMessage: '記錄分類與預測項目分類不符',
      })
    }

    let targetPeriod

    if (body.periodId) {
      // 使用指定的期間
      if (!mongoose.Types.ObjectId.isValid(body.periodId)) {
        throw createError({
          statusCode: 400,
          statusMessage: '無效的期間 ID',
        })
      }

      targetPeriod = await IncomePeriod.findOne({
        _id: body.periodId,
        forecastingId: forecasting._id,
        userId: user._id,
        isDeleted: false,
      })

      if (!targetPeriod) {
        throw createError({
          statusCode: 404,
          statusMessage: '找不到指定的追蹤期間',
        })
      }
    }
    else {
      // 自動選擇最適合的期間
      const recordDate = new Date(record.date)

      // 尋找包含此日期的期間
      targetPeriod = await IncomePeriod.findOne({
        forecastingId: forecasting._id,
        userId: user._id,
        isDeleted: false,
        startDate: { $lte: recordDate },
        endDate: { $gte: recordDate },
      })

      // 如果找不到完全匹配的期間，找最近的期間
      if (!targetPeriod) {
        targetPeriod = await IncomePeriod.findOne({
          forecastingId: forecasting._id,
          userId: user._id,
          isDeleted: false,
        }).sort({
          startDate: 1,
        }).limit(1)
      }
    }

    if (!targetPeriod) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到適合的追蹤期間，請先生成期間',
      })
    }

    // 計算匹配信心度（手動歸檔預設較高）
    const confidence = forecasting.calculateMatchConfidence(record, targetPeriod)

    // 執行歸檔
    await forecasting.matchRecordToPeriod(record, targetPeriod, Math.max(confidence, 0.8), true)

    // 更新統計
    await forecasting.updateStatistics()

    // 重新載入數據
    const updatedPeriod = await IncomePeriod.findById(targetPeriod._id)
      .populate({
        path: 'matchedRecords.recordId',
        select: 'amount date description account',
      })

    return {
      success: true,
      data: {
        period: updatedPeriod,
        matchedRecord: {
          recordId: record._id,
          amount: record.amount,
          confidence,
          isManual: true,
        },
      },
      message: '記錄歸檔成功',
    }
  }
  catch (error: any) {
    console.error('手動歸檔失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '手動歸檔失敗',
    })
  }
})
