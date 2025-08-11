/**
 * 資料模型統一匯出
 * 提供所有資料模型的統一入口點
 */

// 匯出模型
export { User, type IUser } from './user'
export { Category, type ICategory, type CategoryType } from './category'
export { Record, type IRecord, type RecordType, type RecordSource } from './record'

// 匯出 MongoDB 連接管理
export {
  connectMongoDB,
  disconnectMongoDB,
  isMongoConnected,
  getConnectionStats,
} from '../mongodb'

/**
 * 初始化資料庫
 * 建立預設分類和必要的索引
 */
export async function initializeDatabase() {
  try {
    console.log('🔄 正在初始化資料庫...')

    // 確保 MongoDB 連接
    const { connectMongoDB } = await import('../mongodb')
    await connectMongoDB()

    // 建立預設分類
    const categoryModule = await import('./category')
    const Category = categoryModule.Category as typeof categoryModule.Category

    // 嘗試執行預設分類建立
    try {
      if (typeof Category.createDefaultCategories === 'function') {
        await Category.createDefaultCategories()
        console.log('✅ 預設分類建立成功')
      }
      else {
        console.log('🔍 嘗試從 schema statics 取得方法')
        const categorySchema = Category.schema
        if (categorySchema && categorySchema.statics.createDefaultCategories) {
          await categorySchema.statics.createDefaultCategories.call(Category)
          console.log('✅ 預設分類建立成功 (透過 schema statics)')
        }
        else {
          console.log('⚠️  無法找到 createDefaultCategories 方法，跳過預設分類建立')
        }
      }
    }
    catch (error: unknown) {
      console.warn('⚠️  預設分類建立失敗:', error instanceof Error ? error.message : String(error))
    }

    console.log('✅ 資料庫初始化完成')

    return {
      success: true,
      message: '資料庫初始化成功',
    }
  }
  catch (error: unknown) {
    console.error('❌ 資料庫初始化失敗:', error)
    throw new Error(`資料庫初始化失敗: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 資料庫健康檢查
 */
export async function checkDatabaseHealth() {
  try {
    const mongoose = await import('mongoose')

    // 檢查連接狀態
    if (mongoose.default.connection.readyState !== 1) {
      return {
        status: 'ERROR',
        message: 'MongoDB 連接未建立',
        readyState: mongoose.default.connection.readyState,
      }
    }

    // 測試資料庫查詢
    const { User } = await import('./user')
    await User.findOne({}).limit(1)

    return {
      status: 'OK',
      message: 'MongoDB 連接正常',
      readyState: mongoose.default.connection.readyState,
      host: mongoose.default.connection.host,
      name: mongoose.default.connection.name,
    }
  }
  catch (error: unknown) {
    return {
      status: 'ERROR',
      message: `資料庫健康檢查失敗: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.name : 'UnknownError',
    }
  }
}
