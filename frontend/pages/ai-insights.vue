<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="text-center">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-white">
              AI 智能分析
            </h1>
          </div>
          <p class="text-blue-100 text-lg max-w-2xl mx-auto">
            運用人工智慧深度分析您的財務狀況，提供個人化的理財建議和洞察
          </p>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 開發中提示 -->
      <div class="text-center py-16">
        <div class="inline-flex items-center gap-3 p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <div class="text-left">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              AI 智能分析正在開發中
            </h3>
            <p class="text-gray-600">
              Phase 1.1: 環境準備與基礎架構 ✅<br>
              即將推出：財務健康診斷功能
            </p>
          </div>
        </div>
      </div>

      <!-- 預告功能區塊 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <!-- 財務健康診斷 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-50">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-green-100 rounded-xl">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              財務健康診斷
            </h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            AI 分析您的收支狀況，提供 1-100 分的健康評分和改善建議
          </p>
          <div class="text-xs text-blue-600 font-medium">
            Phase 1 開發中...
          </div>
        </div>

        <!-- 智能預算建議 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-30">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-blue-100 rounded-xl">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              智能預算建議
            </h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            根據消費習慣推薦合理的預算分配和節省方案
          </p>
          <div class="text-xs text-gray-400 font-medium">
            Phase 2 規劃中...
          </div>
        </div>

        <!-- AI 對話諮詢 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-30">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-purple-100 rounded-xl">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              AI 對話諮詢
            </h3>
          </div>
          <p class="text-gray-600 text-sm mb-4">
            與 AI 財務顧問對話，獲得個性化理財問題解答
          </p>
          <div class="text-xs text-gray-400 font-medium">
            Phase 3 規劃中...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 頁面 metadata
definePageMeta({
  title: 'AI 智能分析',
  requiresAuth: true,
})

// SEO
useHead({
  title: 'AI 智能分析 - Money Flow',
  meta: [
    {
      name: 'description',
      content: '運用人工智慧分析您的財務狀況，提供個人化理財建議和洞察',
    },
  ],
})
</script>

<style scoped>
/* 自定義樣式 */
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}
</style>
