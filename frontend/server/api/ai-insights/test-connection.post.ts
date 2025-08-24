/**
 * AI 連接測試 API
 *
 * POST /api/ai-insights/test-connection
 *
 * 功能：
 * - 測試 OpenAI API 連接狀態
 * - 驗證 API Key 有效性
 * - 檢查服務可用性
 * - 僅在開發環境可用
 */

import { z } from 'zod'
import { verifyAndGetUser } from '~/lib/utils/auth-helpers'
import { useOpenAIClient } from '~/lib/ai/openai-client'
import { useCacheManager } from '~/lib/ai/cache-manager'
import type { AIEndpointResponse } from '~/types/ai'

/**
 * 請求體驗證 Schema
 */
const RequestSchema = z.object({
  includeUsage: z.boolean().default(false),
  includeCacheStats: z.boolean().default(false),
})

/**
 * 測試回應類型
 */
interface TestConnectionResponse {
  openAI: {
    connected: boolean
    message: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    error?: string
  }
  cache: {
    available: boolean
    stats?: {
      size: number
      hits: number
      misses: number
      hitRate: number
    }
  }
  environment: {
    nodeEnv: string
    hasApiKey: boolean
    timestamp: string
  }
}

/**
 * 主要 API 處理函數
 */
export default defineEventHandler(async (event): Promise<AIEndpointResponse<TestConnectionResponse>> => {
  try {
    // 僅在開發環境允許
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 403,
        statusMessage: '此 API 僅在開發環境可用',
      })
    }

    // 驗證請求方法
    assertMethod(event, 'POST')

    // 驗證使用者身份
    const user = await verifyAndGetUser(event)

    // 解析請求體
    const body = await readBody(event)
    const validatedBody = RequestSchema.parse(body)

    console.log(`用戶 ${user.id} 請求 AI 連接測試`)

    // 初始化回應資料
    const response: TestConnectionResponse = {
      openAI: {
        connected: false,
        message: '',
      },
      cache: {
        available: false,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        hasApiKey: !!process.env.OPEN_AI_KEY,
        timestamp: new Date().toISOString(),
      },
    }

    // 測試 OpenAI 連接
    try {
      const openaiClient = useOpenAIClient()
      const testResult = await openaiClient.testConnection()

      response.openAI.connected = testResult.success
      response.openAI.message = testResult.message

      if (validatedBody.includeUsage && testResult.usage) {
        response.openAI.usage = {
          promptTokens: testResult.usage.prompt_tokens,
          completionTokens: testResult.usage.completion_tokens,
          totalTokens: testResult.usage.total_tokens,
        }
      }

      if (!testResult.success) {
        response.openAI.error = testResult.message
      }
    }
    catch (error) {
      response.openAI.connected = false
      response.openAI.message = 'OpenAI 客戶端初始化失敗'
      response.openAI.error = error instanceof Error ? error.message : '未知錯誤'
    }

    // 測試快取系統
    try {
      const cacheManager = useCacheManager()
      response.cache.available = true

      if (validatedBody.includeCacheStats) {
        const stats = cacheManager.getStats()
        response.cache.stats = {
          size: stats.size,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hitRate,
        }
      }

      // 測試快取讀寫
      const testKey = `test_${user.id}_${Date.now()}`
      const testData = { test: true, timestamp: new Date().toISOString() }

      const setResult = cacheManager.set(
        user.id,
        'connection_test',
        '1M',
        testKey,
        {
          success: true,
          data: {
            ...testData,
            timestamp: new Date().toISOString(),
          } as any,
        },
      )

      const getResult = cacheManager.get(
        user.id,
        'connection_test',
        '1M',
        testKey,
      )

      // 清理測試資料
      cacheManager.delete(user.id, 'connection_test')

      if (!setResult || !getResult) {
        response.cache.available = false
        console.warn('快取讀寫測試失敗')
      }
    }
    catch (error) {
      response.cache.available = false
      console.error('快取系統測試失敗:', error)
    }

    // 記錄測試結果
    console.log('AI 連接測試結果:', {
      userId: user.id,
      openAI: response.openAI.connected,
      cache: response.cache.available,
      timestamp: response.environment.timestamp,
    })

    return {
      success: true,
      data: response,
      message: 'AI 連接測試完成',
      timestamp: new Date().toISOString(),
      requestId: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }
  }
  catch (error) {
    console.error('AI 連接測試 API 錯誤:', error)

    // 處理驗證錯誤
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '請求參數錯誤',
          stack: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
        },
        timestamp: new Date().toISOString(),
        requestId: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      }
    }

    // 處理 HTTP 錯誤
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // 處理未知錯誤
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '連接測試失敗',
        stack: process.env.NODE_ENV === 'development'
          ? error instanceof Error ? error.message : String(error)
          : undefined,
      },
      timestamp: new Date().toISOString(),
      requestId: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }
  }
})
