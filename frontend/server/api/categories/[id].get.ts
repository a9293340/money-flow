/**
 * 取得單筆分類 API
 * GET /api/categories/:id
 */

import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 驗證用戶
    const user = await verifyAndGetUser(event)

    // 取得分類 ID
    const categoryId = getRouterParam(event, 'id')
    if (!categoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required',
      })
    }

    // 驗證 ObjectId 格式
    const mongoose = await import('mongoose')
    if (!mongoose.isValidObjectId(categoryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid category ID format',
      })
    }

    // 連接資料庫
    await connectMongoDB()

    // 查詢分類 - 個人模式下可以查看系統分類和自己的個人分類
    const category = await Category.findOne({
      _id: categoryId,
      $or: [
        { scope: 'system' }, // 系統分類
        { scope: 'personal', userId: user._id }, // 個人分類
      ],
      isDeleted: false,
    }).lean()

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      })
    }

    return {
      success: true,
      data: {
        category,
      },
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Get category error:', error)

    const err = error as any
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
