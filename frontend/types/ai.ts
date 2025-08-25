/**
 * AI 分析功能相關類型定義
 *
 * 包含：
 * - 財務健康診斷類型
 * - AI 分析服務類型
 * - API 回應格式類型
 * - 組件 Props 類型
 */

// =========================
// 財務健康診斷相關類型
// =========================

/**
 * 財務健康指標
 */
export interface FinancialHealthMetrics {
  savingsRate: number // 儲蓄率 (0-1)
  expenseStability: number // 支出穩定性 (0-1)
  categoryBalance: number // 分類均衡性 (0-1)
  trendHealth: number // 趨勢健康度 (0-1)
  riskControl: number // 風險控制 (0-1)
  emergencyFund: number // 應急準備 (0-1)
}

/**
 * 財務健康診斷結果
 */
export interface FinancialHealthDiagnosis {
  healthScore: number // 總分 (0-100)
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' // 等級
  metrics: FinancialHealthMetrics // 各項指標
  recommendations: string[] // AI 建議
  analysis: string // AI 分析報告
  lastUpdated: Date // 最後更新時間
}

// =========================
// AI 服務相關類型
// =========================

/**
 * OpenAI API 配置
 */
export interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  timeout: number
}

/**
 * AI 提示詞模板參數
 */
export interface PromptParams {
  userName: string
  timeRange: string
  totalIncome: number
  totalExpense: number
  categories: Array<{
    name: string
    amount: number
    percentage: number
  }>
  recentTransactions: Array<{
    date: string
    description: string
    amount: number
    category: string
  }>
  budgetData?: {
    totalBudget: number
    usedBudget: number
    remainingBudget: number
  }
}

/**
 * AI 分析請求
 */
export interface AIAnalysisRequest {
  type: 'health_diagnosis' | 'budget_recommendation' | 'trend_prediction' | 'investment_advice'
  userId: string
  timeRange: '1M' | '3M' | '6M' | '1Y'
  data: PromptParams
  options?: {
    includeRecommendations?: boolean
    detailLevel?: 'brief' | 'detailed' | 'comprehensive'
    language?: 'zh-TW' | 'zh-CN' | 'en'
  }
}

/**
 * AI 分析回應
 */
export interface AIAnalysisResponse {
  success: boolean
  data?: {
    analysis: string
    recommendations: string[]
    score?: number
    grade?: string
    metrics?: Partial<FinancialHealthMetrics>
    timestamp: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCost: number
  }
}

// =========================
// 快取相關類型
// =========================

/**
 * AI 分析快取項目
 */
export interface CacheItem {
  key: string
  data: AIAnalysisResponse
  timestamp: Date
  expiresAt: Date
  userId: string
  analysisType: string
}

/**
 * 快取配置
 */
export interface CacheConfig {
  ttl: number // 存活時間 (毫秒)
  maxSize: number // 最大快取數量
  cleanupInterval: number // 清理間隔 (毫秒)
}

// =========================
// 使用者介面相關類型
// =========================

/**
 * 載入狀態
 */
export interface LoadingState {
  isLoading: boolean
  progress?: number // 0-100
  message?: string
  stage?: 'preparing' | 'analyzing' | 'generating' | 'completed'
}

/**
 * 錯誤狀態
 */
export interface ErrorState {
  hasError: boolean
  errorCode?: string
  errorMessage?: string
  canRetry?: boolean
  retryCount?: number
}

/**
 * AI 分析組件通用 Props
 */
export interface BaseAIComponentProps {
  loading?: LoadingState
  error?: ErrorState
  refreshData?: () => void
  className?: string
}

/**
 * 財務健康卡片 Props
 */
export interface HealthCardProps extends BaseAIComponentProps {
  diagnosis?: FinancialHealthDiagnosis
  showDetails?: boolean
  compact?: boolean
}

/**
 * 預算建議卡片 Props
 */
export interface BudgetRecommendationProps extends BaseAIComponentProps {
  recommendations: Array<{
    category: string
    currentAmount: number
    suggestedAmount: number
    reason: string
    priority: 'high' | 'medium' | 'low'
  }>
  totalBudget: number
}

/**
 * 趨勢預測卡片 Props
 */
export interface TrendPredictionProps extends BaseAIComponentProps {
  predictions: Array<{
    category: string
    currentTrend: 'increasing' | 'decreasing' | 'stable'
    predictedChange: number // 百分比變化
    confidence: number // 信心度 (0-1)
    timeframe: string
  }>
}

// =========================
// Phase 2: 智能建議相關類型
// =========================

