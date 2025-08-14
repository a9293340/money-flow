<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-up">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center mr-3">
            <svg
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">
            系統配置資訊
          </h3>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="$emit('close')"
        >
          <svg
            class="w-5 h-5"
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

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-96">
        <!-- 平台資訊 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <div class="w-2 h-2 bg-blue-400 rounded-full mr-2" />
            平台配置
          </h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">平台類型</span>
                <div class="font-medium text-gray-900">
                  {{ platformConfig.platform }}
                </div>
              </div>
              <div>
                <span class="text-gray-500">Access Token</span>
                <div class="font-medium text-gray-900">
                  {{ platformConfig.accessTokenDuration }} 分鐘
                </div>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500">Refresh Token</span>
                <div class="font-medium text-gray-900">
                  {{ Math.floor(platformConfig.refreshTokenDuration / (24 * 60)) }} 天
                </div>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs text-gray-600">
                {{ platformConfig.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- API 資訊 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <div class="w-2 h-2 bg-green-400 rounded-full mr-2" />
            API 配置
          </h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-500">API URL</span>
                <div class="font-medium text-gray-900 break-all">
                  {{ apiUrl }}
                </div>
              </div>
              <div>
                <span class="text-gray-500">環境</span>
                <div class="font-medium text-gray-900">
                  {{ environment }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系統資訊 -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <div class="w-2 h-2 bg-purple-400 rounded-full mr-2" />
            系統資訊
          </h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-500">版本</span>
                <div class="font-medium text-gray-900">
                  {{ version }}
                </div>
              </div>
              <div>
                <span class="text-gray-500">建置時間</span>
                <div class="font-medium text-gray-900">
                  {{ buildTime }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center text-xs text-gray-500">
          <svg
            class="w-4 h-4 mr-1"
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
          僅供開發和技術支援使用
        </div>
        <button
          class="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-md hover:bg-primary-600 transition-colors"
          @click="$emit('open-debug')"
        >
          開啟調試模式
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getApiUrl, getTokenConfig } from '~/lib/utils/client'

interface Props {
  show: boolean
}

defineProps<Props>()

defineEmits<{
  'close': []
  'open-debug': []
}>()

// 取得平台配置
const platformConfig = getTokenConfig()

// API URL
const apiUrl = getApiUrl()

// 環境資訊
const environment = computed(() => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '開發環境'
    }
    else if (hostname.includes('staging')) {
      return '測試環境'
    }
    else {
      return '生產環境'
    }
  }
  return '未知環境'
})

// 版本資訊
const version = '1.0.0'
const buildTime = new Date().toLocaleString('zh-TW')
</script>

<style scoped>
.animate-scale-up {
  animation: scaleUp 0.2s ease-out;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
