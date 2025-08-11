/**
 * MongoDB 連接管理
 * 使用單例模式確保在 serverless 環境中有效管理連接
 */

import mongoose from 'mongoose'

interface MongoConnection {
  isConnected: boolean
}

const connection: MongoConnection = {
  isConnected: false
}

/**
 * 連接 MongoDB
 */
export async function connectMongoDB(): Promise<void> {
  try {
    // 如果已經連接，則直接返回
    if (connection.isConnected) {
      console.log('✅ MongoDB 已連接')
      return
    }

    // 檢查連接字串
    const mongoUri = useRuntimeConfig().mongodbUri
    if (!mongoUri) {
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
      autoIndex: process.env.NODE_ENV !== 'production'
    }

    // 建立連接
    console.log('🔄 正在連接 MongoDB...')
    await mongoose.connect(mongoUri, options)
    
    connection.isConnected = true
    console.log('✅ MongoDB 連接成功')
    
    // 監聽連接事件
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB 連接錯誤:', error)
      connection.isConnected = false
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB 連接斷開')
      connection.isConnected = false
    })
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB 重新連接成功')
      connection.isConnected = true
    })
    
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error)
    connection.isConnected = false
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
  } catch (error) {
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
    name: mongoose.connection.name
  }
}