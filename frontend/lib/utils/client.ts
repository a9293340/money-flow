/**
 * 客戶端工具函數
 * 處理客戶端相關的資訊擷取和平台檢測
 */

import type { H3Event } from 'h3'
import { getHeader } from 'h3'

// 客戶端平台類型
export type ClientPlatform = 'web' | 'mobile'

/**
 * 從 H3Event 取得客戶端 IP 位址
 * 依照優先順序檢查不同的 Header
 */
export function getClientIP(event: H3Event): string {
  // 1. 檢查 X-Forwarded-For (通常是代理伺服器設定)
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    // X-Forwarded-For 可能包含多個 IP，第一個是真實客戶端 IP
    const ips = xForwardedFor.split(',').map((ip: string) => ip.trim())
    if (ips[0]) {
      return ips[0]
    }
  }

  // 2. 檢查 X-Real-IP (Nginx 常用)
  const xRealIP = getHeader(event, 'x-real-ip')
  if (xRealIP) {
    return xRealIP
  }

  // 3. 檢查 CF-Connecting-IP (Cloudflare)
  const cfConnectingIP = getHeader(event, 'cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // 4. 檢查 X-Client-IP
  const xClientIP = getHeader(event, 'x-client-ip')
  if (xClientIP) {
    return xClientIP
  }

  // 5. 檢查 X-Cluster-Client-IP
  const xClusterClientIP = getHeader(event, 'x-cluster-client-ip')
  if (xClusterClientIP) {
    return xClusterClientIP
  }

  // 6. 檢查其他可能的 headers
  const forwarded = getHeader(event, 'forwarded')
  if (forwarded) {
    const forMatch = forwarded.match(/for=([^;,\s]+)/)
    if (forMatch && forMatch[1]) {
      // 移除可能的引號和端口
      return forMatch[1].replace(/["[\]]/g, '').split(':')[0]
    }
  }

  // 7. 最後回退方案 - 從 event.node.req 取得
  const remoteAddress = event.node.req.socket?.remoteAddress
  if (remoteAddress) {
    // 移除 IPv6 映射的 IPv4 前綴
    return remoteAddress.replace(/^::ffff:/, '')
  }

  // 8. 如果都取不到，回傳未知
  return 'unknown'
}

/**
 * 驗證 IP 位址格式
 */
export function isValidIP(ip: string): boolean {
  if (!ip || ip === 'unknown') {
    return false
  }

  // IPv4 正規表達式
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/

  // IPv6 正規表達式 (簡化版)
  const ipv6Regex = /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$|^::1$|^::$/i

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * 取得客戶端 User Agent
 */
export function getUserAgent(event: H3Event): string {
  return getHeader(event, 'user-agent') || 'unknown'
}

/**
 * 檢查是否為私有 IP
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIP(ip)) {
    return false
  }

  // IPv4 私有 IP 範圍
  const privateRanges = [
    /^127\./, // 127.0.0.0/8
    /^192\.168\./, // 192.168.0.0/16
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^::1$/, // IPv6 localhost
    /^fc/, // IPv6 私有範圍
    /^fd/, // IPv6 私有範圍
  ]

  return privateRanges.some(range => range.test(ip))
}

// ===== 客戶端平台檢測功能 =====

/**
 * 檢測當前運行環境 (瀏覽器端使用)
 * @returns 客戶端平台類型
 */
export function detectCurrentPlatform(): ClientPlatform {
  // 調試資訊
  if (typeof window !== 'undefined') {
    console.log('Platform detection debug:', {
      hasTauri: !!(window as unknown as Record<string, unknown>).__TAURI__,
      hasInvoke: !!(window as unknown as Record<string, unknown>).__TAURI_INVOKE__,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      windowKeys: Object.keys(window).filter(key => key.includes('TAURI') || key.includes('tauri')),
    })
  }

  // 1. 檢查 Tauri API 是否存在
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>
    if (w.__TAURI__ || w.__TAURI_INVOKE__ || w.tauri) {
      console.log('Detected mobile platform via Tauri API')
      return 'mobile'
    }
  }

  // 2. 檢查 User-Agent 中的 Tauri 特徵
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()
    const tauriFeatures = ['tauri', 'wry', 'webkit', 'android']

    // 對於 Android Tauri 應用，檢查特定模式
    if (userAgent.includes('android') && (userAgent.includes('wry') || userAgent.includes('webkit'))) {
      console.log('Detected mobile platform via Android User-Agent')
      return 'mobile'
    }

    if (tauriFeatures.some(feature => userAgent.includes(feature))) {
      console.log('Detected mobile platform via User-Agent features')
      return 'mobile'
    }
  }

  // 3. 檢查 URL protocol (Tauri 應用通常使用 tauri:// 或 https://tauri.localhost)
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname

    if (protocol === 'tauri:' || hostname.includes('tauri.localhost')) {
      console.log('Detected mobile platform via URL protocol')
      return 'mobile'
    }
  }

  console.log('Detected web platform (fallback)')
  return 'web'
}

