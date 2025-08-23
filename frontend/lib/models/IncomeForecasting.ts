/**
 * 收入預測管理模型
 * 用於追蹤定期收入的預測和實際達成情況
 */

import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// 收入頻率枚舉
export enum IncomeForecastFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// 收款日類型枚舉
export enum PaymentScheduleType {
  FIXED_DAY_OF_MONTH = 'fixed_day_of_month', // 每月固定幾號
  FIXED_DATE = 'fixed_date', // 固定日期
  WORKING_DAY = 'working_day', // 工作日相關
  CUSTOM = 'custom', // 自定義規則
}

// 容錯規則枚舉
export enum FallbackRule {
  NEXT_WORKING_DAY = 'next_working_day', // 下一個工作日
  PREVIOUS_WORKING_DAY = 'previous_working_day', // 前一個工作日
  EXACT_DATE = 'exact_date', // 嚴格按日期
}

// 收入預測介面定義
export interface IIncomeForecasting extends Document {
  _id: string
  userId: mongoose.Types.ObjectId

  // === 基本資訊 ===
  name: string // 收入名稱，如「薪資」、「業績獎金」
  expectedAmount: number // 預期金額
  currency: string // 幣別，預設 'TWD'
  incomeCategory: mongoose.Types.ObjectId // 收入分類 ID
  frequency: IncomeForecastFrequency // 收入頻率
  startDate: Date // 開始追蹤日期
  endDate?: Date // 結束日期（可選）
  description?: string // 備註說明

  // === 收款日設定 ===
  paymentSchedule: {
    type: PaymentScheduleType // 收款日類型
    dayOfMonth?: number // 每月幾號 (1-31)，用於 fixed_day_of_month
    fixedDate?: Date // 固定日期，用於 fixed_date
    workingDayOffset?: number // 月底工作日偏移，用於 working_day (如 -1 = 月底最後一個工作日)
    customRule?: string // 自定義規則，用於 custom
    fallbackRule: FallbackRule // 容錯處理規則
  }

  // === 智能匹配設定 ===
  matchingConfig: {
    amountTolerance: number // 金額容差百分比，預設 10
    dateTolerance: number // 基於收款日的日期容差天數，預設 3
    autoMatch: boolean // 是否自動匹配，預設 true
  }

  // === 統計資料 ===
  statistics: {
    totalPeriods: number // 總期間數
    matchedPeriods: number // 已匹配期間數
    totalExpected: number // 總預期金額
    totalReceived: number // 總實收金額
    achievementRate: number // 達成率 (0-1)
    lastMatchedAt?: Date // 最後匹配時間
  }

  // === 系統欄位 ===
  isActive: boolean // 是否啟用
  isDeleted: boolean // 軟刪除標記
  createdAt: Date
  updatedAt: Date

  // === 虛擬欄位 ===
  currentAchievementRate: number
  healthScore: number

  // === 實例方法 ===
  updateStatistics(): Promise<void>
  generateNextPeriod(): Promise<any>
  performAutoMatch(): Promise<number>
  calculateMatchConfidence(record: any, period: any): number
  matchRecordToPeriod(record: any, period: any, confidence: number, isManual: boolean): Promise<void>
  softDelete(): Promise<void>
  calculateExpectedPaymentDate(periodStartDate: Date, periodEndDate: Date): Date
  applyFallbackRule(targetDate: Date): Date
}

// MongoDB Schema 定義
const incomeForecastingSchema = new Schema<IIncomeForecasting>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // === 基本資訊 ===
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  expectedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'TWD',
    uppercase: true,
    maxlength: 3,
  },
  incomeCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  frequency: {
    type: String,
    required: true,
    enum: Object.values(IncomeForecastFrequency),
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  // === 收款日設定 ===
  paymentSchedule: {
    type: {
      type: String,
      required: true,
      enum: Object.values(PaymentScheduleType),
      default: PaymentScheduleType.FIXED_DAY_OF_MONTH,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    fixedDate: {
      type: Date,
    },
    workingDayOffset: {
      type: Number,
      min: -10,
      max: 10,
    },
    customRule: {
      type: String,
      maxlength: 200,
    },
    fallbackRule: {
      type: String,
      required: true,
      enum: Object.values(FallbackRule),
      default: FallbackRule.NEXT_WORKING_DAY,
    },
  },

  // === 智能匹配設定 ===
  matchingConfig: {
    amountTolerance: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },
    dateTolerance: {
      type: Number,
      required: true,
      default: 3,
      min: 0,
      max: 30,
    },
    autoMatch: {
      type: Boolean,
      required: true,
      default: true,
    },
  },

  // === 統計資料 ===
  statistics: {
    totalPeriods: {
      type: Number,
      default: 0,
      min: 0,
    },
    matchedPeriods: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalExpected: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    lastMatchedAt: {
      type: Date,
    },
  },

  // === 系統欄位 ===
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
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
incomeForecastingSchema.index({ userId: 1, isDeleted: 1, isActive: 1 })
incomeForecastingSchema.index({ userId: 1, incomeCategory: 1 })
incomeForecastingSchema.index({ frequency: 1, isActive: 1 })
incomeForecastingSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } })

