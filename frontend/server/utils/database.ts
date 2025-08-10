import mongoose from 'mongoose'
import { getConfig } from './env'

interface ConnectionStatus {
  isConnected: boolean
  error?: string
}

let connectionStatus: ConnectionStatus = { isConnected: false }

export async function connectToDatabase(): Promise<ConnectionStatus> {
  try {
    if (connectionStatus.isConnected && mongoose.connection.readyState === 1) {
      return connectionStatus
    }

    const config = getConfig()
    const mongoUri = config.mongodbUri

    // 設置 mongoose 全域配置
    mongoose.set('strictQuery', false)
    mongoose.set('toJSON', {
      virtuals: true,
      transform: function(_doc, ret) {
        delete (ret as any)._id
        delete (ret as any).__v
        return ret
      }
    })

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    })

    connectionStatus = { isConnected: true }

    // 監聽連接事件
    mongoose.connection.on('connected', () => {
      console.log('MongoDB 連接成功')
    })

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 連接錯誤:', err)
      connectionStatus = { isConnected: false, error: err.message }
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 連接中斷')
      connectionStatus = { isConnected: false }
    })

    return connectionStatus
  } catch (error) {
    console.error('資料庫連接失敗:', error)
    connectionStatus = { 
      isConnected: false, 
      error: error instanceof Error ? error.message : '未知錯誤' 
    }
    return connectionStatus
  }
}

export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus
}

// 優雅關閉連接
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    connectionStatus = { isConnected: false }
  }
}