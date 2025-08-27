/**
 * 財務分析結果資料模型
 * 用於儲存 AI 分析結果和相關資料
 */

export interface FinancialAnalysisResult {
  id?: string
  userId: string
  profileId: string // 關聯到財務問卷 profile

  // AI 分析結果
  analysis: {
    summary: string // AI 分析摘要
    healthScore: number // 財務健康度分數 (0-100)
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  }

  // 個人化建議
  recommendations: Array<{
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
    actionSteps: string[]
    completed?: boolean
    completedAt?: Date
  }>

  // 風險評估
  riskAssessment: {
    overall: 'conservative' | 'moderate' | 'aggressive'
    score: number
    factors: string[]
    warnings?: string[]
  }

  // 財務規劃建議
  financialPlan: {
    shortTerm: string[] // 3-6 個月建議
    mediumTerm: string[] // 1-3 年建議
    longTerm: string[] // 3+ 年建議
  }

  // 預算建議
  budgetSuggestions: {
    monthlyBudget: number
    categories: Array<{
      name: string
      amount: number
      percentage: number
      description?: string
    }>
    savingsTarget: number
    debtPayoffPlan?: {
      monthlyPayment: number
      timeToPayoff: number
      totalInterest: number
    }
  }

  // 投資建議
  investmentAdvice: {
    riskProfile: string
    recommendedAllocation: Array<{
      type: string
      percentage: number
      reasoning: string
      examples?: string[]
    }>
    monthlyInvestmentSuggestion: number
    expectedReturns: {
      conservative: number
      moderate: number
      aggressive: number
    }
  }

  // 目標達成策略
  goalStrategies?: Array<{
    goalId: string
    goalName: string
    targetAmount: number
    timeframe: number
    monthlyRequired: number
    strategy: string
    milestones: Array<{
      month: number
      target: number
      description: string
    }>
  }>

  // API 使用資訊
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCost: number
    model: string
  }

  // 時間戳記和狀態
  createdAt: Date
  updatedAt?: Date
  expiresAt: Date // 7天後過期
  status: 'active' | 'expired' | 'archived'

  // 用戶反饋
  feedback?: {
    rating: number // 1-5 評分
    comments?: string
    helpful: boolean
    feedbackAt: Date
  }
}

// 簡化的分析結果摘要（用於列表顯示）
export interface AnalysisResultSummary {
  id: string
  createdAt: Date
  expiresAt: Date
  healthScore: number
  riskProfile: string
  status: 'active' | 'expired' | 'archived'
  hasRecommendations: boolean
  recommendationCount: number
}

// 分析請求狀態
export interface AnalysisRequestStatus {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  estimatedTime?: number // 預估剩餘時間（秒）
  error?: string
  createdAt: Date
  completedAt?: Date
}

// 用戶分析歷史
export interface UserAnalysisHistory {
  userId: string
  totalAnalyses: number
  lastAnalysisAt?: Date
  activeAnalyses: number
  expiredAnalyses: number
  averageHealthScore?: number
  improvementTrend: 'improving' | 'stable' | 'declining' | 'unknown'
}

// MongoDB Schema 類型定義
export interface IFinancialAnalysisResult extends FinancialAnalysisResult {
  _id?: string
}

// API 回應格式
export interface AnalysisAPIResponse {
  success: boolean
  data?: FinancialAnalysisResult
  error?: {
    code: string
    message: string
    details?: any
  }
  requestId: string
  timestamp: string
}

// 批量分析結果
export interface BatchAnalysisResponse {
  success: boolean
  results: AnalysisResultSummary[]
  pagination: {
    current: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
  filters?: {
    status?: string
    dateRange?: [Date, Date]
  }
}
