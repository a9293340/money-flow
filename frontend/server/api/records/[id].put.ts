/**
 * 更新記帳記錄 API
 * PUT /api/records/:id
 */

import { z } from 'zod'
import { Record } from '~/lib/models/record'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 更新記錄資料驗證（所有欄位都是可選的，支援部分更新）
const updateRecordSchema = z.object({
  amount: z.number().min(0.01, '金額必須大於 0').max(999999999.99, '金額不能超過 999,999,999.99').optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().max(200, '描述不能超過 200 個字元').optional(),
  date: z.string().datetime('日期格式不正確').optional(),
  categoryId: z.string().min(1, '分類為必填欄位').optional(),
  currency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW']).optional(),
  tags: z.array(z.string().max(20, '標籤長度不能超過 20 個字元')).max(10, '標籤數量不能超過 10 個').optional(),
  location: z.object({
    name: z.string().max(100, '地點名稱不能超過 100 個字元').optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }).optional(),
  exchangeRate: z.number().min(0.0001).max(10000).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: '至少需要提供一個要更新的欄位',
})

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

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = updateRecordSchema.parse(body)

    // 連接資料庫
    await connectMongoDB()

    // 查詢現有記錄
    const existingRecord = await Record.findOne({
      _id: recordId,
      userId: user._id, // 只能更新自己的記錄
      context: 'personal', // Phase 1 只支援個人模式
      isDeleted: false,
    })

    if (!existingRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record not found',
      })
    }

    // 如果更新分類，需要驗證分類
    if (validatedData.categoryId) {
      const category = await Category.findOne({
        _id: validatedData.categoryId,
        isDeleted: { $ne: true },
      })
      if (!category) {
        throw createError({
          statusCode: 400,
          statusMessage: '指定的分類不存在',
        })
      }

      // 檢查分類權限（個人分類或系統分類）
      if (category.scope === 'personal' && category.userId.toString() !== user._id.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: '無權使用此分類',
        })
      }

      // 檢查分類類型與記錄類型是否一致
      const recordType = validatedData.type || existingRecord.type
      if (category.type !== recordType) {
        throw createError({
          statusCode: 400,
          statusMessage: '記錄類型與分類類型不符',
        })
      }
    }

    // 如果更新類型，需要檢查與分類的一致性
    if (validatedData.type && !validatedData.categoryId) {
      const category = await Category.findOne({
        _id: existingRecord.categoryId,
        isDeleted: false,
      })
      if (category && category.type !== validatedData.type) {
        throw createError({
          statusCode: 400,
          statusMessage: '記錄類型與分類類型不符',
        })
      }
    }

    // 準備更新資料
    const updateData: Record<string, unknown> = { ...validatedData }

    // 處理日期轉換
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date)
    }

    // 重新計算基準貨幣金額（如果金額或匯率有變動）
    if (validatedData.amount || validatedData.exchangeRate) {
      const amount = validatedData.amount || existingRecord.amount
      const exchangeRate = validatedData.exchangeRate || existingRecord.exchangeRate || 1
      updateData.baseCurrencyAmount = amount * exchangeRate
    }

    // 更新記錄
    const updatedRecord = await Record.findByIdAndUpdate(
      recordId,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate('categoryId', 'name icon color type')
      .lean()

    // 如果分類有變更，更新分類使用統計
    if (validatedData.categoryId && validatedData.categoryId !== existingRecord.categoryId.toString()) {
      // 更新新分類的使用統計
      await Category.findByIdAndUpdate(
        validatedData.categoryId,
        {
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() },
        },
      )

      // 減少舊分類的使用統計
      await Category.findByIdAndUpdate(
        existingRecord.categoryId,
        {
          $inc: { usageCount: -1 },
        },
      )
    }

    return {
      success: true,
      message: '記錄更新成功',
      data: {
        record: updatedRecord,
      },
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Update record error:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation error',
        data: error.issues,
      })
    }

    const err = error as any
    // Mongoose 驗證錯誤
    if (err.name === 'ValidationError') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Database validation error',
        data: Object.values(err.errors).map((e: any) => e.message),
      })
    }

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
