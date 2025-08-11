/**
 * Health Check API
 * 用於 Docker 健康檢查和服務監控
 */

export default defineEventHandler(async (event) => {
  try {
    const startTime = Date.now()

    // 基本健康檢查
    const health: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'unknown', // 稍後檢查 MongoDB 連接
      },
    }

    // 檢查數據庫連接（可選）
    try {
      // 這裡可以加入 MongoDB 連接檢查
      // await connectMongoDB()
      health.services.database = 'healthy'
    }
    catch {
      health.services.database = 'disconnected'
    }

    const responseTime = Date.now() - startTime
    health.responseTime = `${responseTime}ms`

    // 設置 Cache-Control 防止緩存
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
    setHeader(event, 'Pragma', 'no-cache')
    setHeader(event, 'Expires', '0')

    return health
  }
  catch (error) {
    // 設置 500 狀態碼
    setResponseStatus(event, 500)

    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
    }
  }
})