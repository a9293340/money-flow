/**
 * API Health Check 端點
 * 檢查應用程式和資料庫的健康狀態
 */

import { checkDatabaseHealth } from '~/lib/models'

export default defineEventHandler(async (event) => {
  try {
    const timestamp = new Date().toISOString()
    
    // 基礎應用程式健康狀態
    const appHealth = {
      status: 'OK',
      timestamp,
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
    
    // 檢查資料庫健康狀態
    const dbHealth = await checkDatabaseHealth()
    
    // 整體健康狀態
    const isHealthy = dbHealth.status === 'OK'
    const overallStatus = isHealthy ? 'OK' : 'ERROR'
    
    const healthCheck = {
      status: overallStatus,
      timestamp,
      services: {
        application: appHealth,
        database: dbHealth
      },
      // 系統資訊
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      }
    }
    
    // 根據健康狀態設定 HTTP 狀態碼
    setResponseStatus(event, isHealthy ? 200 : 503)
    
    return healthCheck
    
  } catch (error: any) {
    console.error('❌ Health check failed:', error)
    
    setResponseStatus(event, 503)
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: {
        message: 'Health check failed',
        details: error.message
      }
    }
  }
})