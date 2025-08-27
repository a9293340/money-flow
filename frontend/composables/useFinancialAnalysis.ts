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
  currentStage: string
  stages: AnalysisStage[]
}

interface AnalysisStage {
  id: string
  name: string
  description: string
  duration: number
  completed: boolean
  startedAt?: Date
  completedAt?: Date
}

export const useFinancialAnalysis = () => {
  // 分析階段定義
  const defaultStages: AnalysisStage[] = [
    {
      id: 'validation',
      name: '資料驗證',
      description: '驗證財務問卷資料...',
      duration: 2,
      completed: false,
    },
    {
      id: 'processing',
      name: '資料處理',
      description: '處理和分析您的財務情況...',
      duration: 8,
      completed: false,
    },
    {
      id: 'ai_analysis',
      name: 'AI 分析',
      description: '運用 AI 進行深度財務分析...',
      duration: 15,
      completed: false,
    },
    {
      id: 'recommendations',
      name: '生成建議',
      description: '生成個人化理財建議...',
      duration: 8,
      completed: false,
    },
    {
      id: 'finalization',
      name: '完成分析',
      description: '整理分析結果和報告...',
      duration: 3,
      completed: false,
    },
  ]

  // Reactive state
  const analysisState = ref<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    estimatedTime: 0,
    error: null,
    result: null,
    currentStage: '',
    stages: [...defaultStages],
  })

  /**
   * 提交財務問卷進行 AI 分析
   */
  const analyzeFinancialProfile = async (profile: IFinancialProfile): Promise<FinancialAnalysisResult | null> => {
    try {
      // 重設分析狀態
      resetAnalysisState()

      analysisState.value.isAnalyzing = true
      analysisState.value.estimatedTime = defaultStages.reduce((sum, stage) => sum + stage.duration, 0)

      // 開始進度模擬
      const progressInterval = simulateDetailedProgress()

      try {
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

        // 完成進度
        clearInterval(progressInterval)
        completeAllStages()

        analysisState.value.result = response.data
        analysisState.value.isAnalyzing = false
        analysisState.value.progress = 100
        analysisState.value.estimatedTime = 0

        return response.data
      }
      catch (analysisError) {
        clearInterval(progressInterval)
        throw analysisError
      }
    }
    catch (error: any) {
      analysisState.value.isAnalyzing = false
      analysisState.value.error = error.message || '分析過程中發生錯誤'
      analysisState.value.progress = 0
      analysisState.value.estimatedTime = 0
      analysisState.value.currentStage = '分析失敗'

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
   * 模擬詳細的分析進度（分階段進行）
   */
  const simulateDetailedProgress = () => {
    let currentStageIndex = 0
    let stageStartTime = Date.now()

    const updateProgress = () => {
      if (!analysisState.value.isAnalyzing || currentStageIndex >= analysisState.value.stages.length) {
        return
      }

      const currentStage = analysisState.value.stages[currentStageIndex]
      const elapsed = (Date.now() - stageStartTime) / 1000
      const stageProgress = Math.min(1, elapsed / currentStage.duration)

      // 更新當前階段狀態
      analysisState.value.currentStage = currentStage.name

      if (!currentStage.startedAt) {
        currentStage.startedAt = new Date()
      }

      // 計算總進度
      const completedStagesProgress = currentStageIndex * (100 / analysisState.value.stages.length)
      const currentStageProgress = stageProgress * (100 / analysisState.value.stages.length)
      analysisState.value.progress = Math.min(90, completedStagesProgress + currentStageProgress)

      // 更新預估時間
      const remainingStages = analysisState.value.stages.slice(currentStageIndex + 1)
      const remainingTime = remainingStages.reduce((sum, stage) => sum + stage.duration, 0)
      const currentStageRemainingTime = Math.max(0, currentStage.duration - elapsed)
      analysisState.value.estimatedTime = Math.ceil(remainingTime + currentStageRemainingTime)

      // 檢查是否完成當前階段
      if (stageProgress >= 1) {
        currentStage.completed = true
        currentStage.completedAt = new Date()
        currentStageIndex++
        stageStartTime = Date.now()
      }
    }

    const progressInterval = setInterval(updateProgress, 500)
    updateProgress() // 立即執行一次

    return progressInterval
  }

  /**
   * 完成所有階段
   */
  const completeAllStages = () => {
    analysisState.value.stages.forEach((stage) => {
      if (!stage.completed) {
        stage.completed = true
        stage.completedAt = new Date()
        if (!stage.startedAt) {
          stage.startedAt = new Date()
        }
      }
    })
    analysisState.value.currentStage = '分析完成'
  }

  /**
   * 重設分析狀態
   */
  const resetAnalysisState = () => {
    analysisState.value = {
      isAnalyzing: false,
      progress: 0,
      estimatedTime: 0,
      error: null,
      result: null,
      currentStage: '',
      stages: defaultStages.map(stage => ({
        ...stage,
        completed: false,
        startedAt: undefined,
        completedAt: undefined,
      })),
    }
  }

  /**
   * 獲取當前階段的詳細資訊
   */
  const getCurrentStageInfo = computed(() => {
    const currentStage = analysisState.value.stages.find(stage =>
      stage.name === analysisState.value.currentStage,
    )

    if (!currentStage) return null

    return {
      ...currentStage,
      progressPercentage: currentStage.completed
        ? 100
        : (currentStage.startedAt
            ? Math.min(100, ((Date.now() - currentStage.startedAt.getTime()) / 1000 / currentStage.duration) * 100)
            : 0),
    }
  })

  /**
   * 獲取已完成的階段數量
   */
  const completedStagesCount = computed(() => {
    return analysisState.value.stages.filter(stage => stage.completed).length
  })

  /**
   * 獲取總階段數量
   */
  const totalStagesCount = computed(() => {
    return analysisState.value.stages.length
  })

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

  /**
   * 載入用戶最新的分析結果
   */
  const loadLatestAnalysisResult = async () => {
    try {
      const response: any = await authenticatedFetch('/api/financial-profile/latest')

      if (response.success && response.data) {
        analysisState.value.result = response.data
        return response.data
      }
      return null
    }
    catch (error) {
      console.error('載入最新分析結果失敗:', error)
      return null
    }
  }

  return {
    // State
    analysisState: readonly(analysisState),

    // Methods
    analyzeFinancialProfile,
    simulateAnalysisProgress,
    simulateDetailedProgress,
    resetAnalysisState,
    getUserAnalysisHistory,
    calculateHealthScore,
    loadLatestAnalysisResult,
    completeAllStages,

    // Computed
    isAnalyzing: computed(() => analysisState.value.isAnalyzing),
    progress: computed(() => analysisState.value.progress),
    estimatedTime: computed(() => analysisState.value.estimatedTime),
    error: computed(() => analysisState.value.error),
    result: computed(() => analysisState.value.result),
    currentStage: computed(() => analysisState.value.currentStage),
    stages: computed(() => analysisState.value.stages),
    getCurrentStageInfo,
    completedStagesCount,
    totalStagesCount,
  }
}
