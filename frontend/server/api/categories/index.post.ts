/**
 * 建立新分類 API
 * POST /api/categories
 */

import { z } from 'zod'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 建立分類資料驗證
const createCategorySchema = z.object({
  name: z.string().min(1, '分類名稱為必填欄位').max(50, '分類名稱不能超過 50 個字元'),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, '圖示為必填欄位').max(50, '圖示代碼不能超過 50 個字元'),
  color: z.string().regex(/^#([A-F0-9]{6}|[A-F0-9]{3})$/i, '顏色必須是有效的 HEX 色碼'),
  description: z.string().max(200, '描述不能超過 200 個字元').optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // 驗證用戶
    const user = await verifyAndGetUser(event)

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = createCategorySchema.parse(body)

    // 連接資料庫
    await connectMongoDB()

    // 檢查同名分類是否已存在（同類型、同用戶）
    const existingCategory = await Category.findOne({
      name: validatedData.name,
      type: validatedData.type,
      userId: user._id,
      scope: 'personal',
      isDeleted: false,
    })

    if (existingCategory) {
      throw createError({
        statusCode: 409,
        statusMessage: '該類型下已存在相同名稱的分類',
      })
    }

    // 準備分類資料
    const categoryData = {
      ...validatedData,
      userId: user._id,
      scope: 'personal', // Phase 1 只支援個人分類
      context: 'personal', // Phase 1 固定為個人模式
      groupId: null, // Phase 1 固定為 null
      usageCount: 0,
      sortOrder: 999, // 個人分類預設排序
      isDeleted: false,
      createdBy: user._id,
    }

    // 建立分類
    const category = new Category(categoryData)
    await category.save()

    // 載入完整分類資料
    const populatedCategory = await Category.findById(category._id).lean()

    return {
      success: true,
      message: '分類建立成功',
      data: {
        category: populatedCategory,
      },
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Create category error:', error)

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

    // MongoDB 重複鍵錯誤
    if (err.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: '分類名稱已存在',
      })
    }

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error',
    })
  }
})