/**
 * 獲取 API 請求的預設 headers (瀏覽器端使用)
 * @returns 包含平台標識的 headers
 */
export function getApiHeaders(): HeadersInit {
  const platform = detectCurrentPlatform()

  return {
    'Content-Type': 'application/json',
    'X-Client-Platform': platform,
  }
}

/**
 * 創建包含認證資訊的 fetch 選項 (瀏覽器端使用)
 * @param options 額外的 fetch 選項
 * @returns 完整的 fetch 選項
 */
export function createApiRequest(options: RequestInit = {}): RequestInit {
  const defaultHeaders = getApiHeaders()
  const platform = detectCurrentPlatform()

  return {
    // 在 mobile 環境中不使用 credentials 避免 CORS 問題
    ...(platform === 'web' ? { credentials: 'include' as RequestCredentials } : {}),
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  }
}

/**
 * 封裝的 API fetch 函數 (瀏覽器端使用)
 * 自動添加平台識別和認證 headers
 */
export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, createApiRequest(options))

  // 檢查 Content-Type 是否為 JSON
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  // 先複製 response 以便在錯誤時讀取文本
  const responseClone = response.clone()

  // 總是嘗試解析 JSON，不論狀態碼
  try {
    const data = await response.json()

    // 如果響應不成功但有 JSON 數據，返回數據（讓上層處理錯誤）
    if (!response.ok) {
      return data
    }

    return data
  }
  catch (jsonError) {
    // 如果 JSON 解析失敗，提供更詳細的錯誤資訊
    const responseText = await responseClone.text().catch(() => 'Unable to read response text')

    const errorDetails = {
      status: response.status,
      statusText: response.statusText,
      contentType,
      isJson,
      responseText: responseText.substring(0, 500), // 限制長度
      jsonError: jsonError instanceof Error ? jsonError.message : String(jsonError),
    }

    throw new Error(`JSON parsing failed: ${JSON.stringify(errorDetails, null, 2)}`)
  }
}

/**
 * JWT Token 過期時間配置資訊 (瀏覽器端使用)
 * 根據平台返回不同的配置資訊
 */
export function getTokenConfig(platform?: ClientPlatform) {
  const currentPlatform = platform || detectCurrentPlatform()

  if (currentPlatform === 'mobile') {
    return {
      accessTokenDuration: 60, // 1 小時 (分鐘)
      refreshTokenDuration: 30 * 24 * 60, // 30 天 (分鐘)
      platform: 'mobile' as const,
      description: '移動端 - 較長的 token 有效期，適合頻繁使用',
    }
  }

  return {
    accessTokenDuration: 15, // 15 分鐘
    refreshTokenDuration: 7 * 24 * 60, // 7 天 (分鐘)
    platform: 'web' as const,
    description: 'Web 端 - 較短的 token 有效期，安全性優先',
  }
}
