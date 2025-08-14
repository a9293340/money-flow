/**
 * 客戶端工具函數
 * 處理客戶端相關的資訊擷取和平台檢測
 */

import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { debugInfo, debugWarn, debugError, debugSuccess } from './mobile-debug'

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
  // Server side 回傳預設值
  if (typeof window === 'undefined') {
    return 'web'
  }

  // 使用緩存避免重複檢測
  if ((window as unknown as Record<string, unknown>).__PLATFORM_CACHE__) {
    return (window as unknown as Record<string, unknown>).__PLATFORM_CACHE__ as ClientPlatform
  }

  let platform: ClientPlatform = 'web'

  // 調試資訊
  const debugInfo = {
    hasTauri: !!(window as unknown as Record<string, unknown>).__TAURI__,
    hasInvoke: !!(window as unknown as Record<string, unknown>).__TAURI_INVOKE__,
    hasTauriCore: !!(window as unknown as Record<string, unknown>).__TAURI_CORE__,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    protocol: window.location?.protocol,
    hostname: window.location?.hostname,
    windowKeys: Object.keys(window).filter(key =>
      key.toLowerCase().includes('tauri')
      || key.toLowerCase().includes('wry')
      || key.toLowerCase().includes('android'),
    ),
  }

  console.log('Platform detection debug:', debugInfo)

  // 1. 檢查 Tauri API 是否存在 (最準確的方法)
  const w = window as unknown as Record<string, unknown>
  if (w.__TAURI__ || w.__TAURI_INVOKE__ || w.__TAURI_CORE__ || w.tauri) {
    platform = 'mobile'
    console.log('✅ Detected mobile platform via Tauri API')
  }
  // 2. 檢查 URL protocol 和 hostname
  else if (window.location) {
    const protocol = window.location.protocol
    const hostname = window.location.hostname

    if (protocol === 'tauri:'
      || hostname.includes('tauri.localhost')
      || hostname.startsWith('tauri://')
      || (hostname.includes('localhost') && protocol === 'https:')) {
      platform = 'mobile'
      console.log('✅ Detected mobile platform via URL protocol/hostname')
    }
  }
  // 3. 檢查 User-Agent 中的 Tauri 特徵 (最後手段)
  else if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()

    // 更精確的 Tauri Android 檢測
    const hasTauriSignature = userAgent.includes('money-flow') || userAgent.includes('tauri')
    const hasAndroidWebkit = userAgent.includes('android')
      && (userAgent.includes('wry') || userAgent.includes('webkit'))

    if (hasTauriSignature || hasAndroidWebkit) {
      platform = 'mobile'
      console.log('✅ Detected mobile platform via User-Agent features')
    }
  }

  // 緩存結果
  ;(window as unknown as Record<string, unknown>).__PLATFORM_CACHE__ = platform

  console.log(`🎯 Final platform detection: ${platform}`)
  return platform
}

/**
 * 獲取 API 請求的預設 headers (瀏覽器端使用)
 * @returns 包含平台標識的 headers
 */
// export function getApiHeaders(): HeadersInit {
//   const platform = detectCurrentPlatform()

//   return {
//     'Content-Type': 'application/json',
//     'X-Client-Platform': platform,
//   }
// }

/**
 * 從 localStorage 取得 access token (移動端使用)
 */
function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * 從 localStorage 取得 refresh token (移動端使用)
 */
export function getRefreshTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

/**
 * 儲存 tokens 到 localStorage (移動端使用)
 */
export function saveTokensToStorage(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

/**
 * 清除 localStorage 中的 tokens (移動端使用)
 */
export function clearTokensFromStorage() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

/**
 * 創建包含認證資訊的 fetch 選項 (瀏覽器端使用)
 * @param options 額外的 fetch 選項
 * @returns 完整的 fetch 選項
 */
export function createApiRequest(options: RequestInit = {}): RequestInit {
  const platform = detectCurrentPlatform()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Platform': platform, // 添加平台標識 header
    ...(options.headers as Record<string, string> || {}),
  }

  // 移動端加入 Authorization header
  if (platform === 'mobile') {
    const accessToken = getAccessTokenFromStorage()
    debugInfo('🔐 移動端 createApiRequest', {
      platform,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
    })
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    else {
      debugWarn('⚠️ 移動端沒有找到 access token')
    }
  }

  debugInfo('📤 API Request Headers', headers)

  return {
    ...options,
    headers,
    // Web 端使用 credentials 發送 cookies，移動端不需要
    ...(platform === 'web' ? { credentials: 'include' as RequestCredentials } : {}),
  }
}

