/**
 * Financial Analysis Composable
 * 處理 AI 財務分析相關功能
 */

import type { IFinancialProfile } from '~/lib/models/financial-profile'
import type { FinancialAnalysisResult } from '~/lib/models/financial-analysis'
import { authenticatedFetch } from '~/lib/utils/auth'

interface AnalysisState {
  isAnalyzing: boolean
  progress: number
  estimatedTime: number
  error: string | null
  result: FinancialAnalysisResult | null
}

export const useFinancialAnalysis = () => {
  // Reactive state
  const analysisState = ref<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    estimatedTime: 0,
    error: null,
    result: null,
  })

  /**
   * 提交財務問卷進行 AI 分析
   */
  const analyzeFinancialProfile = async (profile: IFinancialProfile): Promise<FinancialAnalysisResult | null> => {
    try {
      analysisState.value = {
        isAnalyzing: true,
        progress: 0,
        estimatedTime: 30, // 預估 30 秒
        error: null,
        result: null,
      }

      // 開始分析請求（使用認證 API）
      const response: any = await authenticatedFetch('/api/financial-profile/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'AI 分析失敗')
      }

      analysisState.value.result = response.data
      analysisState.value.isAnalyzing = false
      analysisState.value.progress = 100

      return response.data
    }
    catch (error: any) {
      analysisState.value.isAnalyzing = false
      analysisState.value.error = error.message || '分析過程中發生錯誤'
      analysisState.value.progress = 0

      console.error('財務分析失敗:', error)
      return null
    }
  }

  /**
   * 模擬分析進度更新 (用於提升用戶體驗)
   */
  const simulateAnalysisProgress = () => {
    if (!analysisState.value.isAnalyzing) return

    const progressInterval = setInterval(() => {
      if (analysisState.value.progress < 90) {
        analysisState.value.progress += Math.random() * 10
        analysisState.value.estimatedTime = Math.max(0, analysisState.value.estimatedTime - 2)
      }
      else {
        clearInterval(progressInterval)
      }
    }, 2000)

    return progressInterval
  }

  /**
   * 重置分析狀態
   */
  const resetAnalysisState = () => {
    analysisState.value = {
      isAnalyzing: false,
      progress: 0,
      estimatedTime: 0,
      error: null,
      result: null,
    }
  }

  /**
   * 獲取用戶的歷史分析記錄
   */
  const getUserAnalysisHistory = async () => {
    try {
      const response: any = await authenticatedFetch('/api/financial-profile/history')

      if (response.success) {
        return response.results
      }
      return []
    }
    catch (error) {
      console.error('獲取分析歷史失敗:', error)
      return []
    }
  }

  /**
   * 計算財務健康度分數 (客戶端即時計算)
   */
  const calculateHealthScore = (profile: IFinancialProfile): number => {
    let score = 0
    const basic = profile.basicInfo
    const risk = profile.riskAssessment

    // 收支比例 (30分)
    if (basic.monthlyIncome > 0 && basic.monthlyExpenses > 0) {
      const savingsRate = ((basic.monthlyIncome - basic.monthlyExpenses) / basic.monthlyIncome) * 100
      if (savingsRate >= 20) score += 30
      else if (savingsRate >= 10) score += 20
      else if (savingsRate >= 5) score += 10
    }

    // 負債狀況 (25分)
    if (!basic.hasDebt) {
      score += 25
    }
    else if (basic.debtAmount && basic.monthlyIncome > 0) {
      const debtRatio = (basic.debtAmount / (basic.monthlyIncome * 12)) * 100
      if (debtRatio <= 10) score += 20
      else if (debtRatio <= 30) score += 15
      else if (debtRatio <= 50) score += 10
    }

    // 緊急預備金 (20分) - 使用 currentSavings 作為緊急預備金評估
    if (basic.currentSavings && basic.monthlyExpenses > 0) {
      const emergencyMonths = basic.currentSavings / basic.monthlyExpenses
      if (emergencyMonths >= 6) score += 20
      else if (emergencyMonths >= 3) score += 15
      else if (emergencyMonths >= 1) score += 10
    }

    // 投資經驗與風險管理 (15分)
    if (risk.investmentExperience === 'advanced') score += 15
    else if (risk.investmentExperience === 'intermediate') score += 10
    else if (risk.investmentExperience === 'beginner') score += 5

    // 年齡與規劃 (10分)
    if (basic.age >= 25 && basic.age <= 35) score += 10
    else if (basic.age >= 18 && basic.age <= 45) score += 8
    else score += 5

    return Math.min(100, Math.max(0, Math.round(score)))
  }

  return {
    // State
    analysisState: readonly(analysisState),

    // Methods
    analyzeFinancialProfile,
    simulateAnalysisProgress,
    resetAnalysisState,
    getUserAnalysisHistory,
    calculateHealthScore,

    // Computed
    isAnalyzing: computed(() => analysisState.value.isAnalyzing),
    progress: computed(() => analysisState.value.progress),
    estimatedTime: computed(() => analysisState.value.estimatedTime),
    error: computed(() => analysisState.value.error),
    result: computed(() => analysisState.value.result),
  }
}
