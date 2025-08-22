/**
 * 獲取收入預測列表
 * GET /api/income-forecasting
 */

import { IncomeForecasting, IncomeForecastFrequency } from '~/lib/models'
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

    // 獲取查詢參數
    const query = getQuery(event)
    const page = Number.parseInt(query.page as string) || 1
    const limit = Number.parseInt(query.limit as string) || 12
    const categoryId = query.categoryId as string
    const status = query.status as string
    const frequency = query.frequency as string
    const search = query.search as string
    const sortBy = query.sortBy as string || 'updatedAt'
    const sortOrder = query.sortOrder as string || 'desc'
    const isActive = query.isActive === 'false' ? false : query.isActive === 'true' ? true : undefined

    // 構建查詢條件
    const queryConditions: any = {
      userId: user._id,
      isDeleted: false,
    }

    // 根據參數添加篩選條件
    if (isActive !== undefined) {
      queryConditions.isActive = isActive
    }

    if (categoryId) {
      queryConditions.incomeCategory = categoryId
    }

    if (frequency && Object.values(IncomeForecastFrequency).includes(frequency as IncomeForecastFrequency)) {
      queryConditions.frequency = frequency
    }

    if (search) {
      queryConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    // 狀態篩選邏輯
    if (status === 'active') {
      queryConditions.isActive = true
    }
    else if (status === 'inactive') {
      queryConditions.isActive = false
    }

    // 計算分頁偏移
    const skip = (page - 1) * limit

    // 構建排序條件
    const sortConditions: any = {}
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // 查詢收入預測總數
    const total = await IncomeForecasting.countDocuments(queryConditions)

    // 查詢收入預測項目
    const forecasts = await IncomeForecasting.find(queryConditions)
      .populate('incomeCategory', 'name type color icon')
      .sort(sortConditions)
      .skip(skip)
      .limit(limit)

    // 計算統計摘要
    const totalForecasts = await IncomeForecasting.countDocuments({
      userId: user._id,
      isDeleted: false,
    })

    const activeForecasts = await IncomeForecasting.countDocuments({
      userId: user._id,
      isDeleted: false,
      isActive: true,
    })

    // 計算本月總預期金額
    const thisMonth = new Date()
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0)

    const monthlyForecasts = await IncomeForecasting.find({
      userId: user._id,
      isDeleted: false,
      isActive: true,
      $or: [
        { endDate: { $exists: false } }, // 無結束日期
        { endDate: { $gte: monthStart } }, // 結束日期在本月之後
      ],
      startDate: { $lte: monthEnd }, // 開始日期在本月之前
    })

    let monthlyExpected = 0
    let monthlyReceived = 0

    // 根據頻率計算本月預期收入
    for (const forecast of monthlyForecasts) {
      switch (forecast.frequency) {
        case IncomeForecastFrequency.WEEKLY:
          monthlyExpected += forecast.expectedAmount * 4.33 // 平均每月週數
          break
        case IncomeForecastFrequency.MONTHLY:
          monthlyExpected += forecast.expectedAmount
          break
        case IncomeForecastFrequency.QUARTERLY:
          monthlyExpected += forecast.expectedAmount / 3
          break
        case IncomeForecastFrequency.YEARLY:
          monthlyExpected += forecast.expectedAmount / 12
          break
      }
      monthlyReceived += forecast.statistics.totalReceived
    }

    const achievementRate = monthlyExpected > 0 ? monthlyReceived / monthlyExpected : 0

    // 分頁資訊
    const pages = Math.ceil(total / limit)
    const pagination = {
      page,
      limit,
      total,
      pages,
    }

    // 統計摘要
    const summary = {
      totalItems: totalForecasts,
      activeItems: activeForecasts,
      monthlyExpected: Math.round(monthlyExpected),
      monthlyReceived: Math.round(monthlyReceived),
      matchRate: Math.round(achievementRate * 100),
    }

    return {
      success: true,
      data: {
        items: forecasts,
        pagination,
        summary,
      },
    }
  }
  catch (error: any) {
    console.error('獲取收入預測列表失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '獲取收入預測列表失敗',
    })
  }
})
