/**
 * 財務分析結果 MongoDB Schema
 */

import mongoose from 'mongoose'
import type { IFinancialAnalysisResult } from '~/lib/models/financial-analysis'

const RecommendationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true,
  },
  category: { type: String, required: true },
  actionSteps: [{ type: String }],
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
})

const BudgetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  description: { type: String },
})

const InvestmentAllocationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  percentage: { type: Number, required: true },
  reasoning: { type: String, required: true },
  examples: [{ type: String }],
})

const GoalStrategySchema = new mongoose.Schema({
  goalId: { type: String, required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  timeframe: { type: Number, required: true },
  monthlyRequired: { type: Number, required: true },
  strategy: { type: String, required: true },
  milestones: [{
    month: { type: Number, required: true },
    target: { type: Number, required: true },
    description: { type: String, required: true },
  }],
})

const FinancialAnalysisResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  profileId: { type: String, required: true },

  // AI 分析結果
  analysis: {
    summary: { type: String, required: true },
    healthScore: { type: Number, required: true, min: 0, max: 100 },
    riskProfile: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      required: true,
    },
  },

  // 個人化建議
  recommendations: [RecommendationSchema],

  // 風險評估
  riskAssessment: {
    overall: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      required: true,
    },
    score: { type: Number, required: true },
    factors: [{ type: String }],
    warnings: [{ type: String }],
  },

  // 財務規劃建議
  financialPlan: {
    shortTerm: [{ type: String }],
    mediumTerm: [{ type: String }],
    longTerm: [{ type: String }],
  },

  // 預算建議
  budgetSuggestions: {
    monthlyBudget: { type: Number, required: true },
    categories: [BudgetCategorySchema],
    savingsTarget: { type: Number, required: true },
    debtPayoffPlan: {
      monthlyPayment: { type: Number },
      timeToPayoff: { type: Number },
      totalInterest: { type: Number },
    },
  },

  // 投資建議
  investmentAdvice: {
    riskProfile: { type: String, required: true },
    recommendedAllocation: [InvestmentAllocationSchema],
    monthlyInvestmentSuggestion: { type: Number, required: true },
    expectedReturns: {
      conservative: { type: Number },
      moderate: { type: Number },
      aggressive: { type: Number },
    },
  },

  // 目標達成策略
  goalStrategies: [GoalStrategySchema],

  // API 使用資訊
  usage: {
    promptTokens: { type: Number, required: true },
    completionTokens: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
    model: { type: String, required: true },
  },

  // 時間戳記和狀態
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'archived'],
    default: 'active',
    index: true,
  },

  // 用戶反饋
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String, maxlength: 500 },
    helpful: { type: Boolean },
    feedbackAt: { type: Date },
  },
}, {
  timestamps: true, // 自動管理 createdAt 和 updatedAt
  collection: 'financialanalysisresults',
})

// 複合索引
FinancialAnalysisResultSchema.index({ userId: 1, createdAt: -1 })
FinancialAnalysisResultSchema.index({ userId: 1, status: 1 })
FinancialAnalysisResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// 實例方法
FinancialAnalysisResultSchema.methods = {
  /**
   * 檢查分析結果是否已過期
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt
  },

  /**
   * 將分析結果標記為已過期
   */
  async markAsExpired(): Promise<void> {
    this.status = 'expired'
    this.updatedAt = new Date()
    await this.save()
  },

  /**
   * 添加用戶反饋
   */
  async addFeedback(rating: number, comments?: string, helpful?: boolean): Promise<void> {
    this.feedback = {
      rating,
      comments,
      helpful,
      feedbackAt: new Date(),
    }
    this.updatedAt = new Date()
    await this.save()
  },

  /**
   * 獲取簡化摘要
   */
  getSummary(): any {
    return {
      id: this._id,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      healthScore: this.analysis.healthScore,
      riskProfile: this.analysis.riskProfile,
      status: this.status,
      hasRecommendations: this.recommendations && this.recommendations.length > 0,
      recommendationCount: this.recommendations ? this.recommendations.length : 0,
    }
  },
}

// 靜態方法
FinancialAnalysisResultSchema.statics = {
  /**
   * 獲取用戶的活躍分析結果
   */
  async getUserActiveAnalyses(userId: string): Promise<IFinancialAnalysisResult[]> {
    return this.find({
      userId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .exec()
  },

  /**
   * 清理過期的分析結果
   */
  async cleanupExpiredResults(): Promise<{ deletedCount: number }> {
    const result = await this.deleteMany({
      $or: [
        { status: 'expired' },
        { expiresAt: { $lt: new Date() } },
      ],
    })

    return { deletedCount: result.deletedCount || 0 }
  },

  /**
   * 獲取用戶分析歷史統計
   */
  async getUserAnalysisStats(userId: string): Promise<any> {
    const [stats] = await this.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$userId',
          totalAnalyses: { $sum: 1 },
          activeAnalyses: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$expiresAt', new Date()] },
                ] },
                1,
                0,
              ],
            },
          },
          expiredAnalyses: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ['$status', 'expired'] },
                  { $lt: ['$expiresAt', new Date()] },
                ] },
                1,
                0,
              ],
            },
          },
          lastAnalysisAt: { $max: '$createdAt' },
          averageHealthScore: { $avg: '$analysis.healthScore' },
        },
      },
    ])

    return stats || {
      totalAnalyses: 0,
      activeAnalyses: 0,
      expiredAnalyses: 0,
      averageHealthScore: 0,
    }
  },
}

// 創建和導出模型
const FinancialAnalysisResult = mongoose.models.FinancialAnalysisResult
  || mongoose.model<IFinancialAnalysisResult>('FinancialAnalysisResult', FinancialAnalysisResultSchema)

export default FinancialAnalysisResult
