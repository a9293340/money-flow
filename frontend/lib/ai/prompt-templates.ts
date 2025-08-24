/**
 * AI 提示詞模板
 *
 * 提供：
 * - 財務健康診斷提示詞
 * - 預算建議提示詞
 * - 趨勢預測提示詞
 * - 動態提示詞生成
 */

import type { PromptParams } from '~/types/ai'

/**
 * 系統角色提示詞基礎模板
 */
const SYSTEM_BASE_PROMPT = `你是一位專業的個人財務分析師和理財顧問，具備以下專業能力：

1. 財務數據分析和風險評估
2. 個人化預算規劃建議
3. 投資組合評估和建議
4. 財務健康診斷
5. 趨勢分析和預測

請用專業、友善的語調提供建議，並確保建議具體可行且符合用戶的實際情況。
所有回應請使用繁體中文，金額請使用台幣 (TWD) 計算。

重要原則：
- 提供具體、可執行的建議
- 避免過於保守或激進的建議
- 考慮用戶的財務狀況和風險承受能力
- 使用易懂的語言解釋複雜概念`

/**
 * 財務健康診斷提示詞模板
 */
export function createHealthDiagnosisPrompt(params: PromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你的任務是進行完整的財務健康診斷，需要：

1. 計算財務健康評分 (0-100分)
2. 分析以下六個維度：
   - 儲蓄率 (收入中用於儲蓄的比例)
   - 支出穩定性 (月度支出的穩定程度)
   - 分類均衡性 (各支出類別的合理分配)
   - 趨勢健康度 (收支趨勢的健康程度)
   - 風險控制 (意外支出的控制能力)
   - 應急準備 (緊急資金的充足性)

3. 提供具體改善建議
4. 給出等級評定 (A+, A, B+, B, C+, C, D, F)

請以 JSON 格式回應，包含：
{
  "score": 數字,
  "grade": "等級",
  "analysis": "詳細分析報告",
  "metrics": {
    "savingsRate": 0-1,
    "expenseStability": 0-1,
    "categoryBalance": 0-1,
    "trendHealth": 0-1,
    "riskControl": 0-1,
    "emergencyFund": 0-1
  },
  "recommendations": ["建議1", "建議2", "建議3"]
}`

  const userPrompt = `請分析 ${params.userName} 的財務健康狀況：

**時間範圍**: ${params.timeRange}
**收入總額**: NT$ ${params.totalIncome.toLocaleString()}
**支出總額**: NT$ ${params.totalExpense.toLocaleString()}
**淨收支**: NT$ ${(params.totalIncome - params.totalExpense).toLocaleString()}

**支出分類分析**:
${params.categories.map(cat =>
  `- ${cat.name}: NT$ ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`,
).join('\n')}

**近期交易記錄** (最近10筆):
${params.recentTransactions.slice(0, 10).map(tx =>
  `${tx.date} | ${tx.description} | NT$ ${tx.amount.toLocaleString()} | ${tx.category}`,
).join('\n')}

${params.budgetData
  ? `
**預算執行狀況**:
- 預算總額: NT$ ${params.budgetData.totalBudget.toLocaleString()}
- 已使用: NT$ ${params.budgetData.usedBudget.toLocaleString()}
- 剩餘: NT$ ${params.budgetData.remainingBudget.toLocaleString()}
- 執行率: ${((params.budgetData.usedBudget / params.budgetData.totalBudget) * 100).toFixed(1)}%
`
  : ''}

請基於以上資料進行專業的財務健康診斷分析。`

  return { systemPrompt, userPrompt }
}

/**
 * 預算建議提示詞模板
 */
export function createBudgetRecommendationPrompt(params: PromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你的任務是提供個人化的預算規劃建議，需要：

1. 分析目前的支出模式
2. 識別過度支出的類別
3. 建議合理的預算分配
4. 提供節省開支的具體方法
5. 考慮緊急資金的建立

請以 JSON 格式回應：
{
  "summary": "整體預算建議摘要",
  "recommendations": [
    {
      "category": "類別名稱",
      "currentAmount": 目前金額,
      "suggestedAmount": 建議金額,
      "reason": "調整理由",
      "priority": "high|medium|low"
    }
  ],
  "savingsGoal": {
    "amount": 建議儲蓄金額,
    "percentage": 儲蓄率,
    "strategy": "儲蓄策略"
  },
  "actionItems": ["具體行動項目1", "具體行動項目2"]
}`

  const userPrompt = `請為 ${params.userName} 制定個人化預算建議：

**時間範圍**: ${params.timeRange}
**月平均收入**: NT$ ${(params.totalIncome / (params.timeRange === '1Y' ? 12 : params.timeRange === '6M' ? 6 : params.timeRange === '3M' ? 3 : 1)).toLocaleString()}
**月平均支出**: NT$ ${(params.totalExpense / (params.timeRange === '1Y' ? 12 : params.timeRange === '6M' ? 6 : params.timeRange === '3M' ? 3 : 1)).toLocaleString()}

**目前支出分佈**:
${params.categories.map(cat =>
  `- ${cat.name}: NT$ ${(cat.amount / (params.timeRange === '1Y' ? 12 : params.timeRange === '6M' ? 6 : params.timeRange === '3M' ? 3 : 1)).toLocaleString()}/月 (${cat.percentage.toFixed(1)}%)`,
).join('\n')}

${params.budgetData
  ? `
**目前預算設定**:
- 月預算: NT$ ${(params.budgetData.totalBudget / (params.timeRange === '1Y' ? 12 : 1)).toLocaleString()}
- 執行率: ${((params.budgetData.usedBudget / params.budgetData.totalBudget) * 100).toFixed(1)}%
`
  : ''}

請基於 50/30/20 法則和台灣消費習慣，提供合理的預算分配建議。`

  return { systemPrompt, userPrompt }
}

