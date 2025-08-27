/**
 * AI 財務問卷分析 API
 *
 * 接收完整的財務問卷資料，使用 OpenAI GPT-4 進行深度分析
 * 返回個人化的財務建議和規劃
 */

import { v4 as uuidv4 } from 'uuid'
import type { IFinancialProfile } from '~/lib/models/financial-profile'
import type { FinancialAnalysisResult } from '~/lib/models/financial-analysis'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import FinancialAnalysisResultModel from '~/server/models/FinancialAnalysisResult'
import ensureUserContext from '~/server/utils/ensureUserContext'

interface AnalysisRequest {
  profile: IFinancialProfile
}

interface AnalysisResponse {
  success: boolean
  data?: {
    analysis: string
    recommendations: Array<{
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      category: string
      actionSteps: string[]
    }>
    riskAssessment: {
      overall: 'conservative' | 'moderate' | 'aggressive'
      score: number
      factors: string[]
    }
    financialPlan: {
      shortTerm: string[] // 3-6 月建議
      mediumTerm: string[] // 1-3 年建議
      longTerm: string[] // 3+ 年建議
    }
    budgetSuggestions: {
      monthlyBudget: number
      categories: Array<{
        name: string
        amount: number
        percentage: number
      }>
    }
    investmentAdvice: {
      riskProfile: string
      recommendedAllocation: Array<{
        type: string
        percentage: number
        reasoning: string
      }>
    }
    timestamp: string
  }
  error?: {
    code: string
    message: string
  }
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCost: number
  }
}

export default defineEventHandler(async (event): Promise<AnalysisResponse> => {
  try {
    // 檢查請求方法
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
    }

    // 確保用戶已認證
    console.log('🔍 檢查用戶上下文...')
    console.log('📋 Event context:', event.context)
    console.log('👤 User context:', event.context.userContext)
    
    const user = ensureUserContext(event)
    console.log('✅ 用戶認證成功:', { 
      userId: user._id ? user._id.toString() : user.id, 
      email: user.email 
    })

    // 解析請求資料
    const body = await readBody<AnalysisRequest>(event)

    if (!body.profile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing profile data',
      })
    }

    const profile = body.profile

    // 驗證問卷資料完整性
    const validationResult = validateProfile(profile)
    if (!validationResult.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: `Profile validation failed: ${validationResult.errors.join(', ')}`,
      })
    }

    // 初始化 OpenAI 客戶端
    const openaiClient = useOpenAIClient()

    // 生成分析 prompt
    const { systemPrompt, userPrompt } = generateAnalysisPrompts(profile)

    console.log('🤖 開始 AI 財務分析...')
    console.log('📝 系統提示詞:', systemPrompt)
    console.log('👤 用戶提示詞:', userPrompt)

    // 調用 OpenAI API 進行分析
    const analysisResult = await openaiClient.analyzeFinancialHealth(
      systemPrompt,
      userPrompt,
      {
        maxTokens: 2000,
        temperature: 0.7,
      },
    )

    // 詳細記錄 AI 回應
    console.log('🎯 AI 分析結果:', {
      success: analysisResult.success,
      data: analysisResult.data,
      usage: analysisResult.usage,
      error: analysisResult.error
    })

    if (!analysisResult.success) {
      console.error('❌ AI 分析失敗:', analysisResult.error)
      throw createError({
        statusCode: 500,
        statusMessage: `AI analysis failed: ${analysisResult.error?.message}`,
      })
    }

    // 記錄原始 AI 分析文本
    const rawAnalysisText = analysisResult.data?.analysis || ''
    console.log('📄 AI 原始回應文本:', rawAnalysisText)

    // 解析和結構化 AI 回應
    const structuredAnalysis = parseAIResponse(rawAnalysisText)
    
    console.log('🏗️ 結構化分析結果:', JSON.stringify(structuredAnalysis, null, 2))

    // 準備儲存到資料庫的分析結果
    const analysisRecord: Partial<FinancialAnalysisResult> = {
      userId: user._id ? user._id.toString() : user.id,
      profileId: profile.id || uuidv4(),
      analysis: {
        summary: structuredAnalysis.analysis,
        healthScore: calculateHealthScore(profile),
        riskProfile: mapRiskProfile(profile.riskAssessment.riskTolerance),
      },
      recommendations: structuredAnalysis.recommendations.map(rec => ({
        ...rec,
        id: uuidv4(),
      })),
      riskAssessment: structuredAnalysis.riskAssessment,
      financialPlan: structuredAnalysis.financialPlan,
      budgetSuggestions: generateBudgetSuggestions(profile),
      investmentAdvice: {
        riskProfile: mapRiskProfile(profile.riskAssessment.riskTolerance),
        recommendedAllocation: structuredAnalysis.investmentAdvice?.recommendedAllocation || [],
        monthlyInvestmentSuggestion: Math.round(profile.basicInfo.monthlyIncome * 0.1),
        expectedReturns: {
          conservative: 4,
          moderate: 7,
          aggressive: 10,
        },
      },
      goalStrategies: generateGoalStrategies(profile),
      usage: {
        promptTokens: analysisResult.usage!.promptTokens,
        completionTokens: analysisResult.usage!.completionTokens,
        totalTokens: analysisResult.usage!.totalTokens,
        estimatedCost: analysisResult.usage!.estimatedCost,
        model: 'gpt-3.5-turbo',
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後過期
      status: 'active',
    }

    // 儲存分析結果到資料庫
    const savedResult = await FinancialAnalysisResultModel.create(analysisRecord)

    console.log('✅ AI 財務分析完成並已儲存')
    console.log('💾 儲存的分析記錄 ID:', savedResult._id)
    console.log('⏰ 分析結果過期時間:', analysisRecord.expiresAt)

    return {
      success: true,
      data: {
        analysis: structuredAnalysis.analysis,
        recommendations: structuredAnalysis.recommendations,
        riskAssessment: structuredAnalysis.riskAssessment,
        financialPlan: structuredAnalysis.financialPlan,
        budgetSuggestions: generateBudgetSuggestions(profile),
        investmentAdvice: structuredAnalysis.investmentAdvice,
        timestamp: new Date().toISOString(),
      },
      usage: analysisResult.usage,
    }
  }
  catch (error: any) {
    console.error('❌ 財務分析 API 錯誤:', error)

    return {
      success: false,
      error: {
        code: error.statusCode ? 'VALIDATION_ERROR' : 'ANALYSIS_ERROR',
        message: error.statusMessage || error.message || '分析失敗',
      },
    }
  }
})

