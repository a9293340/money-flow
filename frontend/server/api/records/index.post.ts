/**
 * 新增記帳記錄 API
 * POST /api/records
 */

import { z } from 'zod'
import { Record } from '~/lib/models/record'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 記錄資料驗證
const recordSchema = z.object({
  amount: z.number().min(0.01, '金額必須大於 0').max(999999999.99, '金額不能超過 999,999,999.99'),
  type: z.enum(['income', 'expense']),
  description: z.string().max(200, '描述不能超過 200 個字元').optional(),
  date: z.string().datetime('日期格式不正確'),
  categoryId: z.string().min(1, '分類為必填欄位'),
  currency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW']).default('TWD'),
  context: z.enum(['personal', 'group']).default('personal'),
  tags: z.array(z.string().max(20, '標籤長度不能超過 20 個字元')).max(10, '標籤數量不能超過 10 個').optional(),
  location: z.object({
    name: z.string().max(100, '地點名稱不能超過 100 個字元').optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }).optional(),
  exchangeRate: z.number().min(0.0001).max(10000).default(1),
})

export default defineEventHandler(async (event) => {
  try {
    // 驗證用戶
    const user = await verifyAndGetUser(event)

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = recordSchema.parse(body)

    // Phase 1: 只支援個人模式
    if (validatedData.context === 'group') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group context not implemented in Phase 1',
      })
    }

    // 連接資料庫
    await connectMongoDB()

    // 驗證分類是否存在且屬於該使用者
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

    // 檢查分類類型與記錄類型是否一致
    if (category.type !== validatedData.type) {
      throw createError({
        statusCode: 400,
        statusMessage: '記錄類型與分類類型不符',
      })
    }

    // 檢查分類權限（個人分類或系統分類）
    if (category.scope === 'personal' && category.userId.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: '無權使用此分類',
      })
    }

    // 準備記錄資料
    const exchangeRate = validatedData.exchangeRate || 1
    const recordData = {
      ...validatedData,
      userId: user._id,
      context: 'personal', // Phase 1 固定為 personal
      groupId: null, // Phase 1 固定為 null
      createdBy: user._id, // 個人模式下等於 userId
      date: new Date(validatedData.date),
      exchangeRate: exchangeRate,
      baseCurrencyAmount: validatedData.amount * exchangeRate,
      metadata: {
        source: 'web',
        version: '1.0.0',
      },
    }

    // 建立記錄
    const record = new Record(recordData)
    await record.save()

    // 更新分類使用統計
    await Category.findByIdAndUpdate(
      validatedData.categoryId,
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      },
    )

    // 載入完整記錄資料（包含分類資訊）
    const populatedRecord = await Record.findById(record._id)
      .populate('categoryId', 'name icon color type')
      .lean()

    return {
      success: true,
      message: '記錄建立成功',
      data: {
        record: populatedRecord,
      },
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Create record error:', error)

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
