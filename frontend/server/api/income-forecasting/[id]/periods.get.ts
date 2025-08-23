/**
 * 獲取收入預測的追蹤期間列表
 * GET /api/income-forecasting/[id]/periods
 */

import { IncomePeriod } from '~/lib/models'
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
    if (!forecastingId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少收入預測 ID',
      })
    }

    // 獲取查詢參數
    const query = getQuery(event)
    const page = Number.parseInt(query.page as string) || 1
    const limit = Number.parseInt(query.limit as string) || 10
    const status = query.status as string
    const sortBy = query.sortBy as string || 'startDate'
    const sortOrder = query.sortOrder as string || 'desc'

    // 構建查詢條件
    const queryConditions: any = {
      forecastingId,
      userId: user._id,
      isDeleted: false,
    }

    // 狀態篩選
    if (status === 'active') {
      queryConditions.status = 'active'
    }
    else if (status === 'completed') {
      queryConditions.status = 'completed'
    }
    else if (status === 'pending') {
      queryConditions.status = 'pending'
    }

    // 計算分頁偏移
    const skip = (page - 1) * limit

    // 構建排序條件
    const sortConditions: any = {}
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1

    // 查詢期間總數
    const total = await IncomePeriod.countDocuments(queryConditions)

    // 查詢期間列表
    const periods = await IncomePeriod.find(queryConditions)
      .sort(sortConditions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'matchedRecords.recordId',
        select: 'amount date description categoryId tags',
      })

    // 分頁資訊
    const pages = Math.ceil(total / limit)
    const pagination = {
      page,
      limit,
      total,
      pages,
    }

    return {
      success: true,
      data: {
        periods,
        pagination,
      },
    }
  }
  catch (error: any) {
    console.error('獲取追蹤期間列表失敗:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '獲取追蹤期間列表失敗',
    })
  }
})
