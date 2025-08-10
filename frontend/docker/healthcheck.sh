#!/bin/sh

# Personal Finance Manager - Health Check Script
# 檢查應用程式是否正常運行

set -e

# 預設配置
HOST=${HEALTH_CHECK_HOST:-"127.0.0.1"}
PORT=${PORT:-3000}
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-10}

# 健康檢查端點
HEALTH_ENDPOINT="http://${HOST}:${PORT}/api/health"

echo "🔍 Checking application health at ${HEALTH_ENDPOINT}..."

# 使用 wget 檢查健康狀態（Alpine Linux 預設包含 wget）
if wget --quiet --timeout=${TIMEOUT} --tries=1 --spider "${HEALTH_ENDPOINT}" >/dev/null 2>&1; then
    echo "✅ Health check passed - Application is healthy"
    exit 0
else
    echo "❌ Health check failed - Application is not responding"
    exit 1
fi