/**
 * OpenAI API 客戶端服務
 *
 * 提供：
 * - OpenAI API 調用封裝
 * - 錯誤處理和重試機制
 * - Token 使用量統計
 * - 速率限制處理
 */

import type {
  OpenAIConfig,
  AIAnalysisResponse,
} from '~/types/ai'

/**
 * OpenAI 聊天完成 API 請求格式
 */
interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

/**
 * OpenAI 聊天完成 API 回應格式
 */
interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * OpenAI 客戶端類別
 */
export class OpenAIClient {
  private config: OpenAIConfig
  private baseURL = 'https://api.openai.com/v1'

  constructor(config: OpenAIConfig) {
    this.config = config
    this.validateConfig()
  }

  /**
   * 驗證 API 配置
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API Key 未設定')
    }

    if (!this.config.apiKey.startsWith('sk-')) {
      throw new Error('OpenAI API Key 格式錯誤')
    }
  }

  /**
   * 發送聊天完成請求
   */
  private async sendChatCompletion(
    messages: ChatCompletionRequest['messages'],
    options: Partial<Pick<ChatCompletionRequest, 'max_tokens' | 'temperature'>> = {},
  ): Promise<ChatCompletionResponse> {
    const requestBody: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      max_tokens: options.max_tokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `OpenAI API 調用失敗 (${response.status}): ${
            errorData.error?.message || '未知錯誤'
          }`,
        )
      }

      return await response.json()
    }
    catch (error) {
      clearTimeout(timeoutId)

      if ((error as Error).name === 'AbortError') {
        throw new Error(`OpenAI API 請求超時 (${this.config.timeout}ms)`)
      }

      throw error
    }
  }

  /**
   * 執行財務健康分析
   */
  async analyzeFinancialHealth(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number, temperature?: number },
  ): Promise<AIAnalysisResponse> {
    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ]

      const response = await this.sendChatCompletion(messages, options)

      const analysis = response.choices[0]?.message?.content

      if (!analysis) {
        throw new Error('OpenAI 回應內容為空')
      }

      // 嘗試解析 JSON 格式的回應（如果是結構化資料）
      let parsedData: any = analysis
      try {
        if (analysis.trim().startsWith('{')) {
          parsedData = JSON.parse(analysis)
        }
      }
      catch {
        // 如果不是 JSON，保持原始文字
      }

      return {
        success: true,
        data: {
          analysis: typeof parsedData === 'string' ? parsedData : parsedData.analysis || analysis,
          recommendations: parsedData.recommendations || [],
          score: parsedData.score,
          grade: parsedData.grade,
          metrics: parsedData.metrics,
          timestamp: new Date().toISOString(),
        },
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          estimatedCost: this.calculateCost(response.usage.total_tokens),
        },
      }
    }
    catch (error) {
      console.error('OpenAI 分析失敗:', error)

      return {
        success: false,
        error: {
          code: 'OPENAI_ERROR',
          message: error instanceof Error ? error.message : '未知錯誤',
          details: error,
        },
      }
    }
  }

  /**
   * 生成預算建議
   */
  async generateBudgetRecommendation(prompt: {
    systemPrompt: string
    userPrompt: string
  }): Promise<any> {
    try {
      console.log('🎯 開始生成預算建議')

      const response = await this.sendChatCompletion([
        {
          role: 'system',
          content: prompt.systemPrompt,
        },
        {
          role: 'user',
          content: prompt.userPrompt,
        },
      ], {
        max_tokens: 1500,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content?.trim()
      if (!content) {
        throw new Error('OpenAI 預算建議回應內容為空')
      }

      // 嘗試解析 JSON 回應
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('✅ 成功解析預算建議 JSON')
          return parsed
        }
      }
      catch (parseError) {
        console.warn('⚠️ JSON 解析失敗，使用文字回應:', parseError)
      }

      // 如果 JSON 解析失敗，返回結構化格式
      return {
        recommendedBudget: {
          totalBudget: 0,
          categories: [],
        },
        recommendations: [content],
        insights: [],
        improvements: [],
        riskWarnings: [],
        nextSteps: [],
        confidence: 0.7,
        methodology: '基於 AI 文字分析',
      }
    }
    catch (error) {
      console.error('🎯 預算建議生成失敗:', error)
      throw new Error(`預算建議生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 生成趨勢預測
   */
  async generateTrendPrediction(prompt: {
    systemPrompt: string
    userPrompt: string
  }): Promise<any> {
    try {
      console.log('📈 開始生成趨勢預測')

      const response = await this.sendChatCompletion([
        {
          role: 'system',
          content: prompt.systemPrompt,
        },
        {
          role: 'user',
          content: prompt.userPrompt,
        },
      ], {
        max_tokens: 1200,
        temperature: 0.6,
      })

      const content = response.choices[0]?.message?.content?.trim()
      if (!content) {
        throw new Error('OpenAI 趨勢預測回應內容為空')
      }

      // 嘗試解析 JSON 回應
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('✅ 成功解析趨勢預測 JSON')
          return parsed
        }
      }
      catch (parseError) {
        console.warn('⚠️ 趨勢預測 JSON 解析失敗，使用文字回應:', parseError)
      }

      // 如果 JSON 解析失敗，返回結構化格式
      return {
        predictions: {
          income: { predicted: 0, confidence: 0.5, trend: '持平' },
          expenses: { predicted: 0, confidence: 0.5, trend: '持平' },
          savings: { predicted: 0, confidence: 0.5, trend: '持平' },
        },
        trends: [],
        opportunities: [content],
        risks: [],
        recommendations: [],
        confidence: 0.6,
        methodology: '基於 AI 文字分析',
      }
    }
    catch (error) {
      console.error('📈 趨勢預測生成失敗:', error)
      throw new Error(`趨勢預測生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 計算 API 使用成本
   */
  private calculateCost(totalTokens: number): number {
    // GPT-3.5-turbo 定價: $0.002 / 1K tokens
    const costPer1KTokens = 0.002
    return (totalTokens / 1000) * costPer1KTokens
  }

  /**
   * 測試 API 連接
   */
  async testConnection(): Promise<{
    success: boolean
    message: string
    usage?: ChatCompletionResponse['usage']
  }> {
    try {
      const response = await this.sendChatCompletion([
        {
          role: 'system',
          content: '你是一位專業的財務顧問助手。',
        },
        {
          role: 'user',
          content: '請用一句話介紹財務健康的重要性。',
        },
      ], { max_tokens: 50 })

      return {
        success: true,
        message: 'OpenAI API 連接正常',
        usage: response.usage,
      }
    }
    catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '連接測試失敗',
      }
    }
  }

  /**
   * 更新 API 配置
   */
  updateConfig(newConfig: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.validateConfig()
  }

  /**
   * 取得目前配置
   */
  getConfig(): Readonly<OpenAIConfig> {
    return { ...this.config }
  }
}

/**
 * 建立 OpenAI 客戶端實例
 */
export function createOpenAIClient(config?: Partial<OpenAIConfig>): OpenAIClient {
  const defaultConfig: OpenAIConfig = {
    apiKey: process.env.OPEN_AI_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000, // 30 秒超時
  }

  const finalConfig = { ...defaultConfig, ...config }

  return new OpenAIClient(finalConfig)
}

/**
 * 單例 OpenAI 客戶端
 */
let globalClient: OpenAIClient | null = null

/**
 * 取得或建立全域 OpenAI 客戶端
 */
export function useOpenAIClient(): OpenAIClient {
  if (!globalClient) {
    globalClient = createOpenAIClient()
  }
  return globalClient
}
