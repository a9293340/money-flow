/**
 * 取得記帳記錄列表 API
 * GET /api/records
 */

import { z } from 'zod'
import { Record } from '~/lib/models/record'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 查詢參數驗證
const querySchema = z.object({
  context: z.enum(['personal', 'group']).default('personal'),
  page: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(20),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().optional(),
  year: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number()).optional(),
  month: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1).max(12)).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated tags
})

export default defineEventHandler(async (event) => {
  try {
    // 驗證用戶
    const user = await verifyAndGetUser(event)

    // Phase 1: 只支援個人模式
    const query = await getValidatedQuery(event, querySchema.parse)
    if (query.context === 'group') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group context not implemented in Phase 1',
      })
    }

    // 連接資料庫
    await connectMongoDB()

    // 建立查詢條件
    const filters: Record<string, unknown> = {
      userId: user._id,
      context: 'personal',
      isDeleted: false,
    }

    // 類型篩選
    if (query.type) {
      filters.type = query.type
    }

    // 分類篩選
    if (query.categoryId) {
      filters.categoryId = query.categoryId
    }

    // 年月篩選
    if (query.year || query.month) {
      const year = query.year || new Date().getFullYear()
      const month = query.month || new Date().getMonth() + 1

      // 建立該月份的開始和結束日期
      const startDate = new Date(year, month - 1, 1) // month-1 因為 JS Date 的月份是 0-11
      const endDate = new Date(year, month, 0, 23, 59, 59, 999) // month 的下個月的第0天 = 當月最後一天

      filters.date = {
        $gte: startDate,
        $lte: endDate,
      }
    }
    // 日期範圍篩選 (如果沒有年月篩選才使用)
    else if (query.startDate || query.endDate) {
      const dateFilter: Record<string, unknown> = {}
      if (query.startDate) {
        dateFilter.$gte = new Date(query.startDate)
      }
      if (query.endDate) {
        dateFilter.$lte = new Date(query.endDate)
      }
      filters.date = dateFilter
    }

    // 描述搜尋
    if (query.search) {
      filters.description = {
        $regex: query.search,
        $options: 'i', // case insensitive
      }
    }

    // 標籤篩選
    if (query.tags) {
      const tagArray = query.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      if (tagArray.length > 0) {
        filters.tags = { $in: tagArray }
      }
    }

    // 計算分頁
    const skip = (query.page - 1) * query.limit

    // 執行查詢
    const [records, totalCount] = await Promise.all([
      Record.find(filters)
        .populate('categoryId', 'name icon color type')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Record.countDocuments(filters),
    ])

    // 計算統計摘要 - 使用字符串 userId
    const summaryFilters = {
      userId: user._id.toString(),
      context: 'personal',
      isDeleted: false,
    }

    const summaryPipeline = [
      { $match: summaryFilters },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$baseCurrencyAmount' },
          count: { $sum: 1 },
        },
      },
    ]

    const summaryData = await Record.aggregate(summaryPipeline)
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
    }

    summaryData.forEach((item) => {
      if (item._id === 'income') {
        summary.totalIncome = item.total
      }
      else if (item._id === 'expense') {
        summary.totalExpense = item.total
      }
    })
    summary.netAmount = summary.totalIncome - summary.totalExpense

    // 計算分頁資訊
    const totalPages = Math.ceil(totalCount / query.limit)
    const pagination = {
      page: query.page,
      limit: query.limit,
      total: totalCount,
      pages: totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    }

    return {
      success: true,
      data: {
        items: records,
        pagination,
        summary,
      },
      meta: {
        context: query.context,
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Records list error:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: error.issues,
      })
    }

    const err = error as any
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
