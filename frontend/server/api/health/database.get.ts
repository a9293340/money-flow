import { getConnectionStatus } from '../../utils/database'
import mongoose from 'mongoose'
// 確保所有模型都被載入
import { User, Category, Record, Budget, ExchangeRate } from '../../models'

export default defineEventHandler(async (event) => {
  try {
    const status = getConnectionStatus()
    const mongooseState = mongoose.connection.readyState
    
    // Mongoose 連接狀態對應
    const stateMap = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    }
    
    const health = {
      status: status.isConnected && mongooseState === 1 ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: status.isConnected,
        mongooseState: stateMap[mongooseState as keyof typeof stateMap],
        error: status.error || null
      },
      collections: status.isConnected ? {
        users: User ? 'loaded' : 'not loaded',
        categories: Category ? 'loaded' : 'not loaded',
        records: Record ? 'loaded' : 'not loaded',
        budgets: Budget ? 'loaded' : 'not loaded',
        exchangeRates: ExchangeRate ? 'loaded' : 'not loaded'
      } : null
    }
    
    // 設定 HTTP 狀態碼
    setResponseStatus(event, health.status === 'OK' ? 200 : 503)
    
    return health
  } catch (error) {
    console.error('Health check failed:', error)
    
    setResponseStatus(event, 503)
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})