// === 虛擬欄位 ===
incomeForecastingSchema.virtual('currentAchievementRate').get(function () {
  if (this.statistics.totalExpected === 0) return 0
  return this.statistics.totalReceived / this.statistics.totalExpected
})

incomeForecastingSchema.virtual('healthScore').get(function () {
  // 健康度評分：基於達成率、準時性、穩定性計算 (0-100)
  const achievementRate = this.currentAchievementRate
  const baseScore = Math.min(achievementRate * 80, 80) // 達成率最多貢獻80分

  // 準時性加分：如果近期都按時到帳，加分
  const timelinessBonus = this.statistics.matchedPeriods > 0 ? 10 : 0

  // 穩定性加分：如果持續追蹤，加分
  const stabilityBonus = this.statistics.totalPeriods >= 3 ? 10 : 5

  return Math.min(baseScore + timelinessBonus + stabilityBonus, 100)
})

// === 實例方法 ===

// 更新統計資料
incomeForecastingSchema.methods.updateStatistics = async function (this: IIncomeForecasting): Promise<void> {
  const IncomePeriod = mongoose.model('IncomePeriod')

  // 查詢所有相關期間
  const periods = await IncomePeriod.find({
    forecastingId: this._id,
    userId: this.userId,
    isDeleted: false,
  })

  // 計算統計數據
  const totalPeriods = periods.length
  const matchedPeriods = periods.filter(period => period.matchedRecords.length > 0).length
  const totalExpected = periods.reduce((sum, period) => sum + period.expectedAmount, 0)
  const totalReceived = periods.reduce((sum, period) => sum + period.actualAmount, 0)
  const achievementRate = totalExpected > 0 ? totalReceived / totalExpected : 0

  // 更新統計
  this.statistics = {
    totalPeriods,
    matchedPeriods,
    totalExpected,
    totalReceived,
    achievementRate,
    lastMatchedAt: matchedPeriods > 0 ? new Date() : this.statistics.lastMatchedAt,
  }

  await this.save()
}

// 計算期望收款日
incomeForecastingSchema.methods.calculateExpectedPaymentDate = function (
  this: IIncomeForecasting,
  periodStartDate: Date,
  periodEndDate: Date,
): Date {
  const { paymentSchedule } = this

  switch (paymentSchedule.type) {
    case PaymentScheduleType.FIXED_DAY_OF_MONTH: {
      if (!paymentSchedule.dayOfMonth) {
        throw new Error('paymentSchedule.dayOfMonth is required for FIXED_DAY_OF_MONTH')
      }

      // 計算該期間月份中的指定日期
      const targetDate = new Date(periodStartDate)
      targetDate.setDate(paymentSchedule.dayOfMonth)

      // 如果指定日期超過該月最大天數，調整到月底
      const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
      if (paymentSchedule.dayOfMonth > lastDayOfMonth) {
        targetDate.setDate(lastDayOfMonth)
      }

      // 應用容錯規則（如遇假日調整）
      return this.applyFallbackRule(targetDate)
    }

    case PaymentScheduleType.FIXED_DATE: {
      if (!paymentSchedule.fixedDate) {
        throw new Error('paymentSchedule.fixedDate is required for FIXED_DATE')
      }
      return this.applyFallbackRule(new Date(paymentSchedule.fixedDate))
    }

    case PaymentScheduleType.WORKING_DAY: {
      const offset = paymentSchedule.workingDayOffset || 0
      // 簡化實作：基於期間結束日期計算工作日偏移
      const targetDate = new Date(periodEndDate)
      targetDate.setDate(targetDate.getDate() + offset)
      return this.applyFallbackRule(targetDate)
    }

    case PaymentScheduleType.CUSTOM: {
      // 簡化實作：使用期間中點
      const midPoint = new Date((periodStartDate.getTime() + periodEndDate.getTime()) / 2)
      return this.applyFallbackRule(midPoint)
    }

    default:
      throw new Error(`Unsupported payment schedule type: ${paymentSchedule.type}`)
  }
}

// 應用容錯規則
incomeForecastingSchema.methods.applyFallbackRule = function (
  this: IIncomeForecasting,
  targetDate: Date,
): Date {
  // 簡化實作：目前只返回原始日期
  // 未來可以添加假日檢查和工作日調整邏輯
  return targetDate
}

