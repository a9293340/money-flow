/**
 * 收入期間追蹤模型
 * 用於追蹤特定時間期間內的收入達成情況
 */

import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// 期間狀態枚舉
export enum IncomePeriodStatus {
  PENDING = 'pending', // 等待中（尚未到期）
  PARTIAL = 'partial', // 部分達成
  COMPLETED = 'completed', // 已完成
  OVERDUE = 'overdue', // 逾期未達成
  MISSED = 'missed', // 完全錯過
}

// 匹配記錄介面
export interface IMatchedRecord {
  recordId: mongoose.Types.ObjectId // 匹配的記錄 ID
  matchedAmount: number // 匹配金額
  confidence: number // 匹配信心度 (0-1)
  matchedAt: Date // 匹配時間
  isManual: boolean // 是否手動匹配
}

// 收入期間介面定義
export interface IIncomePeriod extends Document {
  _id: string
  forecastingId: mongoose.Types.ObjectId // 關聯的收入預測 ID
  userId: mongoose.Types.ObjectId

  // === 期間基本資訊 ===
  periodNumber: number // 期間序號（第1期、第2期...）
  startDate: Date // 期間開始日期
  endDate: Date // 期間結束日期
  expectedAmount: number // 該期間預期金額

  // === 收款日資訊 ===
  expectedPaymentDate: Date // 該期間的期望收款日
  actualPaymentDates: Date[] // 實際收款日期（可能有多筆）
  matchingDateRange: {
    startDate: Date // expectedPaymentDate - dateTolerance
    endDate: Date // expectedPaymentDate + dateTolerance
  }

  // === 匹配資料 ===
  matchedRecords: IMatchedRecord[] // 匹配的記錄列表

  // === 統計計算 ===
  actualAmount: number // 實際收到金額
  status: IncomePeriodStatus // 期間狀態
  achievementRate: number // 該期間達成率 (0-1)
  healthScore: number // 健康度評分 (0-100)

  // === 虛擬欄位 ===
  isActive: boolean
  isOverdue: boolean
  daysRemaining: number
  daysSinceStart: number

  // === 系統欄位 ===
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date

  // === 實例方法 ===
  updateStatus(): Promise<void>
  addMatchedRecord(recordId: string, amount: number, confidence: number, isManual: boolean): Promise<void>
  removeMatchedRecord(recordId: string): Promise<void>
  calculateHealthScore(): number
}

// MongoDB Schema 定義
const incomePeriodSchema = new Schema<IIncomePeriod>({
  forecastingId: {
    type: Schema.Types.ObjectId,
    ref: 'IncomeForecasting',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // === 期間基本資訊 ===
  periodNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  expectedAmount: {
    type: Number,
    required: true,
    min: 0,
  },

  // === 收款日資訊 ===
  expectedPaymentDate: {
    type: Date,
    required: true,
    index: true,
  },
  actualPaymentDates: [{
    type: Date,
  }],
  matchingDateRange: {
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
  },

  // === 匹配資料 ===
  matchedRecords: [{
    recordId: {
      type: Schema.Types.ObjectId,
      ref: 'Record',
      required: true,
    },
    matchedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    matchedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isManual: {
      type: Boolean,
      required: true,
      default: false,
    },
  }],

  // === 統計計算 ===
  actualAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(IncomePeriodStatus),
    default: IncomePeriodStatus.PENDING,
    index: true,
  },
  achievementRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 2, // 允許超額達成
  },
  healthScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },

  // === 系統欄位 ===
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// === 索引 ===
incomePeriodSchema.index({ forecastingId: 1, periodNumber: 1 })
incomePeriodSchema.index({ userId: 1, isDeleted: 1 })
incomePeriodSchema.index({ status: 1, endDate: 1 })
incomePeriodSchema.index({ startDate: 1, endDate: 1 })

// === 虛擬欄位 ===
incomePeriodSchema.virtual('isActive').get(function () {
  const now = new Date()
  return now >= this.startDate && now <= this.endDate
})

incomePeriodSchema.virtual('isOverdue').get(function () {
  const now = new Date()
  return now > this.endDate && this.status !== IncomePeriodStatus.COMPLETED
})

