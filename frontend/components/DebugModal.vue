<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click="closeModal"
  >
    <div
      class="relative bg-white rounded-xl shadow-elevated max-w-2xl w-full max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <!-- 標題列 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          🔧 調試資訊
        </h3>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          @click="closeModal"
        >
          <svg
            class="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- 內容區域 -->
      <div class="overflow-y-auto max-h-[calc(80vh-120px)] p-6 space-y-6">
        <!-- 平台資訊 -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            平台資訊
          </h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><strong>檢測平台:</strong> <span class="font-mono">{{ debugInfo.platform.detected }}</span></div>
            <div><strong>Token 有效期:</strong> {{ debugInfo.platform.accessTokenDuration }} 分鐘</div>
            <div><strong>描述:</strong> {{ debugInfo.platform.description }}</div>
          </div>
        </div>

        <!-- Token 資訊 -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m3 0a2 2 0 012 2v1M9 7h6"
              />
            </svg>
            Token 資訊
          </h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><strong>登入狀態:</strong> <span :class="debugInfo.token.isLoggedIn ? 'text-success-600' : 'text-gray-500'">{{ debugInfo.token.isLoggedIn ? '✓ 已登入' : '✗ 未登入' }}</span></div>
            <div v-if="debugInfo.token.tokenExists">
              <strong>Token 過期時間:</strong> <span class="font-mono text-xs">{{ debugInfo.token.expirationTime || 'N/A' }}</span>
            </div>
            <div v-if="debugInfo.token.tokenExists">
              <strong>剩餘時間:</strong> {{ debugInfo.token.remainingTime || 'N/A' }}
            </div>
            <div><strong>Token 存在:</strong> <span :class="debugInfo.token.tokenExists ? 'text-success-600' : 'text-gray-500'">{{ debugInfo.token.tokenExists ? '✓' : '✗' }}</span></div>
          </div>
        </div>

        <!-- 環境資訊 -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-success-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
              />
            </svg>
            環境資訊
          </h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><strong>當前 URL:</strong> <span class="font-mono text-xs break-all">{{ debugInfo.environment.url }}</span></div>
            <div><strong>Protocol:</strong> <span class="font-mono">{{ debugInfo.environment.protocol }}</span></div>
            <div><strong>Hostname:</strong> <span class="font-mono">{{ debugInfo.environment.hostname }}</span></div>
            <div><strong>API Base URL:</strong> <span class="font-mono text-xs break-all">{{ debugInfo.environment.apiUrl }}</span></div>
          </div>
        </div>

        <!-- Tauri 檢測 -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-warning-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            Tauri 檢測
          </h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><strong>__TAURI__:</strong> <span :class="debugInfo.tauri.hasTauri ? 'text-success-600' : 'text-danger-600'">{{ debugInfo.tauri.hasTauri ? '✓ 存在' : '✗ 不存在' }}</span></div>
            <div><strong>__TAURI_INVOKE__:</strong> <span :class="debugInfo.tauri.hasInvoke ? 'text-success-600' : 'text-danger-600'">{{ debugInfo.tauri.hasInvoke ? '✓ 存在' : '✗ 不存在' }}</span></div>
            <div><strong>Tauri Keys:</strong> <span class="font-mono text-xs">{{ debugInfo.tauri.windowKeys.join(', ') || '無' }}</span></div>
          </div>
        </div>

        <!-- User Agent -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            User Agent
          </h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <pre class="text-xs whitespace-pre-wrap break-all text-gray-700 font-mono">{{ debugInfo.userAgent.full }}</pre>
            <div class="mt-3 space-y-1 text-sm">
              <div><strong>包含 'android':</strong> <span :class="debugInfo.userAgent.hasAndroid ? 'text-success-600' : 'text-gray-500'">{{ debugInfo.userAgent.hasAndroid ? '✓' : '✗' }}</span></div>
              <div><strong>包含 'wry':</strong> <span :class="debugInfo.userAgent.hasWry ? 'text-success-600' : 'text-gray-500'">{{ debugInfo.userAgent.hasWry ? '✓' : '✗' }}</span></div>
              <div><strong>包含 'webkit':</strong> <span :class="debugInfo.userAgent.hasWebkit ? 'text-success-600' : 'text-gray-500'">{{ debugInfo.userAgent.hasWebkit ? '✓' : '✗' }}</span></div>
            </div>
          </div>
        </div>

        <!-- 系統資訊 -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-800 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            系統資訊
          </h4>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><strong>時間:</strong> {{ debugInfo.system.timestamp }}</div>
            <div><strong>時區:</strong> {{ debugInfo.system.timezone }}</div>
            <div><strong>語言:</strong> {{ debugInfo.system.language }}</div>
            <div><strong>螢幕尺寸:</strong> {{ debugInfo.system.screenSize }}</div>
          </div>
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div class="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
        <button
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          @click="copyToClipboard"
        >
          📋 複製資訊
        </button>
        <button
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          @click="closeModal"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTokenConfig } from '~/lib/utils/client'

