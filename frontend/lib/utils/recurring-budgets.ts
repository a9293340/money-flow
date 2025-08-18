/**
 * 重複預算工具函數
 * 處理期間計算、模板生成等核心邏輯
 */

export type TemplateFrequency = 'monthly' | 'quarterly' | 'yearly'

/**
 * 獲取當前期間標識
 */
export function getCurrentPeriod(frequency: TemplateFrequency, date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  
  switch(frequency) {
    case 'monthly':
      return `${year}-${String(month + 1).padStart(2, '0')}`
    case 'quarterly':
      return `${year}-Q${Math.floor(month / 3) + 1}`
    case 'yearly':
      return `${year}`
    default:
      throw new Error(`不支援的頻率: ${frequency}`)
  }
}

/**
 * 計算期間日期範圍
 */
export function calculatePeriodDates(frequency: TemplateFrequency, period: string): {
  startDate: Date
  endDate: Date
} {
  if (frequency === 'monthly') {
    // 期間格式: "2025-01"
    const [yearStr, monthStr] = period.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1 // Date 的月份從 0 開始
    
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0) // 下個月的第0天 = 這個月的最後一天
    
    return { startDate, endDate }
  }
  
  if (frequency === 'quarterly') {
    // 期間格式: "2025-Q1"
    const [yearStr, quarterStr] = period.split('-Q')
    const year = parseInt(yearStr)
    const quarter = parseInt(quarterStr) // 1-4
    
    const startMonth = (quarter - 1) * 3
    const endMonth = startMonth + 2
    
    const startDate = new Date(year, startMonth, 1)
    const endDate = new Date(year, endMonth + 1, 0) // 該季最後一個月的最後一天
    
    return { startDate, endDate }
  }
  
  if (frequency === 'yearly') {
    // 期間格式: "2025"
    const year = parseInt(period)
    
    const startDate = new Date(year, 0, 1)  // 1月1日
    const endDate = new Date(year, 11, 31)  // 12月31日
    
    return { startDate, endDate }
  }
  
  throw new Error(`不支援的頻率: ${frequency}`)
}

/**
 * 計算下一個期間
 */
export function getNextPeriod(frequency: TemplateFrequency, currentPeriod: string): string {
  if (frequency === 'monthly') {
    const [yearStr, monthStr] = currentPeriod.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr)
    
    if (month === 12) {
      return `${year + 1}-01`
    } else {
      return `${year}-${String(month + 1).padStart(2, '0')}`
    }
  }
  
  if (frequency === 'quarterly') {
    const [yearStr, quarterStr] = currentPeriod.split('-Q')
    const year = parseInt(yearStr)
    const quarter = parseInt(quarterStr)
    
    if (quarter === 4) {
      return `${year + 1}-Q1`
    } else {
      return `${year}-Q${quarter + 1}`
    }
  }
  
  if (frequency === 'yearly') {
    const year = parseInt(currentPeriod)
    return `${year + 1}`
  }
  
  throw new Error(`不支援的頻率: ${frequency}`)
}

/**
 * 格式化期間顯示文字
 */
export function formatPeriodDisplay(frequency: TemplateFrequency, period: string): string {
  if (frequency === 'monthly') {
    const [yearStr, monthStr] = period.split('-')
    return `${yearStr}年${monthStr}月`
  }
  
  if (frequency === 'quarterly') {
    const [yearStr, quarterStr] = period.split('-Q')
    const quarterMap = { '1': '第一季', '2': '第二季', '3': '第三季', '4': '第四季' }
    return `${yearStr}年${quarterMap[quarterStr as keyof typeof quarterMap]}`
  }
  
  if (frequency === 'yearly') {
    return `${period}年`
  }
  
  return period
}

/**
 * 格式化頻率顯示文字
 */
export function formatFrequencyDisplay(frequency: TemplateFrequency): string {
  const map = {
    monthly: '每月',
    quarterly: '每季', 
    yearly: '每年'
  }
  return map[frequency]
}

/**
 * 驗證期間格式是否正確
 */
export function isValidPeriodFormat(frequency: TemplateFrequency, period: string): boolean {
  try {
    if (frequency === 'monthly') {
      return /^\d{4}-\d{2}$/.test(period)
    }
    if (frequency === 'quarterly') {
      return /^\d{4}-Q[1-4]$/.test(period)
    }
    if (frequency === 'yearly') {
      return /^\d{4}$/.test(period)
    }
    return false
  } catch {
    return false
  }
}

/**
 * 生成期間列表（用於預覽）
 */
export function generatePeriodList(
  frequency: TemplateFrequency, 
  startPeriod: string, 
  count: number = 12
): string[] {
  const periods: string[] = []
  let currentPeriod = startPeriod
  
  for (let i = 0; i < count; i++) {
    periods.push(currentPeriod)
    currentPeriod = getNextPeriod(frequency, currentPeriod)
  }
  
  return periods
}