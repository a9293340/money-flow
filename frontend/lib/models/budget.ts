/**
 * 預算管理資料模型
 *
 * 功能說明：
 * 1. 支援按分類、月度/年度設定預算
 * 2. 追蹤預算執行進度和超支警告
 * 3. 支援多幣別預算設定
 * 4. 提供預算統計和分析功能
 */

import mongoose from 'mongoose'

// 預算週期類型
export enum BudgetPeriodType {
  MONTHLY = 'monthly', // 月度預算
  YEARLY = 'yearly', // 年度預算
  QUARTERLY = 'quarterly', // 季度預算
}

// 預算狀態
export enum BudgetStatus {
  ACTIVE = 'active', // 啟用中
  INACTIVE = 'inactive', // 已停用
  COMPLETED = 'completed', // 已完成
  EXCEEDED = 'exceeded', // 已超支
}

// 預算警告級別
export enum BudgetWarningLevel {
  SAFE = 'safe', // 安全範圍 (0-70%)
  WARNING = 'warning', // 警告範圍 (70-90%)
  DANGER = 'danger', // 危險範圍 (90-100%)
  EXCEEDED = 'exceeded', // 已超支 (>100%)
}

// 預算介面定義
export interface IBudget extends mongoose.Document {
  _id: string
  userId: string

  // 基本資訊
  name: string // 預算名稱
  description?: string // 預算描述

  // 預算設定
  amount: number // 預算金額
  currency: string // 幣別代碼 (如 'TWD', 'USD')
  baseCurrencyAmount?: number // 基準幣別金額（用於多幣別統計）

  // 分類和期間設定
  categoryIds: string[] // 適用的分類 ID 列表（空陣列表示全部分類）
  periodType: BudgetPeriodType // 預算週期類型

  // 時間範圍
  startDate: Date // 預算開始日期
  endDate: Date // 預算結束日期

  // 狀態和追蹤
  status: BudgetStatus // 預算狀態
  currentSpent: number // 目前已花費金額
  currentSpentBaseCurrency?: number // 基準幣別已花費金額

  // 警告設定
  warningThreshold: number // 警告閾值 (百分比，預設 80)
  warningLevel: BudgetWarningLevel // 當前警告級別

  // 統計資訊
  usagePercentage: number // 使用率百分比
  remainingAmount: number // 剩餘金額
  remainingDays: number // 剩餘天數
  avgDailySpent: number // 平均每日支出
  projectedTotal: number // 預測總支出

  // 系統欄位
  isActive: boolean // 是否啟用
  isDeleted: boolean // 軟刪除標記
  context: 'system' | 'personal' // 資料來源上下文

  // 時間戳記
  createdAt: Date
  updatedAt: Date
  lastCalculatedAt?: Date // 最後計算時間

  // 方法
  calculateStats(records?: any[]): void
}

// MongoDB Schema 定義
const budgetSchema = new mongoose.Schema<IBudget>({
  userId: {
    type: String,
    required: true,
    index: true,
  },

  // 基本資訊
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  // 預算設定
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (value: number) {
        return value > 0
      },
      message: '預算金額必須大於 0',
    },
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'TWD',
    validate: {
      validator: function (value: string) {
        // 基本的幣別代碼驗證（3個字母）
        return /^[A-Z]{3}$/.test(value)
      },
      message: '幣別代碼必須為 3 個大寫字母',
    },
  },
  baseCurrencyAmount: {
    type: Number,
    min: 0,
  },

  // 分類和期間設定
  categoryIds: [{
    type: String,
    validate: {
      validator: function (id: string) {
        return mongoose.Types.ObjectId.isValid(id)
      },
      message: '無效的分類 ID',
    },
  }],
  periodType: {
    type: String,
    enum: Object.values(BudgetPeriodType),
    required: true,
    default: BudgetPeriodType.MONTHLY,
  },

  // 時間範圍
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: IBudget, value: Date) {
        return value <= this.endDate
      },
      message: '開始日期不能晚於結束日期',
    },
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: IBudget, value: Date) {
        return value >= this.startDate
      },
      message: '結束日期不能早於開始日期',
    },
  },

  // 狀態和追蹤
  status: {
    type: String,
    enum: Object.values(BudgetStatus),
    default: BudgetStatus.ACTIVE,
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  currentSpentBaseCurrency: {
    type: Number,
    default: 0,
    min: 0,
  },

  // 警告設定
  warningThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100,
  },
  warningLevel: {
    type: String,
    enum: Object.values(BudgetWarningLevel),
    default: BudgetWarningLevel.SAFE,
  },

  // 統計資訊
  usagePercentage: {
    type: Number,
    default: 0,
    min: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  remainingDays: {
    type: Number,
    default: 0,
  },
  avgDailySpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  projectedTotal: {
    type: Number,
    default: 0,
    min: 0,
  },

  // 系統欄位
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  context: {
    type: String,
    enum: ['system', 'personal'],
    default: 'personal',
    required: true,
  },

  // 時間戳記
  lastCalculatedAt: {
    type: Date,
  },
}, {
  timestamps: true, // 自動建立 createdAt 和 updatedAt
  versionKey: false,
})

// 複合索引
budgetSchema.index({ userId: 1, isDeleted: 1 })
budgetSchema.index({ userId: 1, status: 1 })
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 })
budgetSchema.index({ userId: 1, categoryIds: 1 })
budgetSchema.index({ endDate: 1, status: 1 }) // 用於過期預算查詢

