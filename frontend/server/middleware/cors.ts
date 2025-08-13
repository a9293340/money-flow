export default defineEventHandler(async (event) => {
  if (event.node.req.url?.startsWith('/api/')) {
    const origin = getHeader(event, 'origin')
    const platform = getHeader(event, 'x-client-platform')
    
    // 對於 OPTIONS preflight，瀏覽器不會發送自定義 headers
    // 所以我們需要檢查 origin 來判斷是否為 Tauri 應用
    const isTauriApp = origin?.includes('tauri.localhost') || origin?.startsWith('tauri://')
    
    setHeaders(event, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Platform',
      // Tauri 應用不使用 credentials，其他情況允許
      'Access-Control-Allow-Credentials': isTauriApp ? 'false' : 'true',
      'Access-Control-Max-Age': '86400',
    })

    if (event.node.req.method === 'OPTIONS') {
      setResponseStatus(event, 200)
      return ''
    }
  }
})
