/**
 * 財務分析器
 *
 * 提供：
 * - 財務健康計算邏輯
 * - 資料預處理功能
 * - 分析結果處理
 * - 本地計算備援方案
 */

import type {
  FinancialHealthMetrics,
  FinancialHealthDiagnosis,
  UserFinancialSummary,
} from '../../types/ai'

/**
 * 財務健康計算器
 */
export const FinancialHealthCalculator = {
  /**
   * 計算完整的財務健康診斷
   */
  calculateHealthDiagnosis(summary: UserFinancialSummary): FinancialHealthDiagnosis {
    const metrics = FinancialHealthCalculator.calculateMetrics(summary)
    const healthScore = FinancialHealthCalculator.calculateOverallScore(metrics)
    const grade = FinancialHealthCalculator.determineGrade(healthScore)
    const recommendations = FinancialHealthCalculator.generateRecommendations(metrics, summary)

    return {
      healthScore,
      grade,
      metrics,
      recommendations,
      analysis: FinancialHealthCalculator.generateAnalysisText(metrics, summary, healthScore),
      lastUpdated: new Date(),
    }
  },

  /**
   * 計算各項財務健康指標
   */
  calculateMetrics(summary: UserFinancialSummary): FinancialHealthMetrics {
    return {
      savingsRate: FinancialHealthCalculator.calculateSavingsRate(summary),
      expenseStability: FinancialHealthCalculator.calculateExpenseStability(summary),
      categoryBalance: FinancialHealthCalculator.calculateCategoryBalance(summary),
      trendHealth: FinancialHealthCalculator.calculateTrendHealth(summary),
      riskControl: FinancialHealthCalculator.calculateRiskControl(summary),
      emergencyFund: FinancialHealthCalculator.calculateEmergencyFund(summary),
    }
  },

  /**
   * 計算儲蓄率 (0-1)
   * 理想範圍: 20-30%
   */
  calculateSavingsRate(summary: UserFinancialSummary): number {
    const savingsAmount = summary.balance.net
    const savingsRate = savingsAmount / summary.income.total

    // 標準化到 0-1 範圍
    if (savingsRate >= 0.3) return 1.0 // 30% 以上 = 優秀
    if (savingsRate >= 0.2) return 0.8 // 20-30% = 良好
    if (savingsRate >= 0.1) return 0.6 // 10-20% = 一般
    if (savingsRate >= 0.05) return 0.4 // 5-10% = 需改善
    if (savingsRate >= 0) return 0.2 // 0-5% = 危險
    return 0.0 // 負儲蓄 = 嚴重
  },

  /**
   * 計算支出穩定性 (0-1)
   * 基於支出類別的變異係數
   */
  calculateExpenseStability(summary: UserFinancialSummary): number {
    const categoryExpenses = summary.expenses.byCategory.map(c => c.amount)

    if (categoryExpenses.length === 0) return 0.0

    const mean = categoryExpenses.reduce((sum, amount) => sum + amount, 0) / categoryExpenses.length
    const variance = categoryExpenses.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / categoryExpenses.length
    const standardDeviation = Math.sqrt(variance)
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1

    // 變異係數越小 = 穩定性越高
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation))
  },

  /**
   * 計算分類均衡性 (0-1)
   * 基於支出分類的合理性
   */
  calculateCategoryBalance(summary: UserFinancialSummary): number {
    const categories = summary.expenses.byCategory

    if (categories.length === 0) return 0.0

    // 理想分配比例 (基於 50/30/20 法則調整)
    const idealAllocations: Record<string, number> = {
      住宿: 0.30, // 住房支出
      食物: 0.15, // 飲食支出
      交通: 0.10, // 交通支出
      娛樂: 0.08, // 娛樂支出
      購物: 0.12, // 購物支出
      醫療: 0.05, // 醫療支出
      教育: 0.08, // 教育支出
      其他: 0.12, // 其他支出
    }

    let balanceScore = 0
    let totalWeight = 0

    for (const category of categories) {
      const idealPercentage = idealAllocations[category.category] || 0.1
      const actualPercentage = category.percentage / 100

      // 計算偏差度 (越小越好)
      const deviation = Math.abs(actualPercentage - idealPercentage)
      const categoryScore = Math.max(0, 1 - (deviation / idealPercentage))

      balanceScore += categoryScore * category.amount
      totalWeight += category.amount
    }

    return totalWeight > 0 ? balanceScore / totalWeight : 0
  },

  /**
   * 計算趨勢健康度 (0-1)
   * 基於收支趨勢的穩定性
   */
  calculateTrendHealth(summary: UserFinancialSummary): number {
    // 簡化版本：基於當前收支比例
    const incomeExpenseRatio = summary.expenses.total / summary.income.total

    if (incomeExpenseRatio <= 0.7) return 1.0 // 支出 ≤ 70% 收入 = 優秀
    if (incomeExpenseRatio <= 0.8) return 0.8 // 支出 70-80% 收入 = 良好
    if (incomeExpenseRatio <= 0.9) return 0.6 // 支出 80-90% 收入 = 一般
    if (incomeExpenseRatio <= 0.95) return 0.4 // 支出 90-95% 收入 = 需注意
    if (incomeExpenseRatio <= 1.0) return 0.2 // 支出 95-100% 收入 = 危險
    return 0.0 // 支出 > 100% 收入 = 嚴重
  },

  /**
   * 計算風險控制 (0-1)
   * 基於支出的可控制性
   */
  calculateRiskControl(summary: UserFinancialSummary): number {
    const categories = summary.expenses.byCategory

    // 固定支出類別 (較難控制)
    const fixedCategories = ['住宿', '保險', '貸款', '水電', '網路']
    // 變動支出類別 (較易控制)
    const variableCategories = ['娛樂', '購物', '餐飲', '旅遊']

    let fixedExpenses = 0
    let variableExpenses = 0

    for (const category of categories) {
      if (fixedCategories.some(fixed => category.category.includes(fixed))) {
        fixedExpenses += category.amount
      }
      else if (variableCategories.some(variable => category.category.includes(variable))) {
        variableExpenses += category.amount
      }
    }

    const totalExpenses = fixedExpenses + variableExpenses
    if (totalExpenses === 0) return 0.5 // 中性評分

    const variableRatio = variableExpenses / totalExpenses

    // 變動支出比例越高 = 風險控制能力越強
    return Math.min(1.0, variableRatio * 1.5)
  },

  /**
   * 計算應急準備 (0-1)
   * 基於收支結餘和穩定性
   */
  calculateEmergencyFund(summary: UserFinancialSummary): number {
    const monthlyExpenses = summary.expenses.total / FinancialHealthCalculator.getMonthCount(summary.timeRange)
    const currentBalance = summary.balance.net

    if (monthlyExpenses === 0) return 1.0

    // 計算可支撐月數
    const monthsCovered = currentBalance / monthlyExpenses

    if (monthsCovered >= 6) return 1.0 // 6個月以上 = 優秀
    if (monthsCovered >= 3) return 0.8 // 3-6個月 = 良好
    if (monthsCovered >= 1) return 0.6 // 1-3個月 = 一般
    if (monthsCovered >= 0.5) return 0.4 // 半個月-1個月 = 需改善
    if (monthsCovered > 0) return 0.2 // 少於半個月 = 危險
    return 0.0 // 無結餘 = 嚴重
  },

  /**
   * 計算總體健康評分
   */
  calculateOverallScore(metrics: FinancialHealthMetrics): number {
    // 加權平均 (總和為 1.0)
    const weights = {
      savingsRate: 0.25, // 儲蓄率最重要
      expenseStability: 0.15,
      categoryBalance: 0.15,
      trendHealth: 0.20, // 趨勢健康度很重要
      riskControl: 0.10,
      emergencyFund: 0.15, // 應急準備很重要
    }

    const weightedScore
      = metrics.savingsRate * weights.savingsRate
        + metrics.expenseStability * weights.expenseStability
        + metrics.categoryBalance * weights.categoryBalance
        + metrics.trendHealth * weights.trendHealth
        + metrics.riskControl * weights.riskControl
        + metrics.emergencyFund * weights.emergencyFund

    return Math.round(weightedScore * 100)
  },

  /**
   * 決定健康等級
   */
  determineGrade(score: number): FinancialHealthDiagnosis['grade'] {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 85) return 'B+'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C+'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  },

  /**
   * 生成改善建議
   */
  generateRecommendations(
    metrics: FinancialHealthMetrics,
    summary: UserFinancialSummary,
  ): string[] {
    const recommendations: string[] = []

    // 儲蓄率建議
    if (metrics.savingsRate < 0.2) {
      recommendations.push('建議將儲蓄率提升至收入的 20% 以上，可考慮自動轉帳設定')
    }

    // 支出穩定性建議
    if (metrics.expenseStability < 0.6) {
      recommendations.push('支出波動較大，建議建立月度預算並追蹤執行狀況')
    }

    // 分類均衡性建議
    if (metrics.categoryBalance < 0.6) {
      const topCategory = summary.expenses.byCategory[0]
      if (topCategory && topCategory.percentage > 40) {
        recommendations.push(`${topCategory.category}支出比例較高 (${topCategory.percentage.toFixed(1)}%)，建議檢視是否有節省空間`)
      }
    }

    // 趨勢健康度建議
    if (metrics.trendHealth < 0.6) {
      recommendations.push('收支比例需要改善，建議檢視非必要支出並增加收入來源')
    }

    // 應急準備建議
    if (metrics.emergencyFund < 0.6) {
      const monthlyExpense = summary.expenses.total / FinancialHealthCalculator.getMonthCount(summary.timeRange)
      const neededAmount = monthlyExpense * 3 - summary.balance.net
      if (neededAmount > 0) {
        recommendations.push(`建議建立緊急基金，還需 NT$ ${neededAmount.toLocaleString()} 以達到 3 個月支出準備`)
      }
    }

    // 風險控制建議
    if (metrics.riskControl < 0.6) {
      recommendations.push('固定支出比例偏高，建議檢視可調整的訂閱服務和合約')
    }

    return recommendations.slice(0, 5) // 最多 5 個建議
  },

  /**
   * 生成分析報告文字
   */
  generateAnalysisText(
    metrics: FinancialHealthMetrics,
    summary: UserFinancialSummary,
    score: number,
  ): string {
    const grade = FinancialHealthCalculator.determineGrade(score)
    const savingsRate = (summary.balance.net / summary.income.total * 100).toFixed(1)
    const expenseRatio = (summary.expenses.total / summary.income.total * 100).toFixed(1)

    const strengthAreas: string[] = []
    const improvementAreas: string[] = []

    // 分析各個維度
    if (metrics.savingsRate >= 0.7) strengthAreas.push('儲蓄習慣良好')
    else if (metrics.savingsRate < 0.4) improvementAreas.push('儲蓄率偏低')

    if (metrics.expenseStability >= 0.7) strengthAreas.push('支出穩定')
    else if (metrics.expenseStability < 0.5) improvementAreas.push('支出波動較大')

    if (metrics.categoryBalance >= 0.7) strengthAreas.push('支出分配均衡')
    else if (metrics.categoryBalance < 0.5) improvementAreas.push('支出分配需調整')

    if (metrics.emergencyFund >= 0.7) strengthAreas.push('應急準備充足')
    else if (metrics.emergencyFund < 0.4) improvementAreas.push('應急基金不足')

    return `您的財務健康評分為 ${score} 分 (${grade} 等級)，儲蓄率 ${savingsRate}%，支出比例 ${expenseRatio}%。

${strengthAreas.length > 0 ? `優勢項目：${strengthAreas.join('、')}。` : ''}
${improvementAreas.length > 0 ? `待改善項目：${improvementAreas.join('、')}。` : ''}

建議重點關注${improvementAreas.length > 0 ? improvementAreas[0] : '持續維持目前的理財習慣'}，以提升整體財務健康狀況。`
  },

  /**
   * 根據時間範圍取得月份數量
   */
  getMonthCount(timeRange: { start: Date, end: Date }): number {
    const diffTime = timeRange.end.getTime() - timeRange.start.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return Math.max(1, diffDays / 30) // 至少 1 個月
  },
}

