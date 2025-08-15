import { z } from 'zod'
import { readBody, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { sendEmailVerification } from '~/lib/utils/email'
import { logAuthEvent } from '~/lib/utils/logger'

// 重發驗證郵件 Schema
const resendVerificationSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
})

export default defineEventHandler(async (event) => {
  try {
    // 連接資料庫
    await connectMongoDB()

    // 讀取請求資料
    const body = await readBody(event)

    // Zod 驗證
    const validationResult = resendVerificationSchema.safeParse(body)
    if (!validationResult.success) {
      return {
        success: false,
        message: '輸入資料驗證失敗',
        errors: validationResult.error.issues.map(err => err.message),
      }
    }

    const { email } = validationResult.data

    // 查找使用者
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // 為了防止用戶枚舉攻擊，即使找不到用戶也返回成功訊息
      return {
        success: true,
        message: '如果該電子郵件地址存在於我們的系統中，我們已經發送了驗證郵件。',
      }
    }

    // 檢查是否已經驗證過
    if (user.security.emailVerified) {
      return {
        success: true,
        message: '您的電子郵件已經驗證過了，無需重複驗證。',
        data: {
          emailVerified: true,
        },
      }
    }

    // 生成新的驗證 token
    const verificationToken = await user.generateEmailVerificationToken()
    await user.save()

    // 構建驗證連結
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.PRODUCTION_DOMAIN}`
      : 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verify-email?email=${encodeURIComponent(user.email)}&token=${verificationToken}`

    // 發送驗證郵件
    const emailSent = await sendEmailVerification({
      to: user.email,
      name: user.profile.name,
      verificationToken,
      verificationUrl,
    })

    if (!emailSent) {
      console.warn(`⚠️ 重發驗證郵件失敗: ${user.email}`)
      return {
        success: false,
        message: '郵件發送失敗，請稍後再試',
        errors: ['郵件服務暫時不可用'],
      }
    }

    // 記錄成功事件
    logAuthEvent('重發驗證郵件成功', {
      apiUrl: '/api/auth/resend-verification',
      method: 'POST',
      ip: getClientIP(event),
      userAgent: event.node.req.headers['user-agent'] || 'unknown',
      platform: 'unknown',
      userId: user._id.toString(),
      email: user.email,
    })

    // 返回成功結果
    return {
      success: true,
      message: '驗證郵件已重新發送，請檢查您的電子郵箱。',
      data: {
        emailSent: true,
      },
    }
  }
  catch (error: unknown) {
    console.error('重發驗證郵件 API 錯誤:', error)

    return {
      success: false,
      message: '重發驗證郵件過程發生錯誤',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    }
  }
})

// 輔助函數：獲取客戶端 IP
function getClientIP(event: H3Event): string {
  const forwarded = event.node.req.headers['x-forwarded-for']
  const realIP = event.node.req.headers['x-real-ip']
  const remoteAddress = event.node.req.socket?.remoteAddress

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }

  return (realIP as string) || remoteAddress || 'unknown'
}
