export default defineEventHandler(async (event) => {
  if (event.node.req.url?.startsWith('/api/')) {
    setHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Platform',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
    })

    if (event.node.req.method === 'OPTIONS') {
      setResponseStatus(event, 200)
      return ''
    }
  }
})
