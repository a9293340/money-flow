/**
 * Environment Health Check API
 * 檢查重要環境變數是否正確設置
 */

export default defineEventHandler(async (event) => {
  try {
    // 檢查重要環境變數
    const envChecks = {
      NODE_ENV: !!process.env.NODE_ENV,
      NUXT_HOST: !!process.env.NUXT_HOST,
      NUXT_PORT: !!process.env.NUXT_PORT,
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
    }

    const allHealthy = Object.values(envChecks).every(check => check === true)

    // 設置 Cache-Control 防止緩存
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    if (!allHealthy) {
      setResponseStatus(event, 503)
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      checks: envChecks,
      missing: Object.entries(envChecks)
        .filter(([_, value]) => !value)
        .map(([key]) => key),
    }
  }
  catch (error) {
    setResponseStatus(event, 500)

    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Environment check failed',
    }
  }
})
