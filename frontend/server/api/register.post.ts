import { z } from 'zod'
import { readBody } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { sendEmailVerification } from '~/lib/utils/email'

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
      passwordHash: password, // 密碼會在 User model 的 pre save 中自動加密
      profile: {
        name,
        preferences: {
          currency: 'TWD',
          theme: 'system',
          language: 'zh-TW',
          notifications: {
            budgetAlerts: true,
            dailyReminders: false,
            weeklyReports: true,
            emailNotifications: true,
            pushNotifications: true,
          },
        },
      },
      security: {
        loginAttempts: 0,
        emailVerified: false,
      },
    })

    // 儲存到資料庫
    const savedUser = await newUser.save()

    // 生成郵件驗證 token
    const verificationToken = await savedUser.generateEmailVerificationToken()

    // 儲存 token 到資料庫
    await savedUser.save()

    // 構建驗證連結
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.PRODUCTION_DOMAIN}`
      : 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verify-email?email=${encodeURIComponent(savedUser.email)}&token=${verificationToken}`

    // 發送驗證郵件
    const emailSent = await sendEmailVerification({
      to: savedUser.email,
      name: savedUser.profile.name,
      verificationToken,
      verificationUrl,
    })

    if (!emailSent) {
      console.warn(`⚠️ 註冊成功但驗證郵件發送失敗: ${savedUser.email}`)
    }

    // 返回成功結果（不包含敏感資訊）
    return {
      success: true,
      message: emailSent
        ? '註冊成功！請檢查您的電子郵件並點擊驗證連結以啟用帳戶。'
        : '註冊成功！但驗證郵件發送失敗，請稍後嘗試重新發送。',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.profile.name,
          emailVerified: savedUser.security.emailVerified,
        },
        emailSent,
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
