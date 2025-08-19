/**
 * 重複預算檢查中間件
 * 在預算相關 API 請求時自動檢查並生成到期的重複預算
 */

import { checkAndGenerateRecurringBudgets } from '~/server/utils/recurring-budget-generator'

// 記錄最後檢查時間，避免頻繁檢查
let lastCheckTime = 0
const CHECK_INTERVAL = 5 * 60 * 1000 // 5分鐘檢查間隔

export default defineEventHandler(async (event) => {
  // 只處理預算相關的 GET 請求（避免影響 POST/PUT/DELETE 的性能）
  const url = getRequestURL(event)
  const method = getMethod(event)

  if (!url.pathname.startsWith('/api/budgets') || method !== 'GET') {
    return
  }

  // 檢查是否需要執行定期檢查
  const now = Date.now()
  if (now - lastCheckTime < CHECK_INTERVAL) {
    return // 跳過檢查，間隔時間未到
  }

  try {
    lastCheckTime = now

    // 異步執行檢查，不阻塞當前請求
    checkAndGenerateRecurringBudgets()
      .then((result) => {
        if (result.generated > 0) {
          console.log(`自動生成了 ${result.generated} 個重複預算`)
        }
        if (result.errors.length > 0) {
          console.warn(`重複預算生成時發生 ${result.errors.length} 個錯誤`)
        }
      })
      .catch((error) => {
        console.error('重複預算檢查失敗:', error)
      })
  }
  catch (error) {
    // 捕獲同步錯誤，但不影響正常請求
    console.error('重複預算檢查中間件錯誤:', error)
  }
})
