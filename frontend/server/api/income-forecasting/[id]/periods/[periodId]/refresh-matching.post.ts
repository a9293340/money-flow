/**
 * 重新匹配特定期間的收入記錄
 * POST /api/income-forecasting/[id]/periods/[periodId]/refresh-matching
 */

import mongoose from 'mongoose'
import { IncomePeriod, IncomeForecasting, Record } from '~/lib/models'
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

    if (!forecastingId || !periodId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要參數',
      })
    }

    // 查詢期間和預測
    const [period, forecasting] = await Promise.all([
      IncomePeriod.findOne({
        _id: periodId,
        forecastingId,
        userId: user._id,
        isDeleted: false,
      }),
      IncomeForecasting.findOne({
        _id: forecastingId,
        userId: user._id,
        isDeleted: false,
      }),
    ])

    if (!period || !forecasting) {
      throw createError({
        statusCode: 404,
        statusMessage: '找不到指定的期間或預測',
      })
    }

    // 清除現有的匹配記錄（只清除自動匹配的）
    period.matchedRecords = period.matchedRecords.filter((match: any) => match.isManual)

    // 查詢可能匹配的記錄
    const matchingConfig = forecasting.matchingConfig || {}
    const categoryIds = forecasting.categories?.map((c: any) => new mongoose.Types.ObjectId(c)) || []

    // 基本查詢條件
    const queryConditions: any = {
      userId: user._id,
      type: 'income',
      isDeleted: false,
      date: {
        $gte: period.matchingDateRange.startDate,
        $lte: period.matchingDateRange.endDate,
      },
    }

    // 分類匹配
    if (categoryIds.length > 0) {
      queryConditions.categoryId = { $in: categoryIds }
    }

    // 金額範圍匹配
    if (matchingConfig.amountTolerance && matchingConfig.amountTolerance > 0) {
      const tolerance = matchingConfig.amountTolerance
      const minAmount = period.expectedAmount * (1 - tolerance / 100)
      const maxAmount = period.expectedAmount * (1 + tolerance / 100)
      queryConditions.amount = { $gte: minAmount, $lte: maxAmount }
    }

    // 關鍵字匹配
    if (matchingConfig.keywords && matchingConfig.keywords.length > 0) {
      const keywordRegex = matchingConfig.keywords.map((k: any) => new RegExp(k, 'i'))
      queryConditions.$or = [
        { description: { $in: keywordRegex } },
        { tags: { $in: matchingConfig.keywords } },
      ]
    }

    // 排除已匹配到其他期間的記錄
    const existingMatches = await IncomePeriod.find({
      'userId': user._id,
      forecastingId,
      'isDeleted': false,
      '_id': { $ne: period._id },
      'matchedRecords.0': { $exists: true },
    }).select('matchedRecords.recordId')

    const excludeRecordIds = existingMatches.flatMap((p: any) =>
      p.matchedRecords.map((m: any) => m.recordId),
    )

    if (excludeRecordIds.length > 0) {
      queryConditions._id = { $nin: excludeRecordIds }
    }

    // 查詢候選記錄
    const candidateRecords = await Record.find(queryConditions)
      .sort({ date: -1 })
      .limit(20)

    // 計算匹配信心度並新增匹配記錄
    for (const record of candidateRecords) {
      let confidence = 0.3 // 基礎信心度

      // 日期匹配度
      const recordDate = new Date(record.date)
      const expectedDate = new Date(period.expectedPaymentDate)
      const dateDiff = Math.abs(recordDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
      const dateScore = Math.max(0, 1 - dateDiff / (matchingConfig.dateTolerance || 7))
      confidence += dateScore * 0.4

      // 金額匹配度
      const amountDiff = Math.abs(record.amount - period.expectedAmount)
      const amountRatio = amountDiff / period.expectedAmount
      const amountScore = Math.max(0, 1 - amountRatio)
      confidence += amountScore * 0.3

      // 關鍵字匹配加分
      if (matchingConfig.keywords && matchingConfig.keywords.length > 0) {
        for (const keyword of matchingConfig.keywords) {
          if (record.description?.toLowerCase().includes(keyword.toLowerCase())
            || record.tags?.includes(keyword)) {
            confidence += 0.1
          }
        }
      }

      // 只有信心度足夠高才新增匹配
      if (confidence >= (matchingConfig.minConfidence || 0.5)) {
        period.matchedRecords.push({
          recordId: record._id,
          matchedAmount: record.amount,
          confidence: Math.min(confidence, 1),
          matchedAt: new Date(),
          isManual: false,
        })
      }
    }

    // 更新期間狀態
    await period.updateStatus()

    return {
      success: true,
      data: {
        message: '重新匹配完成',
        matchedCount: period.matchedRecords.filter((m: any) => !m.isManual).length,
        totalMatches: period.matchedRecords.length,
      },
    }
  }
  catch (error: any) {
    console.error('重新匹配失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '重新匹配失敗',
    })
  }
})