// 生成下一個期間
incomeForecastingSchema.methods.generateNextPeriod = async function (this: IIncomeForecasting): Promise<any> {
  const IncomePeriod = mongoose.model('IncomePeriod')

  // 計算下一個期間的開始和結束日期
  const lastPeriod = await IncomePeriod.findOne({
    forecastingId: this._id,
    userId: this.userId,
    isDeleted: false,
  }).sort({ periodNumber: -1 })

  let nextStartDate: Date
  // nextEndDate will be initialized based on nextStartDate and frequency
  let periodNumber = 1

  if (lastPeriod) {
    nextStartDate = new Date(lastPeriod.endDate)
    nextStartDate.setDate(nextStartDate.getDate() + 1)
    periodNumber = lastPeriod.periodNumber + 1
  }
  else {
    nextStartDate = new Date(this.startDate)
  }

  // 根據頻率計算結束日期
  const nextEndDate = new Date(nextStartDate)
  switch (this.frequency) {
    case IncomeForecastFrequency.WEEKLY:
      nextEndDate.setDate(nextEndDate.getDate() + 6)
      break
    case IncomeForecastFrequency.MONTHLY:
      nextEndDate.setMonth(nextEndDate.getMonth() + 1)
      nextEndDate.setDate(nextEndDate.getDate() - 1)
      break
    case IncomeForecastFrequency.QUARTERLY:
      nextEndDate.setMonth(nextEndDate.getMonth() + 3)
      nextEndDate.setDate(nextEndDate.getDate() - 1)
      break
    case IncomeForecastFrequency.YEARLY:
      nextEndDate.setFullYear(nextEndDate.getFullYear() + 1)
      nextEndDate.setDate(nextEndDate.getDate() - 1)
      break
  }

  // 檢查是否超過結束日期
  if (this.endDate && nextStartDate > this.endDate) {
    return null // 不生成新期間
  }

  // 計算期望收款日
  const expectedPaymentDate = this.calculateExpectedPaymentDate(nextStartDate, nextEndDate)

  // 計算匹配日期範圍
  const matchingStartDate = new Date(expectedPaymentDate)
  matchingStartDate.setDate(matchingStartDate.getDate() - this.matchingConfig.dateTolerance)
  const matchingEndDate = new Date(expectedPaymentDate)
  matchingEndDate.setDate(matchingEndDate.getDate() + this.matchingConfig.dateTolerance)

  // 創建新期間
  const newPeriod = new IncomePeriod({
    forecastingId: this._id,
    userId: this.userId,
    periodNumber,
    startDate: nextStartDate,
    endDate: nextEndDate,
    expectedAmount: this.expectedAmount,
    expectedPaymentDate,
    actualPaymentDates: [],
    matchingDateRange: {
      startDate: matchingStartDate,
      endDate: matchingEndDate,
    },
    matchedRecords: [],
    actualAmount: 0,
    status: 'pending',
    achievementRate: 0,
    healthScore: 50, // 預設健康度
  })

  await newPeriod.save()
  return newPeriod
}

// 執行自動匹配
incomeForecastingSchema.methods.performAutoMatch = async function (this: IIncomeForecasting): Promise<number> {
  if (!this.matchingConfig.autoMatch) return 0

  const Record = mongoose.model('Record')
  const IncomePeriod = mongoose.model('IncomePeriod')

  // 獲取所有未完成的期間
  const periods = await IncomePeriod.find({
    forecastingId: this._id,
    userId: this.userId,
    status: { $in: ['pending', 'partial'] },
    isDeleted: false,
  })

  let matchedCount = 0

  for (const period of periods) {
    // 查找符合條件的未匹配收入記錄
    const matchCriteria: any = {
      'userId': this.userId,
      'type': 'income',
      'categoryId': this.incomeCategory, // 修正：使用 categoryId 而不是 category
      'isDeleted': false,
      'incomeForecastMatching.forecastingId': { $exists: false }, // 未匹配
    }

    // 日期範圍：使用新的收款日匹配範圍
    matchCriteria.date = {
      $gte: period.matchingDateRange.startDate,
      $lte: period.matchingDateRange.endDate,
    }

    // 金額範圍
    const amountTolerance = this.expectedAmount * (this.matchingConfig.amountTolerance / 100)
    matchCriteria.amount = {
      $gte: this.expectedAmount - amountTolerance,
      $lte: this.expectedAmount + amountTolerance,
    }

    const candidateRecords = await Record.find(matchCriteria)

    // 為每個候選記錄計算匹配信心度
    for (const record of candidateRecords) {
      const confidence = this.calculateMatchConfidence(record, period)

      if (confidence >= 0.7) { // 信心度閾值
        // 執行匹配
        await this.matchRecordToPeriod(record, period, confidence, false)
        matchedCount++
      }
    }
  }

  // 更新統計
  await this.updateStatistics()

  return matchedCount
}

