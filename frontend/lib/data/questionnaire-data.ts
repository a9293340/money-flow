/**
 * 問卷資料和驗證邏輯
 * Phase 1: 基礎問卷步驟和驗證規則
 */

import type { BasicFinancialInfo, RiskAssessment, LifestylePreferences } from '~/lib/models/financial-profile'

// 問卷步驟定義
export const questionnaireSteps = [
  {
    id: 1,
    title: '基本財務資料',
    description: '告訴我們您的基本財務狀況',
    section: 'basic' as const,
  },
  {
    id: 2,
    title: '風險偏好評估',
    description: '了解您的投資風險承受能力',
    section: 'risk' as const,
  },
  {
    id: 3,
    title: '財務目標設定',
    description: '設定您的短中長期財務目標',
    section: 'goals' as const,
  },
  {
    id: 4,
    title: '生活偏好設定',
    description: '了解您的消費和儲蓄習慣',
    section: 'lifestyle' as const,
  },
]

// 獲取步驟資料
export function getQuestionnaireStep(stepId: number) {
  return questionnaireSteps.find(step => step.id === stepId)
}

// 獲取步驟標題
export function getStepTitles() {
  return questionnaireSteps.map(step => step.title)
}

// 驗證步驟答案
export function validateStepAnswers(
  step: number,
  basicInfo: BasicFinancialInfo,
  riskAssessment: RiskAssessment,
  lifestyle: LifestylePreferences,
): string[] {
  const errors: string[] = []

  switch (step) {
    case 1:
      if (!basicInfo.age || basicInfo.age < 18) errors.push('請輸入有效年齡（18歲以上）')
      if (!basicInfo.occupation?.trim()) errors.push('請輸入職業')
      if (!basicInfo.monthlyIncome || basicInfo.monthlyIncome <= 0) errors.push('請輸入有效的月收入')
      if (!basicInfo.monthlyExpenses || basicInfo.monthlyExpenses <= 0) errors.push('請輸入有效的月支出')
      if (basicInfo.currentSavings < 0) errors.push('目前儲蓄不能為負數')
      if (basicInfo.hasDebt && (!basicInfo.debtAmount || basicInfo.debtAmount <= 0)) {
        errors.push('請輸入負債金額')
      }
      break

    case 2:
      if (!riskAssessment.riskTolerance) errors.push('請選擇風險承受度')
      if (!riskAssessment.investmentExperience) errors.push('請選擇投資經驗')
      break

    case 3:
      // Phase 1 簡化，無特殊驗證
      break

    case 4:
      if (!lifestyle.budgetingStyle) errors.push('請選擇預算管理風格')
      if (!lifestyle.savingPreference) errors.push('請選擇儲蓄偏好')
      break
  }

  return errors
}

// 計算風險承受度評分
export function calculateRiskTolerance(assessment: RiskAssessment): number {
  let score = 0

  // 風險承受度評分
  switch (assessment.riskTolerance) {
    case 'conservative': score += 1; break
    case 'moderate': score += 3; break
    case 'aggressive': score += 5; break
  }

  // 投資經驗評分
  switch (assessment.investmentExperience) {
    case 'none': score += 1; break
    case 'beginner': score += 2; break
    case 'intermediate': score += 4; break
    case 'advanced': score += 5; break
  }

  // 時間視野評分
  switch (assessment.timeHorizon) {
    case 'short': score += 1; break
    case 'medium': score += 3; break
    case 'long': score += 5; break
  }

  // 波動容忍度評分
  score += assessment.volatilityComfort

  return Math.min(Math.max(score, 1), 20) // 限制在 1-20 分範圍
}
