import { User, Category } from '../../models'

// 系統預設分類資料
const defaultCategories = [
  // 支出分類
  { name: '餐飲', type: 'expense', icon: 'restaurant', color: '#F59E0B' },
  { name: '交通', type: 'expense', icon: 'car', color: '#3B82F6' },
  { name: '購物', type: 'expense', icon: 'shopping', color: '#EC4899' },
  { name: '娛樂', type: 'expense', icon: 'game', color: '#8B5CF6' },
  { name: '醫療', type: 'expense', icon: 'health', color: '#EF4444' },
  { name: '教育', type: 'expense', icon: 'education', color: '#10B981' },
  { name: '房租', type: 'expense', icon: 'home', color: '#F97316' },
  { name: '水電', type: 'expense', icon: 'electricity', color: '#06B6D4' },
  { name: '通訊', type: 'expense', icon: 'phone', color: '#84CC16' },
  { name: '保險', type: 'expense', icon: 'insurance', color: '#6366F1' },

  // 收入分類
  { name: '薪資', type: 'income', icon: 'salary', color: '#059669' },
  { name: '獎金', type: 'income', icon: 'bonus', color: '#D97706' },
  { name: '投資', type: 'income', icon: 'investment', color: '#7C3AED' },
  { name: '副業', type: 'income', icon: 'business', color: '#DC2626' },
  { name: '利息', type: 'income', icon: 'interest', color: '#0891B2' },
  { name: '其他收入', type: 'income', icon: 'other', color: '#65A30D' },
]

export default defineEventHandler(async (event) => {
  try {
    // 檢查是否為 POST 請求
    assertMethod(event, 'POST')

    // 讀取請求 body
    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required',
      })
    }

    // 檢查用戶是否存在
    const user = await User.findById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // 檢查是否已存在預設分類
    const existingCategories = await Category.countDocuments({
      userId,
      isSystem: true,
    })

    if (existingCategories > 0) {
      return {
        success: true,
        message: 'Default categories already exist',
        count: existingCategories,
      }
    }

    // 建立系統預設分類
    const categories = defaultCategories.map(cat => ({
      ...cat,
      userId,
      isSystem: true,
      sortOrder: defaultCategories.indexOf(cat),
    }))

    const createdCategories = await Category.insertMany(categories)

    return {
      success: true,
      message: 'Default categories created successfully',
      count: createdCategories.length,
      categories: createdCategories.map(cat => ({
        id: cat._id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      })),
    }
  }
  catch (error) {
    console.error('Database seed error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Seed operation failed',
    })
  }
})
