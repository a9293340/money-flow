/**
 * AI 服務層統一導出
 *
 * 提供：
 * - OpenAI API 客戶端
 * - 提示詞模板
 * - 財務分析邏輯
 * - 快取管理
 */

// AI 服務模組
export * from './openai-client'
export * from './prompt-templates'
export * from './financial-analyzer'
export * from './cache-manager'

// AI 服務的類型定義
export interface AIServiceConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

// 預設配置
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  apiKey: '', // 將在 runtime 時從 useRuntimeConfig() 取得
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
}