/**
 * 驗證問卷資料完整性
 */
function validateProfile(profile: IFinancialProfile): { isValid: boolean, errors: string[] } {
  const errors: string[] = []

  // 檢查基本資料
  if (!profile.basicInfo.age || profile.basicInfo.age < 18) {
    errors.push('年齡資料無效')
  }
  if (!profile.basicInfo.occupation?.trim()) {
    errors.push('職業資料缺失')
  }
  if (!profile.basicInfo.monthlyIncome || profile.basicInfo.monthlyIncome <= 0) {
    errors.push('月收入資料無效')
  }
  if (!profile.basicInfo.monthlyExpenses || profile.basicInfo.monthlyExpenses <= 0) {
    errors.push('月支出資料無效')
  }

  // 檢查風險評估
  if (!profile.riskAssessment.riskTolerance) {
    errors.push('風險承受度未設定')
  }
  if (!profile.riskAssessment.investmentExperience) {
    errors.push('投資經驗未設定')
  }

  // 檢查生活偏好
  if (!profile.lifestyle.budgetingStyle) {
    errors.push('預算管理風格未設定')
  }
  if (!profile.lifestyle.savingPreference) {
    errors.push('儲蓄偏好未設定')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 生成 OpenAI 分析 Prompt
 */
function generateAnalysisPrompts(profile: IFinancialProfile): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `你是一位專業的台灣財務顧問，擅長個人理財規劃和投資建議。請基於用戶提供的財務問卷資料，提供全面且實用的財務分析和建議。

分析重點：
1. 財務健康度評估
2. 風險承受能力分析
3. 個人化投資建議
4. 短中長期財務規劃
5. 預算優化建議
6. 目標達成策略

請以繁體中文回應，並提供具體可行的建議。回應格式應該結構化，包含分析、建議、和行動計劃。`

  const userPrompt = `請分析以下財務問卷資料並提供個人化建議：

## 基本資料
- 年齡：${profile.basicInfo.age} 歲
- 職業：${profile.basicInfo.occupation}
- 月收入：NT$ ${profile.basicInfo.monthlyIncome.toLocaleString()}
- 月支出：NT$ ${profile.basicInfo.monthlyExpenses.toLocaleString()}
- 目前儲蓄：NT$ ${profile.basicInfo.currentSavings.toLocaleString()}
- 負債狀況：${profile.basicInfo.hasDebt ? `有，總額 NT$ ${profile.basicInfo.debtAmount?.toLocaleString()}` : '無'}
- 扶養人數：${profile.basicInfo.dependents} 人

## 風險評估
- 風險承受度：${profile.riskAssessment.riskTolerance}
- 投資經驗：${profile.riskAssessment.investmentExperience}
- 投資時間視野：${profile.riskAssessment.timeHorizon}
- 市場波動容忍度：${profile.riskAssessment.volatilityComfort}/5

## 財務目標
${profile.goals.length > 0
    ? profile.goals.map(goal =>
        `- ${goal.name}：目標金額 NT$ ${goal.targetAmount.toLocaleString()}，預計 ${goal.timeframe} 個月達成，重要程度：${goal.priority}`,
      ).join('\n')
    : '- 尚未設定具體目標'
}

## 生活偏好
- 預算管理風格：${profile.lifestyle.budgetingStyle}
- 儲蓄偏好：${profile.lifestyle.savingPreference}
- 消費優先順序：${profile.lifestyle.spendingPriorities.join('、')}
- 主要財務擔憂：${profile.lifestyle.financialConcerns.join('、')}

${profile.additionalNotes ? `## 額外諮詢內容\n${profile.additionalNotes}` : ''}

請提供：
1. 整體財務健康度分析
2. 個人化投資建議（包含風險等級和資產配置）
3. 短期（6個月內）、中期（1-3年）、長期（3年以上）財務規劃
4. 預算優化建議
5. 目標達成策略
6. 風險控制措施

請以實用、具體、可執行的建議為主，並考慮台灣的金融環境和投資工具。`

  return { systemPrompt, userPrompt }
}

/**
 * 解析 AI 回應為結構化資料
 */
function parseAIResponse(rawResponse: string) {
  // 這裡可以實作更複雜的解析邏輯
  // 目前先提供基本結構
  return {
    analysis: rawResponse,
    recommendations: [
      {
        title: '建立緊急預備金',
        description: '優先建立 3-6 個月生活費的緊急基金',
        priority: 'high' as const,
        category: '風險管理',
        actionSteps: [
          '計算月支出總額',
          '設定專用儲蓄帳戶',
          '每月定期存入固定金額',
        ],
      },
    ],
    riskAssessment: {
      overall: 'moderate' as const,
      score: 65,
      factors: ['投資經驗適中', '風險承受度穩健', '時間視野長期'],
    },
    financialPlan: {
      shortTerm: ['建立緊急基金', '檢視保險保障'],
      mediumTerm: ['開始定期投資', '增加投資知識'],
      longTerm: ['退休規劃', '資產配置最佳化'],
    },
    investmentAdvice: {
      riskProfile: '穩健型投資者',
      recommendedAllocation: [
        {
          type: '股票型基金',
          percentage: 40,
          reasoning: '長期成長潛力',
        },
        {
          type: '債券型基金',
          percentage: 30,
          reasoning: '穩定收益來源',
        },
        {
          type: '現金及定存',
          percentage: 30,
          reasoning: '流動性需求',
        },
      ],
    },
  }
}

/**
 * 生成預算建議
 */
function generateBudgetSuggestions(profile: IFinancialProfile) {
  const income = profile.basicInfo.monthlyIncome
  const hasDebt = profile.basicInfo.hasDebt
  const debtAmount = profile.basicInfo.debtAmount || 0

  // 根據債務狀況調整預算分配
  let savingsPercentage = 20
  let fixedPercentage = 50
  let variablePercentage = 30

  if (hasDebt && debtAmount > 0) {
    savingsPercentage = 15 // 降低儲蓄，增加債務償還
    fixedPercentage = 55 // 增加固定支出（包含債務償還）
    variablePercentage = 30
  }

  return {
    monthlyBudget: income,
    categories: [
      {
        name: '固定支出',
        amount: Math.round(income * (fixedPercentage / 100)),
        percentage: fixedPercentage,
        description: hasDebt ? '包含房租、保險、債務償還等' : '包含房租、保險、基本生活費等',
      },
      {
        name: '變動支出',
        amount: Math.round(income * (variablePercentage / 100)),
        percentage: variablePercentage,
        description: '包含餐飲、娛樂、購物等彈性支出',
      },
      {
        name: '儲蓄投資',
        amount: Math.round(income * (savingsPercentage / 100)),
        percentage: savingsPercentage,
        description: '緊急基金、投資、長期儲蓄',
      },
    ],
    savingsTarget: Math.round(income * (savingsPercentage / 100)),
    debtPayoffPlan: hasDebt && debtAmount > 0 ? {
      monthlyPayment: Math.round(income * 0.15), // 建議15%收入還債
      timeToPayoff: Math.ceil(debtAmount / (income * 0.15)),
      totalInterest: Math.round(debtAmount * 0.1), // 估算利息
    } : undefined,
  }
}

/**
 * 計算財務健康度分數
 */
function calculateHealthScore(profile: IFinancialProfile): number {
  const { basicInfo } = profile
  const income = basicInfo.monthlyIncome
  const expenses = basicInfo.monthlyExpenses
  const savings = basicInfo.currentSavings
  const hasDebt = basicInfo.hasDebt
  const debtAmount = basicInfo.debtAmount || 0

  let score = 50 // 基礎分數

  // 儲蓄率評分 (30分)
  const savingsRate = (income - expenses) / income
  if (savingsRate >= 0.3) score += 30
  else if (savingsRate >= 0.2) score += 25
  else if (savingsRate >= 0.1) score += 15
  else if (savingsRate >= 0) score += 5
  else score -= 10 // 負儲蓄

  // 緊急預備金評分 (25分)
  const emergencyMonths = savings / expenses
  if (emergencyMonths >= 6) score += 25
  else if (emergencyMonths >= 3) score += 15
  else if (emergencyMonths >= 1) score += 8
  else score -= 5

  // 債務狀況評分 (25分)
  if (!hasDebt) score += 25
  else if (debtAmount > 0) {
    const debtToIncomeRatio = debtAmount / (income * 12)
    if (debtToIncomeRatio <= 0.2) score += 15
    else if (debtToIncomeRatio <= 0.4) score += 5
    else score -= 10
  }

  // 風險管控評分 (20分)
  const { riskAssessment } = profile
  if (riskAssessment.riskTolerance === 'moderate') score += 15
  else if (riskAssessment.riskTolerance === 'conservative') score += 10
  else score += 5

  if (riskAssessment.investmentExperience !== 'none') score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * 映射風險承受度
 */
function mapRiskProfile(riskTolerance: string): 'conservative' | 'moderate' | 'aggressive' {
  switch (riskTolerance) {
    case 'conservative': return 'conservative'
    case 'moderate': return 'moderate'
    case 'aggressive': return 'aggressive'
    default: return 'moderate'
  }
}

/**
 * 生成目標達成策略
 */
function generateGoalStrategies(profile: IFinancialProfile) {
  return profile.goals.map((goal) => {
    const monthlyRequired = goal.targetAmount / goal.timeframe
    const currentAmount = goal.currentAmount || 0
    const remaining = goal.targetAmount - currentAmount
    const monthlyForRemaining = remaining / goal.timeframe

    return {
      goalId: goal.id,
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      timeframe: goal.timeframe,
      monthlyRequired: Math.round(monthlyForRemaining),
      strategy: generateGoalStrategy(goal, profile.basicInfo.monthlyIncome),
      milestones: generateMilestones(goal.targetAmount, goal.timeframe, currentAmount),
    }
  })
}

/**
 * 生成單一目標策略
 */
function generateGoalStrategy(goal: any, monthlyIncome: number): string {
  const monthlyRequired = (goal.targetAmount - (goal.currentAmount || 0)) / goal.timeframe
  const percentageOfIncome = (monthlyRequired / monthlyIncome) * 100

  if (percentageOfIncome > 30) {
    return `此目標需要您月收入的 ${percentageOfIncome.toFixed(1)}%，建議延長時間或調整目標金額`
  }
  else if (percentageOfIncome > 20) {
    return `建議透過自動轉帳每月存入 ${monthlyRequired.toLocaleString()} 元，並尋找額外收入來源`
  }
  else {
    return `每月固定存入 ${monthlyRequired.toLocaleString()} 元，搭配穩健投資工具可更快達成目標`
  }
}

/**
 * 生成目標里程碑
 */
function generateMilestones(targetAmount: number, timeframe: number, currentAmount: number = 0) {
  const milestones = []
  const remaining = targetAmount - currentAmount
  const quarterlyTarget = remaining / Math.ceil(timeframe / 3)

  for (let i = 1; i <= Math.ceil(timeframe / 3); i++) {
    const month = i * 3
    if (month <= timeframe) {
      milestones.push({
        month,
        target: Math.round(currentAmount + (quarterlyTarget * i)),
        description: `第 ${i} 季度目標：累積存款達到 ${Math.round(currentAmount + (quarterlyTarget * i)).toLocaleString()} 元`,
      })
    }
  }

  return milestones
}
