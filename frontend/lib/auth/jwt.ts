/**
 * JWT 工具模組
 * 處理 JWT token 的產生、驗證、刷新和 Cookie 管理
 */

import jwt from 'jsonwebtoken'
import type { SignOptions, VerifyOptions } from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { setCookie, deleteCookie, getCookie, getHeader } from 'h3'

// JWT Payload 類型定義
export interface JWTPayload {
  userId: string
  email: string
  role?: string
  iat?: number
  exp?: number
}

// Refresh Token Payload
export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat?: number
  exp?: number
}

// 客戶端平台類型
export type ClientPlatform = 'web' | 'mobile'

// Token 配置 - 根據平台動態設定
const getTokenConfig = (platform: ClientPlatform) => {
  if (platform === 'mobile') {
    return {
      access: {
        expiresIn: '1h' as const,
        cookieName: 'access_token',
        maxAge: 60 * 60 * 1000, // 1 小時
      },
      refresh: {
        expiresIn: '30d' as const,
        cookieName: 'refresh_token',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 天
      },
    }
  }

  // Web 預設設定
  return {
    access: {
      expiresIn: '15m' as const,
      cookieName: 'access_token',
      maxAge: 15 * 60 * 1000, // 15 分鐘
    },
    refresh: {
      expiresIn: '7d' as const,
      cookieName: 'refresh_token',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    },
  }
}

// 舊版 TOKEN_CONFIG 保持向後相容
const TOKEN_CONFIG = getTokenConfig('web')

/**
 * 檢測客戶端平台類型
 */
export function detectClientPlatform(event: H3Event): ClientPlatform {
  // 1. 優先檢查自定義 Header
  const clientPlatform = getHeader(event, 'x-client-platform')?.toLowerCase()
  if (clientPlatform === 'mobile' || clientPlatform === 'web') {
    return clientPlatform as ClientPlatform
  }

  // 2. 檢查 User-Agent 中的 Tauri 特徵
  const userAgent = getHeader(event, 'user-agent') || ''

  // Tauri 應用的 User-Agent 特徵檢測
  const tauriFeatures = [
    'tauri', // Tauri 標識
    'money-flow', // 我們的應用名稱
    'wry', // Tauri 使用的 WebView 引擎
  ]

  const isMobile = tauriFeatures.some(feature =>
    userAgent.toLowerCase().includes(feature),
  )

  return isMobile ? 'mobile' : 'web'
}

/**
 * 產生 Access Token (支援動態平台設定)
 */
export function generateAccessToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  platform: ClientPlatform = 'web',
): string {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  const tokenConfig = getTokenConfig(platform)
  const options: SignOptions = {
    expiresIn: tokenConfig.access.expiresIn,
    issuer: 'money-flow',
    audience: 'money-flow-users',
  }

  return jwt.sign(payload, config.jwtSecret as string, options)
}

/**
 * 產生 Refresh Token (支援動態平台設定)
 */
export function generateRefreshToken(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
  platform: ClientPlatform = 'web',
): string {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  const tokenConfig = getTokenConfig(platform)
  const options: SignOptions = {
    expiresIn: tokenConfig.refresh.expiresIn,
    issuer: 'money-flow',
    audience: 'money-flow-refresh',
  }

  return jwt.sign(payload, config.jwtSecret as string, options)
}

/**
 * 驗證 Access Token
 */
export function verifyAccessToken(token: string): JWTPayload {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  try {
    const options: VerifyOptions = {
      issuer: 'money-flow',
      audience: 'money-flow-users',
    }

    const decoded = jwt.verify(token, config.jwtSecret as string, options) as JWTPayload

    return decoded
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'TokenExpiredError') {
      throw new Error('Access token 已過期')
    }
    else if (error && typeof error === 'object' && 'name' in error && error.name === 'JsonWebTokenError') {
      throw new Error('無效的 access token')
    }
    else {
      throw new Error(`Token 驗證失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * 驗證 Refresh Token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  try {
    const options: VerifyOptions = {
      issuer: 'money-flow',
      audience: 'money-flow-refresh',
    }

    const decoded = jwt.verify(token, config.jwtSecret as string, options) as RefreshTokenPayload

    return decoded
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'TokenExpiredError') {
      throw new Error('Refresh token 已過期')
    }
    else if (error && typeof error === 'object' && 'name' in error && error.name === 'JsonWebTokenError') {
      throw new Error('無效的 refresh token')
    }
    else {
      throw new Error(`Refresh token 驗證失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * 解碼 Token (不驗證)
 */
export function decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | RefreshTokenPayload
  }
  catch {
    return null
  }
}

/**
 * 設定 Cookie 選項 (支援動態平台設定)
 */
function getCookieOptions(isRefreshToken = false, platform: ClientPlatform = 'web') {
  const config = useRuntimeConfig()
  const isDevelopment = config.public.nodeEnv === 'development'
  const tokenConfig = getTokenConfig(platform)

  return {
    httpOnly: true,
    secure: !isDevelopment, // 開發環境可使用 HTTP
    sameSite: 'lax' as const,
    maxAge: isRefreshToken ? tokenConfig.refresh.maxAge : tokenConfig.access.maxAge,
    path: '/',
  }
}

/**
 * 設定認證 Cookies (支援動態平台設定)
 */
export function setAuthCookies(
  event: H3Event,
  accessToken: string,
  refreshToken: string,
  platform: ClientPlatform = 'web',
) {
  const tokenConfig = getTokenConfig(platform)

  // 設定 Access Token Cookie
  setCookie(event, tokenConfig.access.cookieName, accessToken, getCookieOptions(false, platform))

  // 設定 Refresh Token Cookie
  setCookie(event, tokenConfig.refresh.cookieName, refreshToken, getCookieOptions(true, platform))
}

/**
 * 清除認證 Cookies (支援動態平台設定)
 */
export function clearAuthCookies(event: H3Event, platform: ClientPlatform = 'web') {
  const tokenConfig = getTokenConfig(platform)

  // 清除 Access Token Cookie
  deleteCookie(event, tokenConfig.access.cookieName, {
    path: '/',
    httpOnly: true,
  })

  // 清除 Refresh Token Cookie
  deleteCookie(event, tokenConfig.refresh.cookieName, {
    path: '/',
    httpOnly: true,
  })
}

/**
 * 從 Event 取得 Access Token
 */
export function getAccessTokenFromEvent(event: H3Event): string | undefined {
  // 1. 優先從 Cookie 取得
  const token = getCookie(event, TOKEN_CONFIG.access.cookieName)

  if (token) {
    return token
  }

  // 2. 從 Authorization Header 取得 (Bearer token)
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return undefined
}

/**
 * 從 Event 取得 Refresh Token
 */
export function getRefreshTokenFromEvent(event: H3Event): string | undefined {
  return getCookie(event, TOKEN_CONFIG.refresh.cookieName)
}

/**
 * 產生隨機 Token ID (用於 Refresh Token)
 */
export function generateTokenId(): string {
  return crypto.randomUUID()
}

/**
 * 檢查 Token 是否即將過期 (5分鐘內)
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = decodeToken(token) as JWTPayload
    if (!decoded || !decoded.exp) return true

    const now = Math.floor(Date.now() / 1000)
    const fiveMinutesFromNow = now + (5 * 60)

    return decoded.exp < fiveMinutesFromNow
  }
  catch {
    return true
  }
}

/**
 * Token 工具集合 (便於統一匯出)
 */
export const jwtUtils = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromEvent,
  getRefreshTokenFromEvent,
  generateTokenId,
  isTokenExpiringSoon,
}

export default jwtUtils
