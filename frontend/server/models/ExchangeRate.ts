import mongoose, { Schema, Document } from 'mongoose'

export interface IExchangeRate extends Document {
  fromCurrency: string
  toCurrency: string
  rate: number
  source: string
  fetchedAt: Date
  createdAt: Date
}

const exchangeRateSchema = new Schema<IExchangeRate>({
  // 匯率資訊
  fromCurrency: {
    type: String,
    required: true,
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  toCurrency: {
    type: String,
    required: true,
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  rate: {
    type: Number,
    required: true,
    min: 0.000001
  },
  
  // 資料來源
  source: {
    type: String,
    default: 'exchangerate-api',
    enum: ['exchangerate-api', 'fixer', 'manual']
  },
  
  // 時間戳
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 索引
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, fetchedAt: -1 })
exchangeRateSchema.index({ fetchedAt: -1 }) // 清理過期資料用

// 複合唯一索引 (同一天只保留最新匯率)
exchangeRateSchema.index(
  { 
    fromCurrency: 1, 
    toCurrency: 1, 
    fetchedAt: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { 
      fetchedAt: { $type: "date" } 
    }
  }
)

export default mongoose.models.ExchangeRate || mongoose.model<IExchangeRate>('ExchangeRate', exchangeRateSchema)