interface Props {
  show: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 收集調試資訊
const debugInfo = computed(() => {
  const platformConfig = getTokenConfig()
  const now = new Date()

  let userAgent = 'N/A'
  let url = 'N/A'
  let protocol = 'N/A'
  let hostname = 'N/A'
  let hasTauri = false
  let hasInvoke = false
  let windowKeys: string[] = []

  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>
    hasTauri = !!(w.__TAURI__)
    hasInvoke = !!(w.__TAURI_INVOKE__)
    windowKeys = Object.keys(window).filter(key =>
      key.includes('TAURI') || key.includes('tauri'),
    )

    if (window.location) {
      url = window.location.href
      protocol = window.location.protocol
      hostname = window.location.hostname
    }
  }

  if (typeof navigator !== 'undefined') {
    userAgent = navigator.userAgent
  }

  const runtimeConfig = useRuntimeConfig()

  // Token 資訊檢查
  let tokenExists = false
  let expirationTime = 'N/A'
  let remainingTime = 'N/A'
  let isLoggedIn = false

  if (typeof document !== 'undefined') {
    // 檢查是否有 access token cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {} as Record<string, string>)

    tokenExists = !!(cookies.accessToken || cookies['access-token'])

    // 嘗試解析 JWT token 來取得過期時間（如果是 JWT 格式）
    try {
      const token = cookies.accessToken || cookies['access-token']
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000)
          expirationTime = expDate.toLocaleString()
          const now = new Date()
          const diff = expDate.getTime() - now.getTime()
          if (diff > 0) {
            const minutes = Math.floor(diff / (1000 * 60))
            remainingTime = `${minutes} 分鐘`
            isLoggedIn = true
          }
          else {
            remainingTime = '已過期'
          }
        }
      }
    }
    catch {
      // JWT 解析失敗，忽略
    }
  }

  return {
    platform: {
      detected: platformConfig.platform,
      accessTokenDuration: platformConfig.accessTokenDuration,
      description: platformConfig.description,
    },
    token: {
      tokenExists,
      expirationTime,
      remainingTime,
      isLoggedIn,
    },
    environment: {
      url,
      protocol,
      hostname,
      apiUrl: runtimeConfig.public.apiUrl,
    },
    tauri: {
      hasTauri,
      hasInvoke,
      windowKeys,
    },
    userAgent: {
      full: userAgent,
      hasAndroid: userAgent.toLowerCase().includes('android'),
      hasWry: userAgent.toLowerCase().includes('wry'),
      hasWebkit: userAgent.toLowerCase().includes('webkit'),
    },
    system: {
      timestamp: now.toLocaleString(),
      timezone: now.getTimezoneOffset(),
      language: typeof navigator !== 'undefined' ? navigator.language : 'N/A',
      screenSize: typeof window !== 'undefined' ? `${window.screen?.width || 0} x ${window.screen?.height || 0}` : 'N/A',
    },
  }
})

function closeModal() {
  emit('close')
}

async function copyToClipboard() {
  try {
    const text = JSON.stringify(debugInfo.value, null, 2)
    await navigator.clipboard.writeText(text)
    // 可以添加一個 toast 通知
  }
  catch (err) {
    console.error('Failed to copy debug info:', err)
  }
}
</script>
