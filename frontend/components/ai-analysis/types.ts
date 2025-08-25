/**
 * AI 分析組件統一導出
 *
 * 組件列表：
 * - AIOverviewDashboard: 概覽儀表板
 * - FinancialHealthCard: 財務健康診斷卡
 * - BudgetRecommendation: 智能預算建議
 * - TrendPrediction: 趨勢預測
 * - AIChatInterface: AI 對話界面
 * - LoadingStates: 載入狀態組件
 */

// Phase 1.6 將實現這些組件
// export { default as AIOverviewDashboard } from './AIOverviewDashboard.vue'
// export { default as FinancialHealthCard } from './FinancialHealthCard.vue'
// export { default as LoadingStates } from './LoadingStates.vue'

// 組件 props 類型定義
export interface HealthCardProps {
  healthScore: number
  metrics: FinancialHealthMetrics
  recommendations: string[]
  isLoading: boolean
}

export interface FinancialHealthMetrics {
  savingsRate: number // 儲蓄率 (0-1)
  expenseStability: number // 支出穩定性 (0-1)
  categoryBalance: number // 分類均衡性 (0-1)
  trendHealth: number // 趨勢健康度 (0-1)
  riskControl: number // 風險控制 (0-1)
  emergencyFund: number // 應急準備 (0-1)
}