/**
 * 預算建議請求參數
 */
export interface BudgetRecommendationRequest {
  analysisRange?: string // '1M' | '3M' | '6M' | '1Y'
  budgetGoal?: string // 'optimize' | 'save' | 'reduce' | 'balance'
  focusAreas?: string[] // ['housing', 'food', 'transportation', 'entertainment']
  currentBudgetId?: string
}

/**
 * 用戶財務數據
 */
export interface UserFinancialData {
  userId: string
  analysisRange: string
  dateRange: {
    startDate: Date
    endDate: Date
  }
  records: any[]
  categories: any[]
  budgets: any[]
  summary: {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    savingsRate: number
    recordCount: number
    expensesByCategory: Array<{
      categoryId: string
      categoryName: string
      totalAmount: number
      recordCount: number
      averageAmount: number
    }>
  }
}

/**
 * 預算建議結果
 */
export interface BudgetRecommendation {
  recommendedBudget: {
    totalBudget: number
    categories: Array<{
      name: string
      amount: number
      percentage: number
    }>
  }
  recommendations: string[] // 具體建議
  insights: string[] // 洞察分析
  improvements: string[] // 改善空間
  riskWarnings: string[] // 風險警告
  nextSteps: string[] // 後續步驟
  confidence: number // 信心度 (0-1)
  methodology: string // 分析方法說明
  generatedAt: string
  analysisParams: {
    budgetGoal: string
    focusAreas: string[]
    analysisRange: string
    dataPoints: number
  }
}

/**
 * 趨勢預測請求參數
 */
export interface TrendPredictionRequest {
  analysisRange?: string
  predictionPeriod?: string // '1M' | '3M' | '6M'
  focusMetrics?: string[] // ['income', 'expenses', 'savings', 'categories']
}

/**
 * 趨勢預測結果
 */
export interface TrendPrediction {
  predictions: {
    income: {
      predicted: number
      confidence: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }
    expenses: {
      predicted: number
      confidence: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }
    savings: {
      predicted: number
      confidence: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }
  }
  trends: Array<{
    metric: string
    direction: 'up' | 'down' | 'stable'
    strength: number // 趨勢強度 (0-1)
    description: string
  }>
  opportunities: string[] // 機會點
  risks: string[] // 風險點
  recommendations: string[] // 建議
  confidence: number // 整體信心度
  methodology: string
  generatedAt: string
  analysisParams: {
    predictionPeriod: string
    focusMetrics: string[]
    analysisRange: string
  }
}

// =========================
// API 端點相關類型
// =========================

/**
 * AI 分析 API 端點回應格式
 */
export interface AIEndpointResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    stack?: string
  }
  timestamp: string
  requestId: string
  cached?: boolean
  nextAvailable?: string
}

/**
 * 財務健康診斷 API 回應
 */
export type HealthDiagnosisResponse = AIEndpointResponse<FinancialHealthDiagnosis>

/**
 * 預算建議 API 回應
 */
export interface BudgetRecommendationResponse {
  success: boolean
  data: BudgetRecommendation
  cached: boolean
  message: string
}

/**
 * 趨勢預測 API 回應
 */
export interface TrendPredictionResponse {
  success: boolean
  data: TrendPrediction
  cached: boolean
  message: string
}

// =========================
// 資料處理相關類型
// =========================

/**
 * 使用者財務資料摘要
 */
export interface UserFinancialSummary {
  userId: string
  timeRange: {
    start: Date
    end: Date
  }
  income: {
    total: number
    average: number
    sources: Array<{ source: string, amount: number }>
  }
  expenses: {
    total: number
    average: number
    byCategory: Array<{ category: string, amount: number, percentage: number }>
  }
  balance: {
    net: number
    trend: 'positive' | 'negative' | 'neutral'
  }
  budgets?: Array<{
    category: string
    budgeted: number
    actual: number
    variance: number
  }>
}

/**
 * AI 分析上下文
 */
export interface AnalysisContext {
  userSummary: UserFinancialSummary
  historicalData?: any[]
  userPreferences?: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    financialGoals: string[]
    priorityCategories: string[]
  }
  externalFactors?: {
    economicIndicators?: any
    marketConditions?: any
  }
}

// =========================
// 實用工具類型
// =========================

/**
 * 可選的基礎屬性
 */
export type OptionalBaseProps<T> = T & {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * API 狀態聯合類型
 */
export type APIStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 通用 API 回應包裝器
 */
export type APIResponse<T> = Promise<AIEndpointResponse<T>>
