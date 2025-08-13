export default defineEventHandler(async (event) => {
  if (event.node.req.url?.startsWith('/api/')) {
    const origin = getHeader(event, 'origin')
    const platform = getHeader(event, 'x-client-platform')
    
    setHeaders(event, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Platform',
      // 只有 web 平台才允許 credentials
      'Access-Control-Allow-Credentials': platform === 'web' ? 'true' : 'false',
      'Access-Control-Max-Age': '86400',
    })

    if (event.node.req.method === 'OPTIONS') {
      setResponseStatus(event, 200)
      return ''
    }
  }
})
