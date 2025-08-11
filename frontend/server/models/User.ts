import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  preferences: {
    currency: string
    dateFormat: string
    theme: string
    language: string
    decimalPlaces: number
  }
  isActive: boolean
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLoginAt?: Date
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  // 基本資訊
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // 預設查詢時不返回密碼
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },

  // 偏好設定
  preferences: {
    currency: {
      type: String,
      default: 'TWD',
      enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY'],
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
      enum: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'],
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto'],
    },
    language: {
      type: String,
      default: 'zh-TW',
      enum: ['zh-TW', 'en-US'],
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 4,
    },
  },

  // 系統欄位
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,

  // 擴展預留欄位 (為 P2 協作功能預留)
  avatar: String, // 頭像 URL

  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// 索引
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ emailVerificationToken: 1 }, { sparse: true })
userSchema.index({ passwordResetToken: 1 }, { sparse: true })

// 密碼加密中介軟體
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    this.updatedAt = new Date()
    return next()
  }

  try {
    const saltRounds = 12
    this.password = await bcrypt.hash(this.password, saltRounds)
    this.updatedAt = new Date()
    next()
  }
  catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)))
  }
})

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export { User }
export default User