/**
 * 移動端專用登入請求 (避免 preflight)
 */
export async function mobileLoginFetch<T = Record<string, unknown>>(
  url: string,
  data: { email: string, password: string, rememberMe: boolean },
): Promise<T> {
  // 使用 FormData 避免 preflight
  const formData = new FormData()
  formData.append('email', data.email)
  formData.append('password', data.password)
  formData.append('rememberMe', data.rememberMe.toString())

  const platform = detectCurrentPlatform()
  const headers: Record<string, string> = {
    'X-Client-Platform': platform, // 添加平台標識
  }

  debugInfo(`📤 移動端登入請求`, {
    url,
    platform,
    headers
  })

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
    // 不設定 Content-Type，讓瀏覽器自動設定為 multipart/form-data
    // 不使用 credentials
  })

  debugInfo(`📥 移動端登入響應`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  const result = await response.json()
  debugInfo(`📊 移動端登入結果`, result)
  
  return result
}

/**
 * 封裝的 API fetch 函數 (瀏覽器端使用)
 * 自動添加平台識別和認證 headers
 */
export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const platform = detectCurrentPlatform()

  // 構建完整的 URL
  let fullUrl = url
  if (url.startsWith('/api/')) {
    // 如果是相對 API 路徑，需要組合完整 URL
    if (platform === 'mobile') {
      // 移動端：移除 url 開頭的 /api/，因為 getApiUrl() 已經包含 /api
      fullUrl = getApiUrl() + url.substring(4) // 移除 "/api" 部分
    } else {
      // Web 端：使用相對路徑即可
      fullUrl = url
    }
  }

  debugInfo(`🔗 URL 處理`, {
    platform,
    originalUrl: url,
    fullUrl,
    apiUrl: platform === 'mobile' ? getApiUrl() : 'relative'
  })

  // 移動端特殊處理：如果是 POST 且有 body，嘗試用 FormData
  if (platform === 'mobile' && options.method === 'POST' && options.body) {
    try {
      const bodyData = JSON.parse(options.body as string)
      // 如果是登入請求，使用 FormData
      if (bodyData.email && bodyData.password) {
        return mobileLoginFetch(fullUrl, bodyData)
      }
    }
    catch {
      // 如果不是 JSON，繼續使用原邏輯
    }
  }

  const requestOptions = createApiRequest(options)
  debugInfo(`🌐 發送請求到: ${fullUrl}`, {
    method: requestOptions.method || 'GET',
    headers: requestOptions.headers
  })

  const response = await fetch(fullUrl, requestOptions)

  debugInfo(`📡 收到響應`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  })

  // 檢查 Content-Type 是否為 JSON
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  // 先複製 response 以便在錯誤時讀取文本
  const responseClone = response.clone()

  // 總是嘗試解析 JSON，不論狀態碼
  try {
    const data = await response.json()
    
    debugInfo(`📊 解析的 JSON 數據`, {
      data,
      dataType: typeof data,
      dataKeys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
      isEmpty: typeof data === 'object' && data !== null && Object.keys(data).length === 0
    })

    // 如果響應不成功但有 JSON 數據，返回數據（讓上層處理錯誤）
    if (!response.ok) {
      debugError(`❌ HTTP 錯誤 ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        data
      })
      // 重要：對於 HTTP 錯誤狀態碼，仍然返回解析的 JSON 數據
      return data
    }

    debugSuccess(`✅ API 成功 ${response.status}`, data)
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

    debugError('❌ JSON 解析失敗', errorDetails)
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

/**
 * 動態取得 API URL (瀏覽器端使用)
 * 根據當前環境自動判斷正確的 API URL
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 開發環境
      return `${protocol}//${hostname}:${port || '3000'}/api`
    }

    if (hostname.includes('tauri')) {
      return 'https://personal-finance-manager-266039927960.asia-east1.run.app/api'
    }

    // Web 生產環境：使用當前 origin
    return `${window.location.origin}/api`
  }

  return 'http://localhost:3000/api'
}
