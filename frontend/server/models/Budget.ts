import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface IBudget extends Document {
  name: string
  amount: number
  userId: mongoose.Types.ObjectId
  categoryId?: mongoose.Types.ObjectId
  period: 'monthly' | 'yearly' | 'custom'
  startDate: Date
  endDate: Date
  warningThreshold: number
  isActive: boolean
  currentSpent: number
  lastCalculatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const budgetSchema = new Schema<IBudget>({
  // 基本資訊
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (v: number) {
        return Number.isFinite(v) && v >= 0
      },
      message: 'Budget amount must be a valid positive number',
    },
  },

  // 關聯資訊
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null, // null 表示總預算
  },

  // 預算週期
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'custom'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },

  // 警告設定
  warningThreshold: {
    type: Number,
    default: 80, // 百分比
    min: 0,
    max: 100,
  },

  // 狀態追蹤
  isActive: {
    type: Boolean,
    default: true,
  },

  // 統計快取 (用於效能優化)
  currentSpent: {
    type: Number,
    default: 0,
  },
  lastCalculatedAt: Date,

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
budgetSchema.index({ userId: 1, isActive: 1 })
budgetSchema.index({ userId: 1, categoryId: 1, period: 1 })
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 })

// 複合唯一索引 (避免重複預算)
budgetSchema.index(
  { userId: 1, categoryId: 1, startDate: 1, endDate: 1 },
  { unique: true },
)

// 中介軟體
budgetSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema)
