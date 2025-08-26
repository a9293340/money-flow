/**
 * 財務規劃問卷資料模型
 * 用於收集使用者的財務狀況和偏好資料
 */

export interface BasicFinancialInfo {
  age: number
  occupation: string
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  hasDebt: boolean
  debtAmount?: number
  dependents: number
}

export interface RiskAssessment {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced'
  timeHorizon: 'short' | 'medium' | 'long' // 1-3年, 3-10年, 10年以上
  volatilityComfort: number // 1-5 scale
}

export interface FinancialGoal {
  id: string
  type: 'emergency_fund' | 'house_purchase' | 'retirement' | 'education' | 'travel' | 'other'
  name: string
  targetAmount: number
  timeframe: number // months
  priority: 'high' | 'medium' | 'low'
  currentAmount?: number
}

export interface LifestylePreferences {
  budgetingStyle: 'strict' | 'flexible' | 'casual'
  savingPreference: 'automatic' | 'manual'
  spendingPriorities: string[]
  financialConcerns: string[]
}

export interface IFinancialProfile {
  id?: string
  userId?: string
  basicInfo: BasicFinancialInfo
  riskAssessment: RiskAssessment
  goals: FinancialGoal[]
  lifestyle: LifestylePreferences
  additionalNotes?: string  // 自由文字諮詢內容，限制 100 字
  completionDate?: Date
  lastUpdated?: Date
}

// 問卷步驟定義
export interface QuestionnaireStep {
  id: number
  title: string
  description: string
  section: 'basic' | 'risk' | 'goals' | 'lifestyle'
  isCompleted: boolean
  isValid: boolean
}

// 問卷進度狀態
export interface QuestionnaireProgress {
  currentStep: number
  totalSteps: number
  completionPercentage: number
  validationErrors: string[]
}
