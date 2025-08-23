/**
 * 更新收入預測項目
 * PUT /api/income-forecasting/[id]
 */

import mongoose from 'mongoose'
import { IncomeForecasting, IncomeForecastFrequency, Category } from '~/lib/models'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

interface UpdateIncomeForecastingRequest {
  name?: string
  description?: string
  expectedAmount?: number
  currency?: string
  incomeCategory?: string
  frequency?: IncomeForecastFrequency
  startDate?: string
  endDate?: string
  isActive?: boolean
  matchingConfig?: {
    amountTolerance?: number
    dateTolerance?: number
    autoMatch?: boolean
  }
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
    const body: UpdateIncomeForecastingRequest = await readBody(event)

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

    // 驗證名稱唯一性（如果要更新名稱）
    if (body.name && body.name.trim() !== forecasting.name) {
      const existingForecasting = await IncomeForecasting.findOne({
        userId: user._id,
        name: body.name.trim(),
        isDeleted: false,
        _id: { $ne: forecastingId },
      })

      if (existingForecasting) {
        throw createError({
          statusCode: 400,
          statusMessage: '收入預測項目名稱已存在',
        })
      }
    }

    // 驗證收入分類（如果要更新分類）
    if (body.incomeCategory) {
      if (!mongoose.Types.ObjectId.isValid(body.incomeCategory)) {
        throw createError({
          statusCode: 400,
          statusMessage: '收入分類 ID 格式無效',
        })
      }

      const category = await Category.findById(body.incomeCategory)
      if (!category) {
        throw createError({
          statusCode: 400,
          statusMessage: '指定的收入分類不存在',
        })
      }

      if (category.type !== 'income') {
        throw createError({
          statusCode: 400,
          statusMessage: '必須選擇收入類型的分類',
        })
      }

      if (category.scope === 'personal' && category.userId?.toString() !== user._id.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: '無法使用其他用戶的個人分類',
        })
      }
    }

    // 驗證金額（如果要更新金額）
    if (body.expectedAmount !== undefined && body.expectedAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '預期金額必須大於 0',
      })
    }

    // 驗證頻率（如果要更新頻率）
    if (body.frequency && !Object.values(IncomeForecastFrequency).includes(body.frequency)) {
      throw createError({
        statusCode: 400,
        statusMessage: '不支援的頻率類型',
      })
    }

    // 驗證日期（如果要更新日期）
    let startDate = forecasting.startDate
    let endDate = forecasting.endDate

    if (body.startDate) {
      startDate = new Date(body.startDate)
    }

    if (body.endDate !== undefined) {
      endDate = body.endDate ? new Date(body.endDate) : undefined
    }

    if (endDate && endDate <= startDate) {
      throw createError({
        statusCode: 400,
        statusMessage: '結束日期必須晚於開始日期',
      })
    }

    // 準備更新數據
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim()
    if (body.expectedAmount !== undefined) updateData.expectedAmount = body.expectedAmount
    if (body.currency !== undefined) updateData.currency = body.currency
    if (body.incomeCategory !== undefined) updateData.incomeCategory = new mongoose.Types.ObjectId(body.incomeCategory)
    if (body.frequency !== undefined) updateData.frequency = body.frequency
    if (body.startDate !== undefined) updateData.startDate = startDate
    if (body.endDate !== undefined) updateData.endDate = endDate
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // 更新匹配配置
    if (body.matchingConfig) {
      updateData['matchingConfig.amountTolerance'] = body.matchingConfig.amountTolerance ?? forecasting.matchingConfig.amountTolerance
      updateData['matchingConfig.dateTolerance'] = body.matchingConfig.dateTolerance ?? forecasting.matchingConfig.dateTolerance
      updateData['matchingConfig.autoMatch'] = body.matchingConfig.autoMatch ?? forecasting.matchingConfig.autoMatch
    }

    // 執行更新
    await IncomeForecasting.findByIdAndUpdate(forecastingId, updateData, { new: true })

    // 重新載入更新後的數據
    const updatedForecasting = await IncomeForecasting.findById(forecastingId)
      .populate('incomeCategory', 'name type color icon')

    // 如果更改了關鍵參數，重新執行匹配
    const shouldRematch = body.incomeCategory || body.expectedAmount || body.matchingConfig
    if (shouldRematch && updatedForecasting.matchingConfig.autoMatch) {
      await updatedForecasting.performAutoMatch()
    }

    // 更新統計
    await updatedForecasting.updateStatistics()

    return {
      success: true,
      data: updatedForecasting,
      message: '收入預測項目更新成功',
    }
  }
  catch (error: any) {
    console.error('更新收入預測項目失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '更新收入預測項目失敗',
    })
  }
})
