import { z } from 'zod'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/server/models/User'

// 註冊驗證 Schema
const registerSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
  password: z.string().min(8, '密碼至少需要8個字元').min(1, '密碼為必填欄位'),
  name: z.string().min(1, '姓名為必填欄位').max(50, '姓名不能超過50個字元'),
})

export default defineEventHandler(async (event) => {
  try {
    // 連接資料庫
    await connectMongoDB()

    // 讀取請求資料
    const body = await readBody(event)

    // Zod 驗證
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return {
        success: false,
        message: '輸入資料驗證失敗',
        errors: validationResult.error.issues.map(err => err.message),
      }
    }

    const { email, password, name } = validationResult.data

    // 檢查電子郵件是否已存在
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return {
        success: false,
        message: '此電子郵件已被註冊',
        errors: ['此電子郵件已被註冊'],
      }
    }

    // 建立新使用者
    const newUser = new User({
      email: email.toLowerCase(),
      password, // 密碼會在 User model 的 pre save 中自動加密
      name,
      preferences: {
        currency: 'TWD',
        theme: 'light',
        language: 'zh-TW',
      },
      isActive: true,
      emailVerified: false,
    })

    // 儲存到資料庫
    const savedUser = await newUser.save()

    // 返回成功結果（不包含敏感資訊）
    return {
      success: true,
      message: '註冊成功',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
          emailVerified: savedUser.emailVerified,
        },
      },
    }
  }
  catch (error: unknown) {
    console.error('註冊 API 錯誤:', error)

    // 處理 MongoDB 驗證錯誤
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationErrors = Object.values((error as { errors: Record<string, { message: string }> }).errors).map(err => err.message)
      return {
        success: false,
        message: '資料驗證失敗',
        errors: validationErrors,
      }
    }

    // 處理重複鍵錯誤
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return {
        success: false,
        message: '此電子郵件已被註冊',
        errors: ['此電子郵件已被註冊'],
      }
    }

    return {
      success: false,
      message: '註冊過程發生錯誤',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})