/**
 * 資料預處理器
 */
export const DataPreprocessor = {
  /**
   * 將原始使用者資料轉換為分析用的摘要格式
   */
  processUserData(
    userId: string,
    records: any[],
    budgets: any[] = [],
    timeRange: { start: Date, end: Date },
  ): UserFinancialSummary {
    // 過濾時間範圍內的記錄
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= timeRange.start && recordDate <= timeRange.end
    })

    // 計算收入和支出
    const incomeRecords = filteredRecords.filter(r => r.type === 'income')
    const expenseRecords = filteredRecords.filter(r => r.type === 'expense')

    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0)
    const totalExpenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0)

    // 計算收入來源
    const incomeSources = DataPreprocessor.groupByField(incomeRecords, 'category')
      .map(group => ({
        source: group.key,
        amount: group.total,
      }))

    // 計算支出分類
    const expenseCategories = DataPreprocessor.groupByField(expenseRecords, 'category')
      .map(group => ({
        category: group.key,
        amount: group.total,
        percentage: totalExpenses > 0 ? (group.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // 計算預算執行狀況
    const budgetAnalysis = budgets.length > 0 ? DataPreprocessor.analyzeBudgetExecution(budgets, expenseCategories) : undefined

    return {
      userId,
      timeRange,
      income: {
        total: totalIncome,
        average: totalIncome / DataPreprocessor.getMonthCount(timeRange),
        sources: incomeSources,
      },
      expenses: {
        total: totalExpenses,
        average: totalExpenses / DataPreprocessor.getMonthCount(timeRange),
        byCategory: expenseCategories,
      },
      balance: {
        net: totalIncome - totalExpenses,
        trend: DataPreprocessor.determineTrend(totalIncome, totalExpenses),
      },
      budgets: budgetAnalysis,
    }
  },

  /**
   * 按欄位分組統計
   */
  groupByField(records: any[], field: string): Array<{ key: string, total: number, count: number }> {
    const groups = records.reduce((acc, record) => {
      const key = record[field] || '其他'
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 }
      }
      acc[key].total += record.amount
      acc[key].count += 1
      return acc
    }, {} as Record<string, { total: number, count: number }>)

    return Object.entries(groups).map(([key, value]) => ({
      key,
      total: (value as { total: number, count: number }).total,
      count: (value as { total: number, count: number }).count,
    }))
  },

  /**
   * 分析預算執行狀況
   */
  analyzeBudgetExecution(
    budgets: any[],
    expenseCategories: Array<{ category: string, amount: number }>,
  ): Array<{ category: string, budgeted: number, actual: number, variance: number }> {
    return budgets.map((budget) => {
      const actual = expenseCategories.find(cat => cat.category === budget.category)?.amount || 0
      const variance = ((actual - budget.amount) / budget.amount) * 100

      return {
        category: budget.category,
        budgeted: budget.amount,
        actual,
        variance,
      }
    })
  },

  /**
   * 判斷收支趨勢
   */
  determineTrend(income: number, expenses: number): 'positive' | 'negative' | 'neutral' {
    const ratio = expenses / income

    if (ratio <= 0.8) return 'positive'
    if (ratio >= 0.95) return 'negative'
    return 'neutral'
  },

  /**
   * 計算月份數量
   */
  getMonthCount(timeRange: { start: Date, end: Date }): number {
    const diffTime = timeRange.end.getTime() - timeRange.start.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return Math.max(1, diffDays / 30)
  },
}

