/**
 * User 資料模型
 * 管理使用者帳戶、個人資料和偏好設定
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'

// 使用者文檔介面
export interface IUser extends Document {
  _id: string
  email: string
  passwordHash: string
  profile: {
    name: string
    avatar?: string
    preferences: {
      currency: string
      theme: 'light' | 'dark' | 'system'
      language: string
      notifications: {
        budgetAlerts: boolean
        dailyReminders: boolean
        weeklyReports: boolean
        emailNotifications: boolean
        pushNotifications: boolean
      }
    }
  }
  security: {
    lastLoginAt?: Date
    lastLoginIP?: string
    loginAttempts: number
    lockedUntil?: Date
    passwordResetToken?: string
    passwordResetExpires?: Date
    emailVerified: boolean
    emailVerificationToken?: string
  }
  // 🆕 群組相關欄位 (Phase 2)
  groupId?: string | null
  groupRole?: 'owner' | 'admin' | 'member' | null
  groupJoinedAt?: Date | null
  createdAt: Date
  updatedAt: Date

  // 實例方法
  comparePassword(candidatePassword: string): Promise<boolean>
  generatePasswordResetToken(): Promise<string>
  generateEmailVerificationToken(): Promise<string>
  isLocked(): boolean
  incLoginAttempts(): Promise<void>
  resetLoginAttempts(): Promise<void>
}

// Schema 定義
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, '電子郵件為必填欄位'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [255, '電子郵件長度不能超過 255 個字元'],
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: '請輸入有效的電子郵件格式',
    },
    // 移除 index: true，因為下面有專門的索引設定
  },

  passwordHash: {
    type: String,
    required: [true, '密碼為必填欄位'],
    validate: {
      validator: function (v: string) {
        // 如果是 bcrypt hash (以 $2 開頭且長度 60) 則通過驗證
        if (v.startsWith('$2') && v.length === 60) return true
        // 如果是純文字密碼 (將被 pre-save hook 加密) 則需要至少 8 個字元
        return v.length >= 8
      },
      message: '密碼至少需要 8 個字元',
    },
  },

  profile: {
    name: {
      type: String,
      required: [true, '姓名為必填欄位'],
      trim: true,
      maxlength: [50, '姓名長度不能超過 50 個字元'],
      minlength: [1, '姓名不能為空'],
    },

    avatar: {
      type: String,
      validate: {
        validator: (url: string) => !url || validator.isURL(url),
        message: '頭像必須是有效的 URL',
      },
    },

    preferences: {
      currency: {
        type: String,
        required: true,
        default: 'TWD',
        enum: {
          values: ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW'],
          message: '不支援的貨幣類型',
        },
      },

      theme: {
        type: String,
        required: true,
        default: 'system',
        enum: {
          values: ['light', 'dark', 'system'],
          message: '不支援的主題類型',
        },
      },

      language: {
        type: String,
        required: true,
        default: 'zh-TW',
        enum: {
          values: ['zh-TW', 'zh-CN', 'en-US', 'ja-JP'],
          message: '不支援的語言',
        },
      },

      notifications: {
        budgetAlerts: { type: Boolean, default: true },
        dailyReminders: { type: Boolean, default: false },
        weeklyReports: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
      },
    },
  },

  security: {
    lastLoginAt: Date,
    lastLoginIP: {
      type: String,
      validate: {
        validator: (ip: string) => !ip || validator.isIP(ip),
        message: '無效的 IP 地址',
      },
    },

    loginAttempts: { type: Number, required: true, default: 0 },
    lockedUntil: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerified: { type: Boolean, required: true, default: false },
    emailVerificationToken: String,
  },

  // === 🆕 群組相關欄位 (Phase 2) ===
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null, // null = 未加入任何群組
  },

  groupRole: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: null,
  },

  groupJoinedAt: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc: Document, ret: Record<string, unknown>) {
      delete ret.passwordHash
      if (ret.security && typeof ret.security === 'object') {
        const security = ret.security as Record<string, unknown>
        delete security.passwordResetToken
        delete security.emailVerificationToken
      }
      delete ret.__v
      return ret
    },
  },
  toObject: { virtuals: true },
})

// 索引設定
// email 索引已經透過 schema 中的 unique: true 自動建立，不需要重複設定
userSchema.index({ 'security.lastLoginAt': -1 })
userSchema.index({ 'security.passwordResetToken': 1 })
userSchema.index({ 'security.emailVerificationToken': 1 })

// 群組相關索引 (Phase 2)
userSchema.index({ groupId: 1 })
userSchema.index({ groupId: 1, groupRole: 1 })

// 密碼比較方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash)
  }
  catch {
    throw new Error('密碼比較時發生錯誤')
  }
}

// 生成密碼重置 token
userSchema.methods.generatePasswordResetToken = async function (): Promise<string> {
  const crypto = await import('node:crypto')
  const token = crypto.randomBytes(32).toString('hex')

  this.security.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
  this.security.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 分鐘

  return token
}

// 生成郵件驗證 token
userSchema.methods.generateEmailVerificationToken = async function (): Promise<string> {
  const crypto = await import('node:crypto')
  const token = crypto.randomBytes(32).toString('hex')
  this.security.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex')
  return token
}

// 檢查帳戶是否被鎖定
userSchema.methods.isLocked = function (): boolean {
  return !!(this.security.lockedUntil && this.security.lockedUntil > new Date())
}

// 增加登入嘗試次數
userSchema.methods.incLoginAttempts = async function (): Promise<void> {
  const maxAttempts = 5
  const lockTime = 2 * 60 * 60 * 1000 // 2 小時

  // 如果已經鎖定且鎖定時間已過，重置
  if (this.security.lockedUntil && this.security.lockedUntil < new Date()) {
    return this.updateOne({
      $unset: { 'security.lockedUntil': 1 },
      $set: { 'security.loginAttempts': 1 },
    })
  }

  const updates: Record<string, unknown> = { $inc: { 'security.loginAttempts': 1 } }

  // 如果達到最大嘗試次數，鎖定帳戶
  if (this.security.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { 'security.lockedUntil': new Date(Date.now() + lockTime) }
  }

  return this.updateOne(updates)
}

// 重置登入嘗試次數
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  return this.updateOne({
    $unset: {
      'security.loginAttempts': 1,
      'security.lockedUntil': 1,
    },
  })
}

// 密碼加密中間件
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()

  try {
    const saltRounds = 12
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds)
    next()
  }
  catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)))
  }
})

// 靜態方法：根據 email 查找用戶
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

// 建立並匯出模型
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
