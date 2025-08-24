<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div class="text-center">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg
                class="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
            <h1 class="text-2xl sm:text-4xl font-bold text-white">
              AI 智能分析
            </h1>
          </div>
          <p class="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto px-4">
            運用人工智慧深度分析您的財務狀況，提供個人化的理財建議和洞察
          </p>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- AI 連接狀態卡片 -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg">
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
                    d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">
                AI 連接狀態
              </h2>
            </div>
            <button
              :disabled="connectionLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              @click="testConnection"
            >
              <span
                v-if="connectionLoading"
                class="flex items-center gap-2"
              >
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                測試中...
              </span>
              <span v-else>測試連接</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="connectionResult"
            class="space-y-4"
          >
            <div
              v-if="connectionResult.success"
              class="flex items-center gap-2 text-green-600"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="font-medium">AI 服務正常運作</span>
            </div>
            <div
              v-else
              class="flex items-center gap-2 text-red-600"
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
              <span class="font-medium">AI 服務連接失敗</span>
            </div>

            <div
              v-if="connectionResult.success && connectionResult.data"
              class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
            >
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm text-gray-600">
                  OpenAI 狀態
                </div>
                <div class="font-semibold text-gray-900">
                  {{ connectionResult.data.openAI?.connected ? '已連接' : '未連接' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm text-gray-600">
                  快取狀態
                </div>
                <div class="font-semibold text-gray-900">
                  {{ connectionResult.data.cache?.available ? '可用' : '不可用' }}
                </div>
              </div>
              <div
                v-if="connectionResult.data.openAI?.usage"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="text-sm text-gray-600">
                  使用統計
                </div>
                <div class="font-semibold text-gray-900">
                  {{ connectionResult.data.openAI.usage.totalTokens }} tokens
                </div>
              </div>
            </div>
          </div>
          <div
            v-else-if="!connectionLoading"
            class="text-gray-500 text-center py-4"
          >
            點擊「測試連接」檢查 AI 服務狀態
          </div>
        </div>
      </div>

      <!-- 財務健康診斷 -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-100 rounded-lg">
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
              <h2 class="text-xl font-semibold text-gray-900">
                財務健康診斷
              </h2>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                v-model="diagnosisOptions.timeRange"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1M">
                  近 1 個月
                </option>
                <option value="3M">
                  近 3 個月
                </option>
                <option value="6M">
                  近 6 個月
                </option>
                <option value="1Y">
                  近 1 年
                </option>
              </select>
              <button
                :disabled="diagnosisLoading"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                @click="runHealthDiagnosis"
              >
                <span
                  v-if="diagnosisLoading"
                  class="flex items-center justify-center gap-2"
                >
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  分析中...
                </span>
                <span v-else>開始分析</span>
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="diagnosisResult && diagnosisResult.success"
            class="space-y-6"
          >
            <!-- 健康評分 -->
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <div class="text-center">
                <div
                  class="text-4xl sm:text-5xl font-bold"
                  :class="getGradeColor(diagnosisResult.data.grade)"
                >
                  {{ diagnosisResult.data.healthScore }}
                </div>
                <div class="text-lg font-semibold text-gray-600">
                  {{ diagnosisResult.data.grade }} 等級
                </div>
              </div>
              <div class="flex-1 w-full">
                <div class="text-sm text-gray-600 mb-2">
                  財務健康評分
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all duration-1000"
                    :class="getScoreBarColor(diagnosisResult.data.healthScore)"
                    :style="`width: ${diagnosisResult.data.healthScore}%`"
                  />
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ formatHealthScore(diagnosisResult.data.healthScore) }}
                </div>
              </div>
            </div>

            <!-- 分析文字 -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-2">
                分析報告
              </h4>
              <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {{ diagnosisResult.data.analysis }}
              </p>
            </div>

            <!-- 建議列表 -->
            <div v-if="diagnosisResult.data.recommendations && diagnosisResult.data.recommendations.length > 0">
              <h4 class="font-semibold text-gray-900 mb-3">
                改善建議
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(recommendation, index) in diagnosisResult.data.recommendations"
                  :key="index"
                  class="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                >
                  <div class="p-1 bg-yellow-200 rounded-full mt-1">
                    <svg
                      class="w-3 h-3 text-yellow-600"
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
                  </div>
                  <p class="text-sm text-gray-700 leading-relaxed">
                    {{ recommendation }}
                  </p>
                </div>
              </div>
            </div>

            <!-- AI 標誌 -->
            <div class="text-xs text-gray-500 text-center">
              <span v-if="diagnosisResult.data.isAIGenerated">✨ AI 驅動分析</span>
              <span v-else>📊 本地計算分析</span>
              • 最後更新：{{ formatDate(diagnosisResult.data.lastUpdated) }}
            </div>
          </div>

          <div
            v-else-if="diagnosisResult && !diagnosisResult.success"
            class="text-center py-8"
          >
            <div class="text-red-600 font-medium mb-2">
              分析失敗
            </div>
            <div class="text-gray-600 text-sm">
              {{ diagnosisResult.error?.message || '未知錯誤' }}
            </div>
          </div>

          <div
            v-else-if="!diagnosisLoading"
            class="text-gray-500 text-center py-8"
          >
            選擇時間範圍並點擊「開始分析」獲取您的財務健康診斷
          </div>
        </div>
      </div>

      <!-- 快速洞察 -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-100 rounded-lg">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">
                快速洞察
              </h2>
            </div>
            <button
              :disabled="insightLoading"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              @click="getQuickInsight"
            >
              <span
                v-if="insightLoading"
                class="flex items-center gap-2"
              >
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                分析中...
              </span>
              <span v-else>獲取洞察</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="insightResult && insightResult.success"
            class="space-y-4"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">
                  總收入
                </div>
                <div class="text-xl font-bold text-blue-600">
                  NT$ {{ insightResult.data.summary.income.toLocaleString() }}
                </div>
              </div>
              <div class="bg-red-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">
                  總支出
                </div>
                <div class="text-xl font-bold text-red-600">
                  NT$ {{ insightResult.data.summary.expense.toLocaleString() }}
                </div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">
                  儲蓄率
                </div>
                <div class="text-xl font-bold text-green-600">
                  {{ insightResult.data.summary.savingsRate.toFixed(1) }}%
                </div>
              </div>
            </div>

            <div v-if="insightResult.data.keyFindings && insightResult.data.keyFindings.length > 0">
              <h4 class="font-semibold text-gray-900 mb-2">
                關鍵發現
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(finding, index) in insightResult.data.keyFindings"
                  :key="index"
                  class="flex items-center gap-2 text-sm text-gray-700"
                >
                  <div class="w-2 h-2 bg-blue-500 rounded-full" />
                  {{ finding }}
                </div>
              </div>
            </div>

            <div class="text-xs text-gray-500 text-center">
              <span v-if="insightResult.data.isAIGenerated">✨ AI 驅動分析</span>
              <span v-else>📊 本地計算分析</span>
            </div>
          </div>

          <div
            v-else-if="insightResult && !insightResult.success"
            class="text-center py-8"
          >
            <div class="text-red-600 font-medium mb-2">
              分析失敗
            </div>
            <div class="text-gray-600 text-sm">
              {{ insightResult.error?.message || '未知錯誤' }}
            </div>
          </div>

          <div
            v-else-if="!insightLoading"
            class="text-gray-500 text-center py-8"
          >
            點擊「獲取洞察」查看您的財務快速洞察
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