/**
 * 分析結果處理器
 */
export const AnalysisResultProcessor = {
  /**
   * 處理 AI 回應並驗證資料格式
   */
  processAIResponse(response: string): {
    success: boolean
    data?: any
    error?: string
  } {
    try {
      // 嘗試解析 JSON
      if (response.trim().startsWith('{')) {
        const parsed = JSON.parse(response)
        return {
          success: true,
          data: AnalysisResultProcessor.validateAndSanitize(parsed),
        }
      }

      // 如果不是 JSON，回傳原始文字
      return {
        success: true,
        data: {
          analysis: response,
          recommendations: [],
          score: null,
          grade: null,
        },
      }
    }
    catch (error) {
      return {
        success: false,
        error: `AI 回應解析失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      }
    }
  },

  /**
   * 驗證和清理 AI 回應資料
   */
  validateAndSanitize(data: any): any {
    const sanitized: any = {}

    // 驗證分數
    if (typeof data.score === 'number' && data.score >= 0 && data.score <= 100) {
      sanitized.score = Math.round(data.score)
    }

    // 驗證等級
    const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    if (typeof data.grade === 'string' && validGrades.includes(data.grade)) {
      sanitized.grade = data.grade
    }

    // 驗證分析文字
    if (typeof data.analysis === 'string' && data.analysis.trim()) {
      sanitized.analysis = data.analysis.trim().slice(0, 2000) // 限制長度
    }

    // 驗證建議陣列
    if (Array.isArray(data.recommendations)) {
      sanitized.recommendations = data.recommendations
        .filter((rec: any) => typeof rec === 'string' && rec.trim())
        .map((rec: string) => rec.trim().slice(0, 200)) // 限制每個建議長度
        .slice(0, 8) // 最多 8 個建議
    }
    else {
      sanitized.recommendations = []
    }

    // 驗證指標資料
    if (data.metrics && typeof data.metrics === 'object') {
      sanitized.metrics = AnalysisResultProcessor.validateMetrics(data.metrics)
    }

    return sanitized
  },

  /**
   * 驗證指標資料
   */
  validateMetrics(metrics: any): Partial<FinancialHealthMetrics> {
    const validated: Partial<FinancialHealthMetrics> = {}
    const metricNames: (keyof FinancialHealthMetrics)[] = [
      'savingsRate', 'expenseStability', 'categoryBalance',
      'trendHealth', 'riskControl', 'emergencyFund',
    ]

    for (const name of metricNames) {
      const value = metrics[name]
      if (typeof value === 'number' && value >= 0 && value <= 1) {
        validated[name] = Math.round(value * 1000) / 1000 // 保留 3 位小數
      }
    }

    return validated
  },
}

/**
 * 財務分析工具函數
 */
export const financialAnalyzer = {
  calculateHealth: FinancialHealthCalculator.calculateHealthDiagnosis,
  processData: DataPreprocessor.processUserData,
  processAIResponse: AnalysisResultProcessor.processAIResponse,

  /**
   * 快速健康檢查 (不需要 AI)
   */
  quickHealthCheck: (summary: UserFinancialSummary) => {
    return FinancialHealthCalculator.calculateHealthDiagnosis(summary)
  },
}
