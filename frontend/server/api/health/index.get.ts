export default defineEventHandler(async (event) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Personal Finance Manager',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    setResponseStatus(event, 200)
    return health
  }
  catch (error) {
    console.error('Basic health check failed:', error)

    setResponseStatus(event, 503)
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})