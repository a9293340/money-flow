/**
 * 更新分類 API
 * PUT /api/categories/:id
 */

import { z } from 'zod'
import { Category } from '~/lib/models/category'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'

// 更新分類資料驗證（所有欄位都是可選的，支援部分更新）
const updateCategorySchema = z.object({
  name: z.string().min(1, '分類名稱為必填欄位').max(50, '分類名稱不能超過 50 個字元').optional(),
  icon: z.string().min(1, '圖示為必填欄位').max(50, '圖示代碼不能超過 50 個字元').optional(),
  color: z.string().regex(/^#([A-F0-9]{6}|[A-F0-9]{3})$/i, '顏色必須是有效的 HEX 色碼').optional(),
  description: z.string().max(200, '描述不能超過 200 個字元').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: '至少需要提供一個要更新的欄位',
})

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

    // 驗證請求資料
    const body = await readBody(event)
    const validatedData = updateCategorySchema.parse(body)

    // 連接資料庫
    await connectMongoDB()

    // 查詢現有分類
    const existingCategory = await Category.findOne({
      _id: categoryId,
      userId: user._id, // 只能更新自己的個人分類
      scope: 'personal', // 只能更新個人分類，不能更新系統分類
      isDeleted: false,
    })

    if (!existingCategory) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found or not editable',
      })
    }

    // 如果更新名稱，檢查是否與其他分類重複
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({
        name: validatedData.name,
        type: existingCategory.type, // 同類型
        userId: user._id,
        scope: 'personal',
        isDeleted: false,
        _id: { $ne: categoryId }, // 排除當前分類
      })

      if (duplicateCategory) {
        throw createError({
          statusCode: 409,
          statusMessage: '該類型下已存在相同名稱的分類',
        })
      }
    }

    // 更新分類
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: validatedData },
      { new: true, runValidators: true },
    ).lean()

    return {
      success: true,
      message: '分類更新成功',
      data: {
        category: updatedCategory,
      },
      meta: {
        context: 'personal',
        timestamp: new Date().toISOString(),
      },
    }
  }
  catch (error) {
    console.error('Update category error:', error)

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
