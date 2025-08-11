/**
 * Database Health Check API
 * 檢查 MongoDB 數據庫連接狀態
 */

import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const startTime = Date.now()

    // 嘗試連接數據庫
    await connectMongoDB()

    const responseTime = Date.now() - startTime

    // 設置 Cache-Control 防止緩存
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    return {
      status: 'healthy',
      service: 'mongodb',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      connection: 'connected',
    }
  }
  catch (error) {
    // 設置 503 狀態碼 (Service Unavailable)
    setResponseStatus(event, 503)

    return {
      status: 'unhealthy',
      service: 'mongodb',
      timestamp: new Date().toISOString(),
      connection: 'failed',
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Database connection failed',
    }
  }
})
