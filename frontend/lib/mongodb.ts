/**
 * MongoDB 連接管理
 * 使用單例模式確保在 serverless 環境中有效管理連接
 */

import mongoose from 'mongoose'

interface MongoConnection {
  isConnected: boolean
  hasLoggedSuccess: boolean
}

const connection: MongoConnection = {
  isConnected: false,
  hasLoggedSuccess: false,
}

/**
 * 連接 MongoDB
 */
export async function connectMongoDB(): Promise<void> {
  try {
    // 如果已經連接，則直接返回 (不重複記錄)
    if (connection.isConnected) {
      return
    }

    // 檢查連接字串 - 直接從環境變數讀取以確保在生產環境中正常工作
    const mongoUri = process.env.MONGODB_URI || useRuntimeConfig().mongodbUri
    if (!mongoUri) {
      console.error('❌ MongoDB 連接字串檢查失敗')
      console.error('process.env.MONGODB_URI:', process.env.MONGODB_URI ? '存在' : '不存在')
      console.error('useRuntimeConfig().mongodbUri:', useRuntimeConfig().mongodbUri ? '存在' : '不存在')
      throw new Error('❌ MONGODB_URI 環境變數未設定')
    }

    // 配置 Mongoose 連接選項 (Mongoose 8+ 相容)
    const options = {
      // 緩衝相關設定
      bufferCommands: false,

      // 連接超時設定
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // 自動索引管理
      autoIndex: process.env.NODE_ENV !== 'production',
    }

    // 建立連接
    console.log('🔄 正在連接 MongoDB...')
    console.log('🔍 連接字串中的資料庫名稱:', mongoUri.split('/').pop()?.split('?')[0])
    await mongoose.connect(mongoUri, options)

    connection.isConnected = true
    connection.hasLoggedSuccess = true
    console.log('✅ MongoDB 連接成功')

    // 監聽連接事件
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB 連接錯誤:', error)
      connection.isConnected = false
      connection.hasLoggedSuccess = false
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB 連接斷開')
      connection.isConnected = false
      connection.hasLoggedSuccess = false
    })

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB 重新連接成功')
      connection.isConnected = true
      connection.hasLoggedSuccess = true
    })
  }
  catch (error) {
    console.error('❌ MongoDB 連接失敗:', error)
    connection.isConnected = false
    connection.hasLoggedSuccess = false
    throw error
  }
}

/**
 * 斷開 MongoDB 連接
 */
export async function disconnectMongoDB(): Promise<void> {
  try {
    if (connection.isConnected) {
      await mongoose.disconnect()
      connection.isConnected = false
      console.log('✅ MongoDB 連接已斷開')
    }
  }
  catch (error) {
    console.error('❌ MongoDB 斷開連接時發生錯誤:', error)
    throw error
  }
}

/**
 * 檢查 MongoDB 連接狀態
 */
export function isMongoConnected(): boolean {
  return connection.isConnected && mongoose.connection.readyState === 1
}

/**
 * 獲取 MongoDB 連接統計
 */
export function getConnectionStats() {
  return {
    isConnected: connection.isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  }
}
