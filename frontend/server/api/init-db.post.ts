/**
 * 資料庫手動初始化 API 端點
 * 用於手動觸發資料庫初始化（備用選項）
 * 注意：正常情況下伺服器啟動時會自動初始化，此端點用於手動重新初始化
 */

import { initializeDatabase } from '~/lib/models'

export default defineEventHandler(async (event) => {
  try {
    // 檢查是否為開發環境或特定條件
    const config = useRuntimeConfig()
    const isProduction = config.public.nodeEnv === 'production'
    
    // 生產環境需要特殊權限或token
    if (isProduction) {
      const authHeader = getHeader(event, 'authorization')
      const adminToken = config.jwtSecret // 簡化版檢查，實際應該有專門的 admin token
      
      if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Unauthorized: Admin access required'
        })
      }
    }
    
    // 執行資料庫初始化
    console.log('🔄 開始初始化資料庫...')
    const result = await initializeDatabase()
    
    console.log('✅ 資料庫初始化完成')
    
    setResponseStatus(event, 200)
    return {
      success: true,
      message: '資料庫初始化成功',
      timestamp: new Date().toISOString(),
      data: result
    }
    
  } catch (error: any) {
    console.error('❌ 資料庫初始化失敗:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Database initialization failed',
      data: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })
  }
})