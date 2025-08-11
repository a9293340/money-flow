/**
 * Record 資料模型
 * 管理收支記錄，包含金額、分類、描述等資訊
 */

import type { Document, Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// 記錄類型
export type RecordType = 'income' | 'expense'

// 記錄來源
export type RecordSource = 'web' | 'mobile' | 'api' | 'import'

// 記錄文檔介面
export interface IRecord extends Document {
  _id: string
  userId: string
  amount: number
  type: RecordType
  description?: string
  categoryId: string
  date: Date
  currency: string
  exchangeRate?: number
  baseCurrencyAmount: number // 以基礎貨幣計算的金額
  tags?: string[]
  location?: {
    name?: string
    coordinates?: [number, number] // [longitude, latitude]
  }
  receipt?: {
    url: string
    filename: string
    size?: number
  }
  metadata?: {
    source: RecordSource
    version?: string
    importId?: string // 批量匯入時的識別碼
    originalData?: Record<string, unknown> // 保留原始匯入資料
  }
  createdAt: Date
  updatedAt: Date

  // 虛擬欄位
  category?: Record<string, unknown>
}

// Schema 定義
const recordSchema = new Schema<IRecord>({
  userId: {
    type: String,
    required: [true, '使用者ID為必填欄位'],
    index: true,
  },

  amount: {
    type: Number,
    required: [true, '金額為必填欄位'],
    min: [0.01, '金額必須大於 0'],
    max: [999999999.99, '金額不能超過 999,999,999.99'],
    validate: {
      validator: function (amount: number) {
        // 檢查小數位數不超過 2 位
        return Number((Math.round(amount * 100) / 100).toFixed(2)) === Number(amount.toFixed(2))
      },
      message: '金額最多只能有 2 位小數',
    },
  },

  type: {
    type: String,
    required: [true, '記錄類型為必填欄位'],
    enum: {
      values: ['income', 'expense'],
      message: '記錄類型必須是 income 或 expense',
    },
    index: true,
  },

  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述不能超過 200 個字元'],
  },

  categoryId: {
    type: String,
    required: [true, '分類為必填欄位'],
    index: true,
  },

  date: {
    type: Date,
    required: [true, '日期為必填欄位'],
    index: true,
    validate: {
      validator: function (date: Date) {
        // 不能是未來的日期（允許今天）
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return date <= today
      },
      message: '記錄日期不能是未來的日期',
    },
  },

  currency: {
    type: String,
    required: true,
    default: 'TWD',
    enum: {
      values: ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW'],
      message: '不支援的貨幣類型',
    },
    index: true,
  },

  exchangeRate: {
    type: Number,
    min: [0.0001, '匯率必須大於 0'],
    max: [10000, '匯率不能超過 10000'],
    default: 1.0,
  },

  baseCurrencyAmount: {
    type: Number,
    required: true,
    min: [0.01, '基礎貨幣金額必須大於 0'],
    max: [999999999.99, '基礎貨幣金額不能超過 999,999,999.99'],
  },

  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '標籤長度不能超過 20 個字元'],
  }],

  location: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, '地點名稱不能超過 100 個字元'],
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function (coords: number[]) {
          if (!coords || coords.length === 0) return true
          return coords.length === 2
            && coords[0] >= -180 && coords[0] <= 180 // longitude
            && coords[1] >= -90 && coords[1] <= 90 // latitude
        },
        message: '座標格式不正確，應為 [經度, 緯度]',
      },
    },
  },

  receipt: {
    url: {
      type: String,
      validate: {
        validator: function (url: string) {
          if (!url) return true
          return /^https?:\/\/.+/.test(url)
        },
        message: '收據URL格式不正確',
      },
    },
    filename: String,
    size: {
      type: Number,
      min: [0, '檔案大小不能為負數'],
      max: [10 * 1024 * 1024, '檔案大小不能超過 10MB'],
    },
  },

  metadata: {
    source: {
      type: String,
      required: true,
      default: 'web',
      enum: {
        values: ['web', 'mobile', 'api', 'import'],
        message: '不支援的資料來源',
      },
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    importId: {
      type: String,
      index: true,
    },
    originalData: Schema.Types.Mixed,
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc: Document, ret: Record<string, unknown>) {
      // 格式化金額顯示
      ret.formattedAmount = (ret.amount as number).toFixed(2)
      ret.formattedBaseCurrencyAmount = (ret.baseCurrencyAmount as number).toFixed(2)
      return ret
    },
  },
  toObject: { virtuals: true },
})