/**
 * 趨勢預測提示詞模板
 */
export function createTrendPredictionPrompt(params: PromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你的任務是分析財務趨勢並提供預測，需要：

1. 分析歷史消費趨勢
2. 識別季節性模式
3. 預測未來 3-6 個月的財務狀況
4. 提出趨勢應對策略
5. 警示潛在風險

請以 JSON 格式回應：
{
  "summary": "趨勢分析總結",
  "predictions": [
    {
      "category": "分類名稱",
      "currentTrend": "increasing|decreasing|stable",
      "predictedChange": 預測變化百分比,
      "confidence": 0-1信心度,
      "timeframe": "預測時間框架",
      "factors": ["影響因素1", "影響因素2"]
    }
  ],
  "alerts": [
    {
      "type": "warning|info|critical",
      "message": "警示訊息",
      "recommendation": "應對建議"
    }
  ],
  "opportunities": ["機會點1", "機會點2"]
}`

  const userPrompt = `請分析 ${params.userName} 的財務趨勢並預測未來走向：

**分析期間**: ${params.timeRange}
**總收入**: NT$ ${params.totalIncome.toLocaleString()}
**總支出**: NT$ ${params.totalExpense.toLocaleString()}
**收支比**: ${((params.totalIncome - params.totalExpense) / params.totalIncome * 100).toFixed(1)}%

**支出趨勢分析**:
${params.categories.map(cat =>
  `- ${cat.name}: NT$ ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`,
).join('\n')}

**近期消費模式**:
${params.recentTransactions.slice(0, 15).map(tx =>
  `${tx.date} | ${tx.category} | NT$ ${tx.amount.toLocaleString()}`,
).join('\n')}

請基於以上資料分析趨勢，並預測未來 3-6 個月的財務狀況。`

  return { systemPrompt, userPrompt }
}

/**
 * AI 對話諮詢提示詞模板
 */
export function createChatConsultationPrompt(
  userQuestion: string,
  userContext: Partial<PromptParams>,
): {
    systemPrompt: string
    userPrompt: string
  } {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你現在作為用戶的個人財務顧問，回答他們的理財相關問題。

回應原則：
1. 提供專業且實用的建議
2. 根據用戶的財務背景調整建議內容
3. 使用簡單易懂的語言
4. 提供具體的執行步驟
5. 適時提醒風險和注意事項

回應格式：
- 直接回答問題
- 提供3-5點具體建議
- 如需要，說明相關風險
- 建議後續行動`

  const contextInfo = userContext.totalIncome && userContext.totalExpense
    ? `

**用戶財務背景**:
- 月收入: NT$ ${((userContext.totalIncome || 0) / (userContext.timeRange === '1Y' ? 12 : 1)).toLocaleString()}
- 月支出: NT$ ${((userContext.totalExpense || 0) / (userContext.timeRange === '1Y' ? 12 : 1)).toLocaleString()}
- 主要支出類別: ${userContext.categories?.slice(0, 3).map(c => c.name).join(', ') || '未知'}`
    : ''

  const userPrompt = `用戶問題: ${userQuestion}${contextInfo}

請提供專業的理財建議。`

  return { systemPrompt, userPrompt }
}

