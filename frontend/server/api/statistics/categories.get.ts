/**
 * API: 取得分類統計資料
 * 路由: GET /api/statistics/categories
 *
 * 說明:
 * - 統計各分類的金額總和
 * - 支援收入/支出/全部類型篩選
 * - 返回適合圓餅圖的資料格式
 */

import { Record } from '~/lib/models/record'
import { Category } from '~/lib/models/category'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface CategoryStatistic {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalAmount: number
  recordCount: number
  percentage: number
}

interface StatisticsResponse {
  success: boolean
  data: {
    statistics: CategoryStatistic[]
    summary: {
      totalAmount: number
      categoryCount: number
      recordCount: number
    }
  }
}

export default defineEventHandler(async (event): Promise<StatisticsResponse> => {
  try {
    // 確保用戶上下文
    const user = await ensureUserContext(event)

    // 取得查詢參數
    const query = getQuery(event)
    const type = query.type as 'income' | 'expense' | undefined

    // 建立記錄查詢條件
    const recordFilters: any = {
      userId: (user as any)._id.toString(),
      context: 'personal',
      isDeleted: false,
    }

    // 添加類型篩選
    if (type) {
      recordFilters.type = type
    }

    // 使用聚合管道統計分類資料
    const aggregationPipeline = [
      // 第一階段：篩選記錄
      {
        $match: recordFilters,
      },
      // 第二階段：按分類分組並計算統計
      {
        $group: {
          _id: '$categoryId',
          totalAmount: {
            $sum: {
              $ifNull: ['$baseCurrencyAmount', '$amount'],
            },
          },
          recordCount: { $sum: 1 },
        },
      },
      // 第三階段：過濾掉沒有金額的分類
      {
        $match: {
          totalAmount: { $gt: 0 },
        },
      },
      // 第四階段：按金額降序排列
      {
        $sort: {
          totalAmount: -1 as any,
        },
      },
    ]

    // 執行聚合查詢
    const rawStatistics = await Record.aggregate(aggregationPipeline)

    // 取得分類資訊
    const categoryIds = rawStatistics.map((stat: any) => stat._id)
    const categories = await Category.find({
      _id: { $in: categoryIds },
    }).lean()

    // 建立分類資訊映射
    const categoryMap = new Map()
    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), cat)
    })

    // 計算總金額用於百分比計算
    const totalAmount = rawStatistics.reduce((sum: number, stat: any) => sum + stat.totalAmount, 0)
    const totalRecords = rawStatistics.reduce((sum: number, stat: any) => sum + stat.recordCount, 0)

    // 為每個分類添加百分比資訊和分類詳情
    const statistics: CategoryStatistic[] = rawStatistics
      .map((stat: any) => {
        const categoryInfo = categoryMap.get(stat._id.toString())

        if (!categoryInfo) {
          return null // 跳過沒有分類資訊的記錄
        }

        return {
          categoryId: stat._id.toString(),
          categoryName: categoryInfo.name,
          categoryIcon: categoryInfo.icon,
          categoryColor: categoryInfo.color,
          totalAmount: stat.totalAmount,
          recordCount: stat.recordCount,
          percentage: totalAmount > 0 ? Math.round((stat.totalAmount / totalAmount) * 100 * 100) / 100 : 0,
        }
      })
      .filter((stat: CategoryStatistic | null): stat is CategoryStatistic => stat !== null) // 移除空值

    // 建立回應資料
    const response: StatisticsResponse = {
      success: true,
      data: {
        statistics,
        summary: {
          totalAmount,
          categoryCount: statistics.length,
          recordCount: totalRecords,
        },
      },
    }

    return response
  }
  catch (error: any) {
    console.error('取得分類統計失敗:', error)

    return {
      success: false,
      data: {
        statistics: [],
        summary: {
          totalAmount: 0,
          categoryCount: 0,
          recordCount: 0,
        },
      },
    }
  }
})
