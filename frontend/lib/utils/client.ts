/**
 * 客戶端工具函數
 * 處理客戶端相關的資訊擷取
 */

import type { H3Event } from 'h3'
import { getHeader } from 'h3'

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