/**
 * 投資建議提示詞模板
 */
export function createInvestmentAdvicePrompt(params: PromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你的任務是提供個人化投資建議，需要：

1. 評估用戶的投資能力
2. 分析風險承受度
3. 建議適合的投資工具
4. 提供投資組合配置
5. 說明投資風險和注意事項

請以 JSON 格式回應：
{
  "riskProfile": "conservative|moderate|aggressive",
  "investmentCapacity": {
    "monthlyInvestable": 可投資金額,
    "emergencyFundStatus": "adequate|needs_improvement|critical"
  },
  "recommendations": [
    {
      "type": "投資類型",
      "allocation": 建議比例,
      "reason": "推薦理由",
      "riskLevel": "low|medium|high",
      "expectedReturn": "預期報酬率範圍"
    }
  ],
  "warnings": ["風險提醒1", "風險提醒2"],
  "nextSteps": ["下一步行動1", "下一步行動2"]
}`

  const savingsRate = (params.totalIncome - params.totalExpense) / params.totalIncome

  const userPrompt = `請為 ${params.userName} 提供投資理財建議：

**財務基本狀況**:
- 收入: NT$ ${params.totalIncome.toLocaleString()} (${params.timeRange})
- 支出: NT$ ${params.totalExpense.toLocaleString()}
- 儲蓄率: ${(savingsRate * 100).toFixed(1)}%
- 可投資金額: NT$ ${(params.totalIncome - params.totalExpense).toLocaleString()}

**支出結構**:
${params.categories.map(cat =>
  `- ${cat.name}: ${cat.percentage.toFixed(1)}%`,
).join('\n')}

**近期消費模式**:
${params.recentTransactions.slice(0, 8).map(tx =>
  `${tx.date} | ${tx.category} | NT$ ${tx.amount.toLocaleString()}`,
).join('\n')}

請基於台灣的投資環境和金融商品，提供適合的投資建議。`

  return { systemPrompt, userPrompt }
}

/**
 * 快速洞察提示詞模板 (簡化版分析)
 */
export function createQuickInsightPrompt(params: PromptParams): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

請提供簡潔的財務洞察分析，包含：
1. 3個關鍵發現
2. 2-3個立即可行的建議
3. 1個需要關注的風險點

回應應該簡潔明瞭，每個要點不超過一句話。`

  const netBalance = params.totalIncome - params.totalExpense

  const userPrompt = `分析 ${params.userName} 的 ${params.timeRange} 財務狀況：

收支概況: 收入 NT$ ${params.totalIncome.toLocaleString()} | 支出 NT$ ${params.totalExpense.toLocaleString()} | 結餘 NT$ ${netBalance.toLocaleString()}

主要支出: ${params.categories.slice(0, 5).map(cat =>
  `${cat.name} ${cat.percentage.toFixed(0)}%`,
).join(', ')}

請提供快速洞察分析。`

  return { systemPrompt, userPrompt }
}

/**
 * 支出異常檢測提示詞模板
 */
