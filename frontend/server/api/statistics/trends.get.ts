/**
 * API: 取得月度趨勢統計資料
 * 路由: GET /api/statistics/trends
 *
 * 說明:
 * - 統計過去12個月的收支趨勢
 * - 支援按年度查詢特定12個月
 * - 返回適合折線圖的資料格式
 */

import { z } from 'zod'
import { Record } from '~/lib/models/record'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface MonthlyTrend {
  year: number
  month: number
  monthLabel: string
  totalIncome: number
  totalExpense: number
  netAmount: number
  recordCount: number
}

interface TrendsResponse {
  success: boolean
  data: {
    trends: MonthlyTrend[]
    summary: {
      totalMonths: number
      avgIncome: number
      avgExpense: number
      avgNetAmount: number
    }
  }
}

// 查詢參數驗證
const querySchema = z.object({
  year: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number()).optional(),
  months: z.string().transform(val => Number.parseInt(val, 10)).pipe(z.number().min(1).max(24)).default(12),
})

export default defineEventHandler(async (event): Promise<TrendsResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 驗證查詢參數
    const query = await getValidatedQuery(event, querySchema.parse)

    // 計算查詢的起始和結束日期
    const endDate = new Date()
    const startDate = new Date()

    if (query.year) {
      // 如果指定年份，顯示該年份的12個月
      startDate.setFullYear(query.year, 0, 1) // 1月1日
      endDate.setFullYear(query.year, 11, 31) // 12月31日
      endDate.setHours(23, 59, 59, 999)
    }
    else {
      // 否則顯示過去 N 個月（包含當前月）
      startDate.setMonth(endDate.getMonth() - (query.months - 1))
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
    }

    // 建立聚合管道
    const aggregationPipeline = [
      // 第一階段：篩選記錄
      {
        $match: {
          userId: (user as any)._id.toString(),
          context: 'personal',
          isDeleted: false,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      // 第二階段：按年月分組
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'income'] },
                { $ifNull: ['$baseCurrencyAmount', '$amount'] },
                0,
              ],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'expense'] },
                { $ifNull: ['$baseCurrencyAmount', '$amount'] },
                0,
              ],
            },
          },
          recordCount: { $sum: 1 },
        },
      },
      // 第三階段：按年月排序
      {
        $sort: {
          '_id.year': 1 as any,
          '_id.month': 1 as any,
        },
      },
    ]

    // 執行聚合查詢
    const rawTrends = await Record.aggregate(aggregationPipeline)

    // 生成完整的月份列表（包含沒有記錄的月份）
    const trends: MonthlyTrend[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const year = current.getFullYear()
      const month = current.getMonth() + 1

      // 尋找該月份的統計資料
      const monthData = rawTrends.find(
        (item: any) => item._id.year === year && item._id.month === month,
      )

      const monthLabel = `${year}年${month}月`
      const totalIncome = monthData?.totalIncome || 0
      const totalExpense = monthData?.totalExpense || 0

      trends.push({
        year,
        month,
        monthLabel,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        recordCount: monthData?.recordCount || 0,
      })

      // 移動到下一個月
      current.setMonth(current.getMonth() + 1)
    }

    // 計算摘要統計
    const totalMonths = trends.length
    const avgIncome = totalMonths > 0
      ? trends.reduce((sum, trend) => sum + trend.totalIncome, 0) / totalMonths
      : 0
    const avgExpense = totalMonths > 0
      ? trends.reduce((sum, trend) => sum + trend.totalExpense, 0) / totalMonths
      : 0
    const avgNetAmount = avgIncome - avgExpense

    const response: TrendsResponse = {
      success: true,
      data: {
        trends,
        summary: {
          totalMonths,
          avgIncome: Math.round(avgIncome * 100) / 100,
          avgExpense: Math.round(avgExpense * 100) / 100,
          avgNetAmount: Math.round(avgNetAmount * 100) / 100,
        },
      },
    }

    return response
  }
  catch (error: any) {
    console.error('取得趨勢統計失敗:', error)

    return {
      success: false,
      data: {
        trends: [],
        summary: {
          totalMonths: 0,
          avgIncome: 0,
          avgExpense: 0,
          avgNetAmount: 0,
        },
      },
    }
  }
})
