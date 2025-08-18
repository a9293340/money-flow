/**
 * 預算限制配置
 * 集中管理各種預算相關的限制設定
 */

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium', 
  VIP = 'vip'
}

export interface BudgetLimits {
  maxBudgetsPerPeriod: Record<UserTier, number>
  maxRecurringBudgets: Record<UserTier, number>
  features: Record<UserTier, string[]>
}

/**
 * 預算限制設定
 * -1 表示無限制
 */
export const BUDGET_LIMITS: BudgetLimits = {
  // 每期間最大預算數量
  maxBudgetsPerPeriod: {
    [UserTier.FREE]: 5,      // 免費用戶：5個
    [UserTier.PREMIUM]: 15,  // 付費用戶：15個  
    [UserTier.VIP]: -1       // VIP用戶：無限制
  },
  
  // 最大重複預算模板數量
  maxRecurringBudgets: {
    [UserTier.FREE]: 3,      // 免費用戶：3個重複模板
    [UserTier.PREMIUM]: 10,  // 付費用戶：10個重複模板
    [UserTier.VIP]: -1       // VIP用戶：無限制
  },

  // 各等級可使用的功能
  features: {
    [UserTier.FREE]: [
      'basic_budgets',
      'expense_tracking',
      'simple_reports'
    ],
    [UserTier.PREMIUM]: [
      'basic_budgets',
      'expense_tracking', 
      'simple_reports',
      'recurring_budgets',
      'advanced_reports',
      'budget_alerts',
      'export_data'
    ],
    [UserTier.VIP]: [
      'basic_budgets',
      'expense_tracking',
      'simple_reports', 
      'recurring_budgets',
      'advanced_reports',
      'budget_alerts',
      'export_data',
      'ai_insights',
      'api_access',
      'priority_support'
    ]
  }
}

/**
 * 獲取用戶的預算限制
 */
export function getBudgetLimitsForUser(userTier: UserTier = UserTier.FREE) {
  return {
    maxBudgetsPerPeriod: BUDGET_LIMITS.maxBudgetsPerPeriod[userTier],
    maxRecurringBudgets: BUDGET_LIMITS.maxRecurringBudgets[userTier],
    features: BUDGET_LIMITS.features[userTier]
  }
}

/**
 * 檢查用戶是否有特定功能權限
 */
export function hasFeature(userTier: UserTier, feature: string): boolean {
  return BUDGET_LIMITS.features[userTier].includes(feature)
}

/**
 * 獲取升級後的優勢說明
 */
export function getUpgradeBenefits(currentTier: UserTier) {
  const upgradeTier = currentTier === UserTier.FREE ? UserTier.PREMIUM : UserTier.VIP
  const current = getBudgetLimitsForUser(currentTier)
  const upgrade = getBudgetLimitsForUser(upgradeTier)
  
  return {
    currentTier,
    upgradeTier,
    benefits: {
      budgets: {
        current: current.maxBudgetsPerPeriod,
        upgrade: upgrade.maxBudgetsPerPeriod === -1 ? '無限制' : upgrade.maxBudgetsPerPeriod
      },
      recurringBudgets: {
        current: current.maxRecurringBudgets,
        upgrade: upgrade.maxRecurringBudgets === -1 ? '無限制' : upgrade.maxRecurringBudgets
      },
      newFeatures: upgrade.features.filter(f => !current.features.includes(f))
    }
  }
}