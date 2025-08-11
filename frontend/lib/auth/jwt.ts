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

// Token 配置
const TOKEN_CONFIG = {
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

/**
 * 產生 Access Token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  const options: SignOptions = {
    expiresIn: TOKEN_CONFIG.access.expiresIn,
    issuer: 'money-flow',
    audience: 'money-flow-users',
  }

  return jwt.sign(payload, config.jwtSecret as string, options)
}

/**
 * 產生 Refresh Token
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  const config = useRuntimeConfig()

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET 未設定')
  }

  const options: SignOptions = {
    expiresIn: TOKEN_CONFIG.refresh.expiresIn,
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
 * 設定 Cookie 選項
 */
function getCookieOptions(isRefreshToken = false) {
  const config = useRuntimeConfig()
  const isDevelopment = config.public.nodeEnv === 'development'

  return {
    httpOnly: true,
    secure: !isDevelopment, // 開發環境可使用 HTTP
    sameSite: 'lax' as const,
    maxAge: isRefreshToken ? TOKEN_CONFIG.refresh.maxAge : TOKEN_CONFIG.access.maxAge,
    path: '/',
  }
}

/**
 * 設定認證 Cookies
 */
export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string) {
  // 設定 Access Token Cookie
  setCookie(event, TOKEN_CONFIG.access.cookieName, accessToken, getCookieOptions(false))

  // 設定 Refresh Token Cookie
  setCookie(event, TOKEN_CONFIG.refresh.cookieName, refreshToken, getCookieOptions(true))
}

/**
 * 清除認證 Cookies
 */
export function clearAuthCookies(event: H3Event) {
  // 清除 Access Token Cookie
  deleteCookie(event, TOKEN_CONFIG.access.cookieName, {
    path: '/',
    httpOnly: true,
  })

  // 清除 Refresh Token Cookie
  deleteCookie(event, TOKEN_CONFIG.refresh.cookieName, {
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