export function createAnomalyDetectionPrompt(
  params: PromptParams,
  suspiciousTransactions: Array<{
    transaction: any
    anomalyType: 'amount' | 'frequency' | 'category' | 'timing'
    severity: 'low' | 'medium' | 'high'
  }>,
): {
    systemPrompt: string
    userPrompt: string
  } {
  const systemPrompt = `${SYSTEM_BASE_PROMPT}

你的任務是分析潛在的支出異常，需要：

1. 評估異常交易的合理性
2. 識別可能的問題模式
3. 提供改善建議
4. 評估對整體財務的影響

請以自然語言回應，包含：
- 異常分析總結
- 每個異常交易的評估
- 改善建議
- 預防措施`

  const userPrompt = `檢測到 ${params.userName} 可能的支出異常：

**檢測期間**: ${params.timeRange}
**異常交易數量**: ${suspiciousTransactions.length}

**異常交易詳情**:
${suspiciousTransactions.map((item, index) =>
  `${index + 1}. ${item.transaction.date} | ${item.transaction.description} | NT$ ${item.transaction.amount.toLocaleString()} 
     異常類型: ${item.anomalyType} | 嚴重程度: ${item.severity}`,
).join('\n\n')}

**正常支出模式參考**:
${params.categories.map(cat =>
  `- ${cat.name}: 平均 NT$ ${cat.amount.toLocaleString()}`,
).join('\n')}

請分析這些異常並提供建議。`

  return { systemPrompt, userPrompt }
}

/**
 * 動態提示詞生成器
 */
export class PromptBuilder {
  private systemPrompt: string = SYSTEM_BASE_PROMPT
  private userPrompt: string = ''
  private constraints: string[] = []
  private requirements: string[] = []

  /**
   * 設定特定的系統角色
   */
  setSystemRole(role: string): this {
    this.systemPrompt = `${SYSTEM_BASE_PROMPT}\n\n特殊角色: ${role}`
    return this
  }

  /**
   * 添加約束條件
   */
  addConstraint(constraint: string): this {
    this.constraints.push(constraint)
    return this
  }

  /**
   * 添加需求
   */
  addRequirement(requirement: string): this {
    this.requirements.push(requirement)
    return this
  }

  /**
   * 設定用戶提示詞
   */
  setUserPrompt(prompt: string): this {
    this.userPrompt = prompt
    return this
  }

  /**
   * 建構最終提示詞
   */
  build(): { systemPrompt: string, userPrompt: string } {
    let finalSystemPrompt = this.systemPrompt

    if (this.requirements.length > 0) {
      finalSystemPrompt += '\n\n需求:\n' + this.requirements.map(r => `- ${r}`).join('\n')
    }

    if (this.constraints.length > 0) {
      finalSystemPrompt += '\n\n限制條件:\n' + this.constraints.map(c => `- ${c}`).join('\n')
    }

    return {
      systemPrompt: finalSystemPrompt,
      userPrompt: this.userPrompt,
    }
  }

  /**
   * 重置建構器
   */
  reset(): this {
    this.systemPrompt = SYSTEM_BASE_PROMPT
    this.userPrompt = ''
    this.constraints = []
    this.requirements = []
    return this
  }
}

/**
 * 建立提示詞建構器實例
 */
export function createPromptBuilder(): PromptBuilder {
  return new PromptBuilder()
}

/**
 * 常用提示詞快捷方法
 */
export const promptTemplates = {
  healthDiagnosis: createHealthDiagnosisPrompt,
  budgetRecommendation: createBudgetRecommendationPrompt,
  trendPrediction: createTrendPredictionPrompt,
  chatConsultation: createChatConsultationPrompt,
  investmentAdvice: createInvestmentAdvicePrompt,
  quickInsight: createQuickInsightPrompt,
  anomalyDetection: createAnomalyDetectionPrompt,
  builder: createPromptBuilder,
}

/**
 * 提示詞工具函數
 */
export const promptUtils = {
  /**
   * 格式化金額顯示
   */
  formatCurrency: (amount: number): string => {
    return `NT$ ${amount.toLocaleString()}`
  },

  /**
   * 格式化百分比
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`
  },

  /**
   * 格式化時間範圍描述
   */
  formatTimeRange: (timeRange: string): string => {
    const ranges = {
      '1M': '近 1 個月',
      '3M': '近 3 個月',
      '6M': '近 6 個月',
      '1Y': '近 1 年',
    }
    return ranges[timeRange as keyof typeof ranges] || timeRange
  },

  /**
   * 截斷長文字
   */
  truncateText: (text: string, maxLength: number = 100): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  },
}
