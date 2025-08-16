/**
 * 刪除分類 API (軟刪除)
 * DELETE /api/categories/:id
 */

import { Category } from '~/lib/models/category'
import { Record } from '~/lib/models/record'
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

    // 查詢分類
    const category = await Category.findOne({
      _id: categoryId,
      userId: user._id, // 只能刪除自己的個人分類
      scope: 'personal', // 只能刪除個人分類，不能刪除系統分類
      isDeleted: false,
    })

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found or not deletable',
      })
    }

    // 檢查是否有記錄正在使用此分類
    const recordsUsingCategory = await Record.countDocuments({
      categoryId,
      userId: user._id,
      isDeleted: false,
    })

    if (recordsUsingCategory > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `無法刪除分類，仍有 ${recordsUsingCategory} 筆記錄使用此分類`,
        data: {
          recordCount: recordsUsingCategory,
        },
      })
    }

    // 軟刪除分類
    await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
    )

    return {
      success: true,
      message: '分類已刪除',
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Delete category error:', error)

    const err = error as any
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
