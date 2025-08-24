/**
 * AI 分析快取管理器
 *
 * 提供：
 * - AI 回應快取機制
 * - 記憶體快取管理
 * - 快取失效策略
 * - 使用量統計
 */

import type { CacheItem, CacheConfig, AIAnalysisResponse } from '~/types/ai'

/**
 * 快取管理器類別
 */
export class CacheManager {
  private cache = new Map<string, CacheItem>()
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null
  private usageStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 30 * 60 * 1000, // 30 分鐘預設 TTL
      maxSize: config.maxSize || 100, // 最多快取 100 項
      cleanupInterval: config.cleanupInterval || 5 * 60 * 1000, // 5 分鐘清理一次
    }

    this.startCleanupTimer()
  }

  /**
   * 生成快取鍵值
   */
  private generateCacheKey(
    userId: string,
    analysisType: string,
    timeRange: string,
    dataHash: string,
  ): string {
    return `${userId}:${analysisType}:${timeRange}:${dataHash}`
  }

  /**
   * 生成資料雜湊值
   */
  private generateDataHash(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort())

    // 簡單的雜湊函數 (適用於快取用途)
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 轉換為 32 位整數
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * 設定快取項目
   */
  set(
    userId: string,
    analysisType: string,
    timeRange: string,
    data: any,
    response: AIAnalysisResponse,
  ): boolean {
    try {
      const dataHash = this.generateDataHash(data)
      const key = this.generateCacheKey(userId, analysisType, timeRange, dataHash)

      const now = new Date()
      const expiresAt = new Date(now.getTime() + this.config.ttl)

      const cacheItem: CacheItem = {
        key,
        data: response,
        timestamp: now,
        expiresAt,
        userId,
        analysisType,
      }

      // 檢查快取大小限制
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest()
      }

      this.cache.set(key, cacheItem)
      return true
    }
    catch (error) {
      console.error('快取設定失敗:', error)
      return false
    }
  }

  /**
   * 取得快取項目
   */
  get(
    userId: string,
    analysisType: string,
    timeRange: string,
    data: any,
  ): AIAnalysisResponse | null {
    try {
      const dataHash = this.generateDataHash(data)
      const key = this.generateCacheKey(userId, analysisType, timeRange, dataHash)

      const item = this.cache.get(key)

      if (!item) {
        this.usageStats.misses++
        return null
      }

      // 檢查是否過期
      if (new Date() > item.expiresAt) {
        this.cache.delete(key)
        this.usageStats.misses++
        return null
      }

      this.usageStats.hits++
      return item.data
    }
    catch (error) {
      console.error('快取讀取失敗:', error)
      this.usageStats.misses++
      return null
    }
  }

  /**
   * 刪除特定快取
   */
  delete(
    userId: string,
    analysisType?: string,
    timeRange?: string,
  ): number {
    let deletedCount = 0

    for (const [key, item] of this.cache.entries()) {
      let shouldDelete = item.userId === userId

      if (analysisType) {
        shouldDelete = shouldDelete && item.analysisType === analysisType
      }

      if (timeRange) {
        shouldDelete = shouldDelete && key.includes(timeRange)
      }

      if (shouldDelete) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    this.usageStats.evictions += deletedCount
    return deletedCount
  }

  /**
   * 清空所有快取
   */
  clear(): void {
    const count = this.cache.size
    this.cache.clear()
    this.usageStats.evictions += count
  }

  /**
   * 淘汰最舊的快取項目
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return

    let oldestKey = ''
    let oldestTime = new Date()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.usageStats.evictions++
    }
  }

  /**
   * 清理過期項目
   */
  private cleanup(): void {
    const now = new Date()
    let cleanedCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.usageStats.evictions += cleanedCount
      console.log(`清理了 ${cleanedCount} 個過期快取項目`)
    }
  }

  /**
   * 啟動定期清理定時器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 取得快取統計資訊
   */
  getStats(): {
    size: number
    hits: number
    misses: number
    evictions: number
    hitRate: number
    memoryUsage: string
  } {
    const totalRequests = this.usageStats.hits + this.usageStats.misses
    const hitRate = totalRequests > 0 ? (this.usageStats.hits / totalRequests) * 100 : 0

    // 估算記憶體使用量
    const estimatedSize = this.cache.size * 2 // 假設每項約 2KB
    const memoryUsage = estimatedSize > 1024
      ? `${(estimatedSize / 1024).toFixed(1)} MB`
      : `${estimatedSize} KB`

    return {
      size: this.cache.size,
      hits: this.usageStats.hits,
      misses: this.usageStats.misses,
      evictions: this.usageStats.evictions,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
    }
  }

  /**
   * 取得特定使用者的快取項目
   */
  getUserCache(userId: string): CacheItem[] {
    return Array.from(this.cache.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * 檢查快取鍵是否存在且有效
   */
  has(
    userId: string,
    analysisType: string,
    timeRange: string,
    data: any,
  ): boolean {
    const dataHash = this.generateDataHash(data)
    const key = this.generateCacheKey(userId, analysisType, timeRange, dataHash)

    const item = this.cache.get(key)
    return item !== undefined && new Date() <= item.expiresAt
  }

  /**
   * 更新快取配置
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // 重啟清理定時器
    this.stopCleanup()
    this.startCleanupTimer()
  }

  /**
   * 取得目前配置
   */
  getConfig(): Readonly<CacheConfig> {
    return { ...this.config }
  }

  /**
   * 銷毀快取管理器
   */
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }
}

/**
 * 全域快取管理器實例
 */
let globalCacheManager: CacheManager | null = null

/**
 * 取得或建立全域快取管理器
 */
export function useCacheManager(config?: Partial<CacheConfig>): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = new CacheManager(config)
  }
  else if (config) {
    globalCacheManager.updateConfig(config)
  }

  return globalCacheManager
}

/**
 * 快取工具函數
 */
export const cacheUtils = {
  /**
   * 建立分析特定的快取鍵
   */
  createAnalysisKey: (
    userId: string,
    type: string,
    timeRange: string,
    dataSignature: string,
  ): string => {
    return `ai_analysis:${userId}:${type}:${timeRange}:${dataSignature}`
  },

  /**
   * 計算資料簽名 (用於快取鍵)
   */
  calculateDataSignature: (data: any): string => {
    const manager = new CacheManager()
    return manager['generateDataHash'](data) // 訪問私有方法
  },

  /**
   * 格式化快取統計資訊
   */
  formatStats: (stats: ReturnType<CacheManager['getStats']>): string => {
    return `快取統計 - 命中率: ${stats.hitRate}% | 大小: ${stats.size}/${stats.memoryUsage} | 命中/錯失: ${stats.hits}/${stats.misses}`
  },
}

/**
 * 快取中間件 (用於 API 路由)
 */
export function withCache<T extends (...args: any[]) => Promise<AIAnalysisResponse>>(
  fn: T,
  cacheConfig?: {
    analysisType: string
    ttlMinutes?: number
  },
): T {
  return (async (...args: any[]) => {
    const [userId, timeRange, data] = args
    const analysisType = cacheConfig?.analysisType || 'default'

    const cacheManager = useCacheManager()

    // 嘗試從快取取得
    const cached = cacheManager.get(userId, analysisType, timeRange, data)
    if (cached) {
      return cached
    }

    // 執行實際分析
    const result = await fn(...args)

    // 儲存到快取
    if (result.success) {
      cacheManager.set(userId, analysisType, timeRange, data, result)
    }

    return result
  }) as T
}
