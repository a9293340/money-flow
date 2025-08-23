/**
 * 創建新的收入預測項目
 * POST /api/income-forecasting
 */

import mongoose from 'mongoose'
import { IncomeForecasting, IncomeForecastFrequency, PaymentScheduleType, FallbackRule, Category } from '~/lib/models'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

interface CreateIncomeForecastingRequest {
  name: string
  description?: string
  expectedAmount: number
  currency: string
  incomeCategory: string
  frequency: IncomeForecastFrequency
  startDate?: string
  endDate?: string
  paymentSchedule?: {
    type?: PaymentScheduleType
    dayOfMonth?: number
    fixedDate?: string
    workingDayOffset?: number
    customRule?: string
    fallbackRule?: FallbackRule
  }
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

    // 獲取請求體
    const body: CreateIncomeForecastingRequest = await readBody(event)

    // 驗證必要字段
    if (!body.name || !body.expectedAmount || !body.incomeCategory || !body.frequency) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要字段：name, expectedAmount, incomeCategory, frequency',
      })
    }

    // 驗證 incomeCategory 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(body.incomeCategory)) {
      throw createError({
        statusCode: 400,
        statusMessage: '收入分類 ID 格式無效',
      })
    }

    // 驗證收入分類是否存在且為收入類型
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

    // 檢查分類是否屬於該用戶或為系統分類
    if (category.scope === 'personal' && category.userId?.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: '無法使用其他用戶的個人分類',
      })
    }

    // 驗證名稱唯一性
    const existingForecasting = await IncomeForecasting.findOne({
      userId: user._id,
      name: body.name.trim(),
      isDeleted: false,
    })

    if (existingForecasting) {
      throw createError({
        statusCode: 400,
        statusMessage: '收入預測項目名稱已存在',
      })
    }

    // 驗證金額
    if (body.expectedAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '預期金額必須大於 0',
      })
    }

    // 驗證頻率
    if (!Object.values(IncomeForecastFrequency).includes(body.frequency)) {
      throw createError({
        statusCode: 400,
        statusMessage: '不支援的頻率類型',
      })
    }

    // 驗證日期
    const startDate = body.startDate ? new Date(body.startDate) : new Date()
    const endDate = body.endDate ? new Date(body.endDate) : undefined

    if (endDate && endDate <= startDate) {
      throw createError({
        statusCode: 400,
        statusMessage: '結束日期必須晚於開始日期',
      })
    }

    // 建立預設收款日設定
    const defaultPaymentSchedule = {
      type: PaymentScheduleType.FIXED_DAY_OF_MONTH,
      dayOfMonth: 25, // 預設每月 25 號發薪
      fallbackRule: FallbackRule.NEXT_WORKING_DAY,
    }

    // 建立預設匹配配置
    const defaultMatchingConfig = {
      amountTolerance: 10,
      dateTolerance: 3,
      autoMatch: true,
    }

    // 創建收入預測項目數據
    const forecastingData = {
      userId: user._id,
      name: body.name.trim(),
      description: body.description?.trim(),
      expectedAmount: body.expectedAmount,
      currency: body.currency || 'TWD',
      incomeCategory: new mongoose.Types.ObjectId(body.incomeCategory),
      frequency: body.frequency,
      startDate,
      endDate,
      paymentSchedule: {
        ...defaultPaymentSchedule,
        ...body.paymentSchedule,
        // 處理日期欄位
        ...(body.paymentSchedule?.fixedDate && {
          fixedDate: new Date(body.paymentSchedule.fixedDate),
        }),
      },
      matchingConfig: {
        ...defaultMatchingConfig,
        ...body.matchingConfig,
      },
      statistics: {
        totalPeriods: 0,
        matchedPeriods: 0,
        totalExpected: 0,
        totalReceived: 0,
        achievementRate: 0,
      },
      isActive: true,
      isDeleted: false,
    }

    // 創建收入預測項目
    const forecasting = new IncomeForecasting(forecastingData)
    await forecasting.save()

    // 生成第一個追蹤期間
    await forecasting.generateNextPeriod()

    // 填充關聯資料後返回
    await forecasting.populate('incomeCategory', 'name type color icon')

    return {
      success: true,
      data: forecasting,
      message: '收入預測項目創建成功',
    }
  }
  catch (error: any) {
    console.error('創建收入預測項目失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '創建收入預測項目失敗',
    })
  }
})
