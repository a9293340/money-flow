/**
 * 取得分類列表 API
 * GET /api/categories
 */

import { z } from 'zod'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 查詢參數驗證
const querySchema = z.object({
  context: z.enum(['personal', 'group']).default('personal'),
  type: z.enum(['income', 'expense']).optional(),
  scope: z.enum(['personal', 'system', 'group']).optional(),
  search: z.string().optional(),
  includeUsageStats: z.string().transform(val => val === 'true').default(false),
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

    // 建立基礎查詢條件 - 排除已刪除的項目
    const baseConditions: any[] = [
      { isDeleted: { $ne: true } }, // 排除明確標記為已刪除的項目
      {
        $or: [
          { scope: 'system' }, // 系統預設分類
          { scope: 'personal', userId: user._id.toString() }, // 用戶個人分類
        ],
      },
    ]

    // 類型篩選
    if (query.type) {
      baseConditions.push({ type: query.type })
    }

    // 權限範圍篩選
    if (query.scope) {
      if (query.scope === 'personal') {
        // 只顯示個人分類
        baseConditions[1] = { scope: 'personal', userId: user._id.toString() }
      }
      else if (query.scope === 'system') {
        // 只顯示系統分類
        baseConditions[1] = { scope: 'system' }
      }
      else if (query.scope === 'group') {
        // Phase 1 不支援群組模式
        throw createError({
          statusCode: 400,
          statusMessage: 'Group scope not implemented in Phase 1',
        })
      }
    }

    // 名稱搜尋
    if (query.search) {
      baseConditions.push({
        name: {
          $regex: query.search,
          $options: 'i', // case insensitive
        },
      })
    }

    const filters = { $and: baseConditions }

    // 簡化查詢，直接使用 find
    const categories = await Category.find(filters)
      .select('_id name icon color type scope description usageCount lastUsedAt sortOrder createdAt updatedAt')
      .sort({
        scope: 1, // 系統分類在前
        sortOrder: 1,
        usageCount: -1, // 使用頻率高的在前
        createdAt: -1,
      })
      .lean()

    // 統計摘要 - 簡化
    const totalCount = categories.length
    const systemCount = categories.filter(cat => cat.scope === 'system').length
    const personalCount = categories.filter(cat => cat.scope === 'personal').length

    const summaryData = {
      totalCount,
      systemCount,
      personalCount,
    }

    return {
      success: true,
      data: {
        items: categories,
        summary: summaryData,
      },
      meta: {
        context: query.context,
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Categories list error:', error)

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