// 實例方法：計算預算統計
budgetSchema.methods.calculateStats = function (this: IBudget, _records: any[] = []): void {
  const now = new Date()
  const pastDays = Math.ceil((now.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24))

  // 計算剩餘天數
  this.remainingDays = Math.max(0, Math.ceil((this.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  // 計算使用率
  this.usagePercentage = this.amount > 0 ? Math.round((this.currentSpent / this.amount) * 100) : 0

  // 計算剩餘金額
  this.remainingAmount = Math.max(0, this.amount - this.currentSpent)

  // 計算平均每日支出
  this.avgDailySpent = pastDays > 0 ? this.currentSpent / pastDays : 0

  // 計算預測總支出
  if (this.remainingDays > 0 && this.avgDailySpent > 0) {
    this.projectedTotal = this.currentSpent + (this.avgDailySpent * this.remainingDays)
  }
  else {
    this.projectedTotal = this.currentSpent
  }

  // 更新警告級別
  if (this.usagePercentage >= 100) {
    this.warningLevel = BudgetWarningLevel.EXCEEDED
    this.status = BudgetStatus.EXCEEDED
  }
  else if (this.usagePercentage >= 90) {
    this.warningLevel = BudgetWarningLevel.DANGER
  }
  else if (this.usagePercentage >= this.warningThreshold) {
    this.warningLevel = BudgetWarningLevel.WARNING
  }
  else {
    this.warningLevel = BudgetWarningLevel.SAFE
  }

  // 更新狀態
  if (now > this.endDate && this.status === BudgetStatus.ACTIVE) {
    this.status = BudgetStatus.COMPLETED
  }

  this.lastCalculatedAt = now
}

// 靜態方法：查找啟用的預算
budgetSchema.statics.findActiveBudgets = function (userId: string) {
  return this.find({
    userId,
    isDeleted: false,
    status: BudgetStatus.ACTIVE,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })
}

// 靜態方法：查找特定分類的預算
budgetSchema.statics.findBudgetsByCategory = function (userId: string, categoryId: string) {
  return this.find({
    userId,
    isDeleted: false,
    status: BudgetStatus.ACTIVE,
    $or: [
      { categoryIds: { $size: 0 } }, // 全分類預算
      { categoryIds: categoryId }, // 特定分類預算
    ],
  })
}

// Pre-save 中間件：自動計算統計
budgetSchema.pre('save', function () {
  if (this.isModified('currentSpent') || this.isNew) {
    (this as any).calculateStats()
  }
})

// 匯出模型
export const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema)

// 預算工具函數
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BudgetUtils {
  /**
   * 檢查記錄是否影響預算
   */
  static isRecordAffectsBudget(budget: IBudget, categoryId: string): boolean {
    // 如果預算沒有指定分類，則影響所有分類
    if (budget.categoryIds.length === 0) {
      return true
    }

    // 檢查記錄分類是否在預算的分類列表中
    return budget.categoryIds.includes(categoryId)
  }

  /**
   * 計算預算期間的記錄總額
   */
  static calculateSpentAmount(records: any[], budget: IBudget): number {
    return records
      .filter((record) => {
        // 過濾在預算期間內的支出記錄
        const recordDate = new Date(record.date)
        return record.type === 'expense'
          && recordDate >= budget.startDate
          && recordDate <= budget.endDate
          && this.isRecordAffectsBudget(budget, record.categoryId)
      })
      .reduce((total, record) => {
        // 使用基準幣別金額或原始金額
        return total + (record.baseCurrencyAmount || record.amount)
      }, 0)
  }

  /**
   * 生成預算期間
   */
  static generateBudgetPeriod(periodType: BudgetPeriodType, referenceDate: Date = new Date()): { startDate: Date, endDate: Date } {
    const date = new Date(referenceDate)
    let startDate: Date
    let endDate: Date

    switch (periodType) {
      case BudgetPeriodType.MONTHLY:
        startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        break

      case BudgetPeriodType.QUARTERLY: {
        const quarter = Math.floor(date.getMonth() / 3)
        startDate = new Date(date.getFullYear(), quarter * 3, 1)
        endDate = new Date(date.getFullYear(), quarter * 3 + 3, 0)
        break
      }

      case BudgetPeriodType.YEARLY:
        startDate = new Date(date.getFullYear(), 0, 1)
        endDate = new Date(date.getFullYear(), 11, 31)
        break

      default:
        throw new Error(`不支援的預算週期類型: ${periodType}`)
    }

    return { startDate, endDate }
  }

  /**
   * 格式化預算期間顯示
   */
  static formatPeriodDisplay(budget: IBudget): string {
    const startDate = budget.startDate
    const endDate = budget.endDate

    switch (budget.periodType) {
      case BudgetPeriodType.MONTHLY:
        return `${startDate.getFullYear()}年${startDate.getMonth() + 1}月`

      case BudgetPeriodType.QUARTERLY: {
        const quarter = Math.floor(startDate.getMonth() / 3) + 1
        return `${startDate.getFullYear()}年第${quarter}季`
      }

      case BudgetPeriodType.YEARLY:
        return `${startDate.getFullYear()}年`

      default:
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    }
  }
}

export default Budget
