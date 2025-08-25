/**
 * AI 分析記錄模型
 * 用於控制各種 AI 分析的執行頻率
 */

import mongoose from 'mongoose'

export interface AIAnalysisRecordDocument extends mongoose.Document {
  userId: string
  analysisType: 'health' | 'trend' | 'budget'
  lastAnalyzedAt: Date
  result: any // 緩存的分析結果
  createdAt: Date
  updatedAt: Date
}

const aiAnalysisRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  analysisType: {
    type: String,
    required: true,
    enum: ['health', 'trend', 'budget'],
    index: true,
  },
  lastAnalyzedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
})

// 複合索引：用戶ID + 分析類型
aiAnalysisRecordSchema.index({ userId: 1, analysisType: 1 }, { unique: true })

// 分析頻率限制配置
export const ANALYSIS_COOLDOWN_HOURS = {
  health: 24, // 健康分析：每天一次
  trend: 168, // 趨勢預測：每週一次 (7天)
  budget: 168, // 智能預算：每週一次 (7天)
} as const

export const AIAnalysisRecord = mongoose.models.AIAnalysisRecord
  || mongoose.model<AIAnalysisRecordDocument>('AIAnalysisRecord', aiAnalysisRecordSchema)

/**
 * 檢查用戶是否可以執行特定類型的分析
 */
export async function canPerformAnalysis(
  userId: string,
  analysisType: keyof typeof ANALYSIS_COOLDOWN_HOURS,
): Promise<{ canAnalyze: boolean, lastAnalyzedAt?: Date, nextAvailableAt?: Date }> {
  try {
    const record = await AIAnalysisRecord.findOne({ userId, analysisType })

    if (!record) {
      return { canAnalyze: true }
    }

    const cooldownHours = ANALYSIS_COOLDOWN_HOURS[analysisType]
    const cooldownMs = cooldownHours * 60 * 60 * 1000
    const nextAvailableAt = new Date(record.lastAnalyzedAt.getTime() + cooldownMs)

    const canAnalyze = Date.now() >= nextAvailableAt.getTime()

    return {
      canAnalyze,
      lastAnalyzedAt: record.lastAnalyzedAt,
      nextAvailableAt: canAnalyze ? undefined : nextAvailableAt,
    }
  }
  catch (error) {
    console.error('檢查分析頻率時發生錯誤:', error)
    // 發生錯誤時允許分析，避免阻礙用戶
    return { canAnalyze: true }
  }
}

/**
 * 保存分析結果並更新記錄
 */
export async function saveAnalysisResult(
  userId: string,
  analysisType: keyof typeof ANALYSIS_COOLDOWN_HOURS,
  result: any,
): Promise<void> {
  try {
    await AIAnalysisRecord.findOneAndUpdate(
      { userId, analysisType },
      {
        lastAnalyzedAt: new Date(),
        result,
      },
      {
        upsert: true,
        new: true,
      },
    )
  }
  catch (error) {
    console.error('保存分析結果時發生錯誤:', error)
    throw error
  }
}

/**
 * 獲取緩存的分析結果
 */
export async function getCachedAnalysisResult(
  userId: string,
  analysisType: keyof typeof ANALYSIS_COOLDOWN_HOURS,
): Promise<any | null> {
  try {
    const record = await AIAnalysisRecord.findOne({ userId, analysisType })
    return record?.result || null
  }
  catch (error) {
    console.error('獲取緩存分析結果時發生錯誤:', error)
    return null
  }
}

/**
 * 格式化等待時間
 */
export function formatWaitTime(nextAvailableAt: Date): string {
  const now = Date.now()
  const remainingMs = nextAvailableAt.getTime() - now

  if (remainingMs <= 0) {
    return '現在可用'
  }

  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}天${remainingHours > 0 ? remainingHours + '小時' : ''}後可用`
  }

  if (hours > 0) {
    return `${hours}小時${minutes > 0 ? minutes + '分鐘' : ''}後可用`
  }

  return `${minutes}分鐘後可用`
}
