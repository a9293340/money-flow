export default defineEventHandler(async (event) => {
  // 設定 CORS headers for all API routes
  if (event.node.req.url?.startsWith('/api/')) {
    // 取得 Origin header
    const origin = getHeader(event, 'origin')
    
    setHeaders(event, {
      // 根據請求的 origin 設定 CORS，支援 Tauri 應用
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Platform',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    })

    // Handle preflight OPTIONS requests
    if (event.node.req.method === 'OPTIONS') {
      setResponseStatus(event, 200)
      return ''
    }
  }
})
