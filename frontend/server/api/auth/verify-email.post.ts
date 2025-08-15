import { z } from 'zod'
import { readBody, type H3Event } from 'h3'
import { connectMongoDB } from '~/lib/mongodb'
import { User } from '~/lib/models/user'
import { logAuthEvent } from '~/lib/utils/logger'

// 郵件驗證 Schema
const verifyEmailSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件格式').min(1, '電子郵件為必填欄位'),
  token: z.string().min(1, '驗證 token 為必填欄位'),
})

export default defineEventHandler(async (event) => {
  try {
    // 連接資料庫
    await connectMongoDB()

    // 讀取請求資料
    const body = await readBody(event)

    // Zod 驗證
    const validationResult = verifyEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return {
        success: false,
        message: '輸入資料驗證失敗',
        errors: validationResult.error.issues.map(err => err.message),
      }
    }

    const { email, token } = validationResult.data

    // 使用 SHA-256 雜湊 token
    const crypto = await import('node:crypto')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // 查找使用者
    const user = await User.findOne({
      'email': email.toLowerCase(),
      'security.emailVerificationToken': hashedToken,
    })

    if (!user) {
      return {
        success: false,
        message: '無效的驗證連結或連結已過期',
        errors: ['無效的驗證連結'],
      }
    }

    // 檢查是否已經驗證過
    if (user.security.emailVerified) {
      return {
        success: true,
        message: '您的電子郵件已經驗證過了',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.profile.name,
            emailVerified: true,
          },
        },
      }
    }

    // 標記為已驗證並清除 token
    user.security.emailVerified = true
    user.security.emailVerificationToken = undefined
    await user.save()

    // 記錄成功事件
    logAuthEvent('電子郵件驗證成功', {
      apiUrl: '/api/auth/verify-email',
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
      message: '電子郵件驗證成功！您現在可以正常使用帳戶了。',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.profile.name,
          emailVerified: true,
        },
      },
    }
  }
  catch (error: unknown) {
    console.error('郵件驗證 API 錯誤:', error)

    return {
      success: false,
      message: '驗證過程發生錯誤',
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
