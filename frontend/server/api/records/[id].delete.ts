/**
 * 刪除記帳記錄 API (軟刪除)
 * DELETE /api/records/:id
 */

import { Record } from '~/lib/models/record'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

export default defineEventHandler(async (event) => {
  try {
    // 驗證用戶
    const user = await verifyAndGetUser(event)

    // 取得記錄 ID
    const recordId = getRouterParam(event, 'id')
    if (!recordId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Record ID is required',
      })
    }

    // 驗證 ObjectId 格式
    const mongoose = await import('mongoose')
    if (!mongoose.isValidObjectId(recordId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid record ID format',
      })
    }

    // 連接資料庫
    await connectMongoDB()

    // 查詢記錄
    const record = await Record.findOne({
      _id: recordId,
      userId: user._id, // 只能刪除自己的記錄
      context: 'personal', // Phase 1 只支援個人模式
      isDeleted: false,
    })

    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found',
      })
    }

    // 軟刪除記錄
    await Record.findByIdAndUpdate(
      recordId,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
    )

    // 減少分類使用統計
    await Category.findByIdAndUpdate(
      record.categoryId,
      {
        $inc: { usageCount: -1 },
      },
    )

    return {
      success: true,
      message: '記錄已刪除',
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Delete record error:', error)

    const err = error as any
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