// Composables
const { testConnection: testAIConnection, getQuickInsight: getAIQuickInsight } = useAIAnalysis()
const { runDiagnosis, getGradeColor, formatHealthScore } = useFinancialHealth()

// 響應式數據
const connectionLoading = ref(false)
const connectionResult = ref<any>(null)

const diagnosisLoading = ref(false)
const diagnosisResult = ref<any>(null)
const diagnosisOptions = ref({
  timeRange: '3M' as '1M' | '3M' | '6M' | '1Y',
  useAI: true,
})

const insightLoading = ref(false)
const insightResult = ref<any>(null)

// 方法
const testConnection = async () => {
  connectionLoading.value = true
  try {
    const result = await testAIConnection({
      includeUsage: true,
      includeCacheStats: true,
    })
    connectionResult.value = { success: true, data: result }
  }
  catch (error) {
    connectionResult.value = {
      success: false,
      error: { message: error instanceof Error ? error.message : '連接失敗' },
    }
  }
  finally {
    connectionLoading.value = false
  }
}

const runHealthDiagnosis = async () => {
  diagnosisLoading.value = true
  try {
    const result = await runDiagnosis({
      timeRange: diagnosisOptions.value.timeRange,
      useAI: diagnosisOptions.value.useAI,
      includeRecommendations: true,
      detailLevel: 'detailed',
      language: 'zh-TW',
    })
    diagnosisResult.value = { success: true, data: result }
  }
  catch (error) {
    diagnosisResult.value = {
      success: false,
      error: { message: error instanceof Error ? error.message : '分析失敗' },
    }
  }
  finally {
    diagnosisLoading.value = false
  }
}

const getQuickInsight = async () => {
  insightLoading.value = true
  try {
    const result = await getAIQuickInsight({
      timeRange: '1M',
      useAI: false, // 使用本地計算確保穩定
    })
    insightResult.value = { success: true, data: result }
  }
  catch (error) {
    insightResult.value = {
      success: false,
      error: { message: error instanceof Error ? error.message : '洞察失敗' },
    }
  }
  finally {
    insightLoading.value = false
  }
}

const getScoreBarColor = (score: number) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-blue-500'
  if (score >= 70) return 'bg-yellow-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

// 頁面載入時自動測試連接
onMounted(() => {
  testConnection()
})
</script>

<style scoped>
/* 自定義動畫 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}
</style>