// 計算匹配信心度
incomeForecastingSchema.methods.calculateMatchConfidence = function (
  this: IIncomeForecasting,
  record: any,
  period: any,
): number {
  // 金額相似度 (0-1)
  const amountDiff = Math.abs(record.amount - this.expectedAmount)
  const maxAmountDiff = this.expectedAmount * (this.matchingConfig.amountTolerance / 100)
  const amountSimilarity = Math.max(0, 1 - (amountDiff / maxAmountDiff))

  // 日期相似度 (0-1)：基於期望收款日計算
  const recordDate = new Date(record.date)
  const expectedPaymentDate = new Date(period.expectedPaymentDate)
  const dateDiff = Math.abs(recordDate.getTime() - expectedPaymentDate.getTime())
  const maxDateDiff = this.matchingConfig.dateTolerance * 24 * 60 * 60 * 1000 // 毫秒
  const dateSimilarity = Math.max(0, 1 - (dateDiff / maxDateDiff))

  // 分類匹配 (0 或 1)
  const categorySimilarity = record.categoryId.toString() === this.incomeCategory.toString() ? 1 : 0

  // 加權計算總信心度
  return (amountSimilarity * 0.4 + dateSimilarity * 0.3 + categorySimilarity * 0.3)
}

// 將記錄匹配到期間
incomeForecastingSchema.methods.matchRecordToPeriod = async function (
  this: IIncomeForecasting,
  record: any,
  period: any,
  confidence: number,
  isManual: boolean,
): Promise<void> {
  const Record = mongoose.model('Record')
  // IncomePeriod model not needed in this function

  // 更新記錄的匹配資訊
  await Record.findByIdAndUpdate(record._id, {
    incomeForecastMatching: {
      forecastingId: this._id,
      periodId: period._id,
      confidence,
      matchedAt: new Date(),
      isManual,
    },
  })

  // 更新期間的匹配記錄
  period.matchedRecords.push({
    recordId: record._id,
    matchedAmount: record.amount,
    confidence,
    matchedAt: new Date(),
    isManual,
  })

  // 重新計算期間統計
  period.actualAmount = period.matchedRecords.reduce((sum: number, match: any) => sum + match.matchedAmount, 0)
  period.achievementRate = period.expectedAmount > 0 ? period.actualAmount / period.expectedAmount : 0

  // 更新期間狀態
  if (period.achievementRate >= 0.9) {
    period.status = 'completed'
  }
  else if (period.achievementRate > 0) {
    period.status = 'partial'
  }

  // 計算健康度
  period.healthScore = Math.min(period.achievementRate * 100, 100)

  await period.save()
}

// 軟刪除
incomeForecastingSchema.methods.softDelete = async function (this: IIncomeForecasting): Promise<void> {
  this.isDeleted = true
  this.isActive = false
  await this.save()

  // 同時軟刪除相關的期間記錄
  const IncomePeriod = mongoose.model('IncomePeriod')
  await IncomePeriod.updateMany(
    { forecastingId: this._id },
    { isDeleted: true },
  )
}

// 建立模型
export const IncomeForecasting = mongoose.models.IncomeForecasting
  || mongoose.model<IIncomeForecasting>('IncomeForecasting', incomeForecastingSchema)

export default IncomeForecasting

// === Frontend Type Definitions ===

export interface IncomeForecastingItem {
  _id: string
  userId: string
  name: string
  description?: string
  expectedAmount: number
  currency: string
  incomeCategory: string | {
    _id: string
    name: string
    color?: string
    icon?: string
  }
  frequency: IncomeForecastFrequency
  startDate: Date | string
  endDate?: Date | string
  isActive: boolean
  paymentSchedule: {
    type: PaymentScheduleType
    dayOfMonth?: number
    fixedDate?: Date | string
    workingDayOffset?: number
    customRule?: string
    fallbackRule: FallbackRule
  }
  matchingConfig: {
    amountTolerance: number
    dateTolerance: number
    autoMatch: boolean
  }
  statistics?: {
    totalPeriods: number
    matchedRecords: number
    averageAccuracy?: number
    totalMatchedAmount?: number
    lastMatchedDate?: Date | string
  }
  createdAt: Date | string
  updatedAt: Date | string
  isDeleted: boolean
}

export interface IncomeForecastingSummary {
  totalItems: number
  activeItems: number
  monthlyExpected: number
  matchRate: number
}
