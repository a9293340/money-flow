import { connectToDatabase } from '../utils/database'

// 全域資料庫連接中介軟體
export default defineEventHandler(async (event) => {
  // 只在 API 路由上執行
  if (event.node.req.url?.startsWith('/api/')) {
    try {
      // 確保資料庫連接
      const status = await connectToDatabase()
      
      if (!status.isConnected) {
        throw createError({
          statusCode: 503,
          statusMessage: `Database connection failed: ${status.error || 'Unknown error'}`
        })
      }
      
      // 在 event context 中添加連接狀態，供後續使用
      event.context.dbConnected = true
    } catch (error) {
      console.error('Database middleware error:', error)
      throw createError({
        statusCode: 503,
        statusMessage: 'Database service unavailable'
      })
    }
  }
})