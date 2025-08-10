import mongoose, { Schema, Document } from 'mongoose'

export interface IRecord extends Document {
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: Date
  userId: mongoose.Types.ObjectId
  categoryId: mongoose.Types.ObjectId
  currency: string
  exchangeRate: number
  baseCurrencyAmount: number
  tags: string[]
  location?: {
    name?: string
    lat?: number
    lng?: number
  }
  receipt?: {
    url?: string
    filename?: string
  }
  isDeleted: boolean
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const recordSchema = new Schema<IRecord>({
  // 基本交易資訊
  amount: {
    type: Number,
    required: true,
    min: 0.01,
    validate: {
      validator: function(v: number) {
        return v > 0 && Number.isFinite(v)
      },
      message: 'Amount must be a positive number'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // 關聯資訊
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // 多幣別支援 (P1)
  currency: {
    type: String,
    required: true,
    default: 'TWD',
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  exchangeRate: {
    type: Number,
    default: 1,
    min: 0.000001
  },
  baseCurrencyAmount: {
    type: Number, // 轉換成用戶主貨幣的金額
    required: true
  },
  
  // 附加資訊
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  receipt: {
    url: String,
    filename: String
  },
  
  // 系統欄位
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // 擴展預留欄位 (為 P2 協作功能預留)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' // 用於協作帳本記錄建立者
  },
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 索引
recordSchema.index({ userId: 1, date: -1 })
recordSchema.index({ userId: 1, type: 1, date: -1 })
recordSchema.index({ userId: 1, categoryId: 1, date: -1 })
recordSchema.index({ userId: 1, isDeleted: 1, date: -1 })
recordSchema.index({ date: -1 }) // 用於統計查詢
recordSchema.index({ tags: 1 }) // 支援標籤搜尋

// 文字搜尋索引
recordSchema.index({ 
  description: 'text' 
}, {
  weights: { description: 1 }
})

// 中介軟體
recordSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Record || mongoose.model<IRecord>('Record', recordSchema)