// 索引設定
recordSchema.index({ userId: 1, date: -1 }) // 主要查詢索引
recordSchema.index({ userId: 1, type: 1, date: -1 }) // 按類型查詢
recordSchema.index({ userId: 1, categoryId: 1, date: -1 }) // 按分類查詢
recordSchema.index({ userId: 1, date: -1, type: 1 }) // 統計查詢
recordSchema.index({ tags: 1 }) // 標籤搜尋
recordSchema.index({ 'metadata.importId': 1 }) // 批量匯入查詢

// 文字搜尋索引
recordSchema.index({
  'description': 'text',
  'tags': 'text',
  'location.name': 'text',
})

// 虛擬欄位：分類資訊
recordSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
})

// 中間件：自動計算基礎貨幣金額
recordSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('exchangeRate')) {
    this.baseCurrencyAmount = this.amount * (this.exchangeRate || 1)
  }
  next()
})

// 中間件：驗證分類類型與記錄類型一致
recordSchema.pre('save', async function (next) {
  if (this.isModified('categoryId') || this.isModified('type')) {
    try {
      const Category = mongoose.model('Category')
      const category = await Category.findById(this.categoryId)

      if (!category) {
        return next(new Error('指定的分類不存在'))
      }

      if (category.type !== this.type) {
        return next(new Error('記錄類型與分類類型不符'))
      }

      next()
    }
    catch (error: unknown) {
      next(error)
    }
  }
  else {
    next()
  }
})

// 靜態方法：取得使用者記錄
recordSchema.statics.getUserRecords = function (
  userId: string,
  options: {
    startDate?: Date
    endDate?: Date
    type?: RecordType
    categoryId?: string
    limit?: number
    offset?: number
  } = {},
) {
  const query: Record<string, unknown> = { userId }

  // 日期範圍篩選
  if (options.startDate || options.endDate) {
    query.date = {}
    if (options.startDate) query.date.$gte = options.startDate
    if (options.endDate) query.date.$lte = options.endDate
  }

  // 類型篩選
  if (options.type) query.type = options.type

  // 分類篩選
  if (options.categoryId) query.categoryId = options.categoryId

  const queryBuilder = this.find(query)
    .populate('category', 'name icon color type')
    .sort({ date: -1, createdAt: -1 })

  // 分頁
  if (options.limit) {
    queryBuilder.limit(options.limit)
    if (options.offset) {
      queryBuilder.skip(options.offset)
    }
  }

  return queryBuilder
}

// 靜態方法：統計使用者記錄
recordSchema.statics.getUserStats = function (
  userId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const matchStage: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) }

  if (startDate || endDate) {
    matchStage.date = {}
    if (startDate) matchStage.date.$gte = startDate
    if (endDate) matchStage.date.$lte = endDate
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$baseCurrencyAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$baseCurrencyAmount' },
      },
    },
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            type: '$_id',
            totalAmount: '$totalAmount',
            count: '$count',
            avgAmount: '$avgAmount',
          },
        },
        totalRecords: { $sum: '$count' },
      },
    },
  ])
}

// 靜態方法：按分類統計
recordSchema.statics.getCategoryStats = function (
  userId: string,
  type: RecordType,
  startDate?: Date,
  endDate?: Date,
) {
  const matchStage: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
    type,
  }

  if (startDate || endDate) {
    matchStage.date = {}
    if (startDate) matchStage.date.$gte = startDate
    if (endDate) matchStage.date.$lte = endDate
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$categoryId',
        categoryName: { $first: '$category.name' },
        categoryIcon: { $first: '$category.icon' },
        categoryColor: { $first: '$category.color' },
        totalAmount: { $sum: '$baseCurrencyAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$baseCurrencyAmount' },
        maxAmount: { $max: '$baseCurrencyAmount' },
        minAmount: { $min: '$baseCurrencyAmount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ])
}

// 建立並匯出模型
export const Record: Model<IRecord> = mongoose.models.Record || mongoose.model<IRecord>('Record', recordSchema)
