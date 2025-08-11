/**
 * Nitro 伺服器啟動時的資料庫初始化插件
 * 在 Nitro 伺服器啟動時自動初始化資料庫連接和預設資料
 */

export default async function () {
  console.log('🔄 [Nitro Plugin] 伺服器啟動中，正在初始化資料庫...')
  
  try {
    // 匯入初始化函數
    const { initializeDatabase } = await import('~/lib/models')
    
    // 執行資料庫初始化
    await initializeDatabase()
    
    console.log('✅ [Nitro Plugin] 資料庫初始化完成，伺服器準備就緒')
  } catch (error: any) {
    console.error('❌ [Nitro Plugin] 資料庫初始化失敗:', error.message)
    
    // 開發環境繼續啟動，生產環境可能需要停止
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment) {
      throw new Error(`資料庫初始化失敗: ${error.message}`)
    } else {
      console.warn('⚠️  [Nitro Plugin] 開發環境：忽略資料庫初始化錯誤，繼續啟動伺服器')
    }
  }
}