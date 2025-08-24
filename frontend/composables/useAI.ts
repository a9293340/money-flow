/**
 * AI 相關 Composables
 *
 * 提供：
 * - useAIAnalysis: AI 分析功能
 * - useFinancialHealth: 財務健康計算
 * - useAIChat: AI 對話管理
 */

import type {
  FinancialHealthDiagnosis,
  UserFinancialSummary,
} from '~/types/ai'

/**
 * AI 分析 Composable
 */
export const useAIAnalysis = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 測試 AI 連接
   */
  const testConnection = async (options: {
    includeUsage?: boolean
    includeCacheStats?: boolean
  } = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai-insights/test-connection', {
        method: 'POST',
        body: options,
      })

      return (response as any).data
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '連接測試失敗'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 獲取快速洞察
   */
  const getQuickInsight = async (options: {
    timeRange?: '1M' | '3M' | '6M' | '1Y'
    useAI?: boolean
  } = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai-insights/quick-insight', {
        method: 'POST',
        body: {
          timeRange: options.timeRange || '1M',
          useAI: options.useAI ?? true,
        },
      })

      return (response as any).data
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '快速洞察獲取失敗'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    testConnection,
    getQuickInsight,
  }
}

/**
 * 財務健康 Composable
 */
export const useFinancialHealth = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const diagnosis = ref<(FinancialHealthDiagnosis & {
    isAIGenerated: boolean
    summary: UserFinancialSummary
  }) | null>(null)

  /**
   * 執行財務健康診斷
   */
  const runDiagnosis = async (options: {
    timeRange?: '1M' | '3M' | '6M' | '1Y'
    useAI?: boolean
    includeRecommendations?: boolean
    detailLevel?: 'brief' | 'detailed' | 'comprehensive'
    language?: 'zh-TW' | 'zh-CN' | 'en'
  } = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai-insights/health-diagnosis', {
        method: 'POST',
        body: {
          timeRange: options.timeRange || '3M',
          useAI: options.useAI ?? true,
          options: {
            includeRecommendations: options.includeRecommendations ?? true,
            detailLevel: options.detailLevel || 'detailed',
            language: options.language || 'zh-TW',
          },
        },
      })

      diagnosis.value = (response as any).data
      return (response as any).data
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '財務健康診斷失敗'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 清除診斷結果
   */
  const clearDiagnosis = () => {
    diagnosis.value = null
    error.value = null
  }

  /**
   * 計算健康等級顏色
   */
  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600'
      case 'B+':
      case 'B':
        return 'text-blue-600'
      case 'C+':
      case 'C':
        return 'text-yellow-600'
      case 'D':
        return 'text-orange-600'
      case 'F':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * 格式化健康評分
   */
  const formatHealthScore = (score: number): string => {
    if (score >= 90) return '優秀'
    if (score >= 80) return '良好'
    if (score >= 70) return '一般'
    if (score >= 60) return '需改善'
    return '需關注'
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    diagnosis: readonly(diagnosis),
    runDiagnosis,
    clearDiagnosis,
    getGradeColor,
    formatHealthScore,
  }
}

/**
 * AI 對話 Composable (Phase 3 功能)
 */
export const useAIChat = () => {
  const messages = ref<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([])
  const isTyping = ref(false)
  const error = ref<string | null>(null)

  const sendMessage = async (message: string) => {
    // Phase 3 將實現 AI 對話功能
    console.log('AI 對話功能開發中...', message)

    // 暫時的模擬回應
    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    }

    messages.value.push(userMessage)

    // 模擬 AI 回應
    isTyping.value = true
    setTimeout(() => {
      const aiMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant' as const,
        content: '此功能將在 Phase 3 中實現，敬請期待！',
        timestamp: new Date(),
      }
      messages.value.push(aiMessage)
      isTyping.value = false
    }, 1000)
  }

  const clearMessages = () => {
    messages.value = []
    error.value = null
  }

  return {
    messages: readonly(messages),
    isTyping: readonly(isTyping),
    error: readonly(error),
    sendMessage,
    clearMessages,
  }
}