incomePeriodSchema.virtual('daysRemaining').get(function () {
  const now = new Date()
  const diffTime = this.endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

incomePeriodSchema.virtual('daysSinceStart').get(function () {
  const now = new Date()
  const diffTime = now.getTime() - this.startDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

// === 實例方法 ===

// 更新期間狀態
incomePeriodSchema.methods.updateStatus = async function (this: IIncomePeriod): Promise<void> {
  const now = new Date()

  // 重新計算實際金額和達成率
  this.actualAmount = this.matchedRecords.reduce((sum, record) => sum + record.matchedAmount, 0)
  this.achievementRate = this.expectedAmount > 0 ? this.actualAmount / this.expectedAmount : 0

  // 根據時間和達成率更新狀態
  if (this.achievementRate >= 0.95) {
    // 達成率 >= 95% 視為完成
    this.status = IncomePeriodStatus.COMPLETED
  }
  else if (now > this.endDate) {
    // 已過期
    if (this.achievementRate === 0) {
      this.status = IncomePeriodStatus.MISSED
    }
    else if (this.achievementRate < 0.5) {
      this.status = IncomePeriodStatus.OVERDUE
    }
    else {
      this.status = IncomePeriodStatus.PARTIAL
    }
  }
  else if (this.achievementRate > 0) {
    // 期間內有部分收入
    this.status = IncomePeriodStatus.PARTIAL
  }
  else {
    // 期間內且無收入
    this.status = IncomePeriodStatus.PENDING
  }

  // 更新健康度評分
  this.healthScore = this.calculateHealthScore()

  await this.save()
}

// 新增匹配記錄
incomePeriodSchema.methods.addMatchedRecord = async function (
  this: IIncomePeriod,
  recordId: string,
  amount: number,
  confidence: number,
  isManual: boolean = false,
): Promise<void> {
  // 檢查是否已經匹配過
  const existingMatch = this.matchedRecords.find(
    record => record.recordId.toString() === recordId,
  )

  if (existingMatch) {
    throw new Error('記錄已經匹配到此期間')
  }

  // 新增匹配記錄
  this.matchedRecords.push({
    recordId: new mongoose.Types.ObjectId(recordId),
    matchedAmount: amount,
    confidence,
    matchedAt: new Date(),
    isManual,
  })

  // 更新狀態
  await this.updateStatus()
}

// 移除匹配記錄
incomePeriodSchema.methods.removeMatchedRecord = async function (
  this: IIncomePeriod,
  recordId: string,
): Promise<void> {
  const originalLength = this.matchedRecords.length
  this.matchedRecords = this.matchedRecords.filter(
    record => record.recordId.toString() !== recordId,
  )

  if (this.matchedRecords.length === originalLength) {
    throw new Error('找不到要移除的匹配記錄')
  }

  // 更新狀態
  await this.updateStatus()
}

// 計算健康度評分
incomePeriodSchema.methods.calculateHealthScore = function (this: IIncomePeriod): number {
  const now = new Date()

  // 基礎分數：達成率
  let score = Math.min(this.achievementRate * 70, 70)

  // 時效性加分
  if (this.status === IncomePeriodStatus.COMPLETED) {
    // 如果提前完成，額外加分
    if (now < this.endDate) {
      score += 20
    }
    else {
      score += 10
    }
  }
  else if (this.status === IncomePeriodStatus.PENDING && now <= this.endDate) {
    // 期間內待完成，依進度給分
    const timeProgress = this.daysSinceStart / (this.daysSinceStart + this.daysRemaining)
    if (this.achievementRate >= timeProgress * 0.8) {
      score += 10 // 進度正常
    }
    else {
      score += 5 // 進度稍慢
    }
  }

  // 準確性加分：匹配信心度平均
  if (this.matchedRecords.length > 0) {
    const avgConfidence = this.matchedRecords.reduce((sum, record) => sum + record.confidence, 0) / this.matchedRecords.length
    score += avgConfidence * 10
  }

  // 懲罰：逾期或錯過
  if (this.status === IncomePeriodStatus.OVERDUE) {
    score = Math.max(score - 20, 0)
  }
  else if (this.status === IncomePeriodStatus.MISSED) {
    score = Math.max(score - 40, 0)
  }

  return Math.min(Math.round(score), 100)
}

// === 靜態方法 ===

// 查找需要更新狀態的期間
incomePeriodSchema.statics.findPeriodsNeedingUpdate = function () {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  return this.find({
    isDeleted: false,
    status: { $in: [IncomePeriodStatus.PENDING, IncomePeriodStatus.PARTIAL] },
    endDate: { $lt: new Date() }, // 已過期
    updatedAt: { $lt: yesterday }, // 超過一天未更新
  })
}

// 建立模型
export const IncomePeriod = mongoose.models.IncomePeriod
  || mongoose.model<IIncomePeriod>('IncomePeriod', incomePeriodSchema)

export default IncomePeriod

// === Frontend Type Definitions ===

export interface MatchedRecord {
  recordId: {
    _id: string
    amount: number
    date: Date | string
    description?: string
    account?: {
      name: string
    }
    currency: string
    tags?: string[]
  }
  matchedAmount: number
  confidence: number
  matchedAt: Date | string
  isManual: boolean
}

export interface IncomePeriod {
  _id: string
  forecastingId: string
  userId: string
  periodNumber: number
  startDate: Date | string
  endDate: Date | string
  expectedAmount: number
  expectedPaymentDate: Date | string
  actualPaymentDates: (Date | string)[]
  matchingDateRange: {
    startDate: Date | string
    endDate: Date | string
  }
  actualAmount: number
  currency: string
  matchedRecords: MatchedRecord[]
  status: IncomePeriodStatus
  achievementRate: number
  healthScore: number
  isActive?: boolean
  isOverdue?: boolean
  daysRemaining?: number
  daysSinceStart?: number
  createdAt: Date | string
  updatedAt: Date | string
  isDeleted: boolean
}
