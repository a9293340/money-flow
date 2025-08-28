<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 頁面標題 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            AI 財務規劃
          </h1>
          <p class="text-gray-600">
            透過智能問卷了解您的財務狀況，獲得個人化的理財建議
          </p>
        </div>

        <!-- 問卷狀態卡片 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- 問卷狀態 -->
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">
                問卷狀態
              </h2>
              <ClientOnly>
                <div
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="{
                    'bg-green-100 text-green-800': hasProfile && profileSummary?.completionRate === 100,
                    'bg-yellow-100 text-yellow-800': hasProfile && (profileSummary?.completionRate ?? 0) < 100,
                    'bg-gray-100 text-gray-800': !hasProfile,
                  }"
                >
                  {{ getStatusText() }}
                </div>
                <template #fallback>
                  <div class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    載入中...
                  </div>
                </template>
              </ClientOnly>
            </div>

            <ClientOnly>
              <div
                v-if="hasProfile && profileSummary"
                class="space-y-3"
              >
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">完成度</span>
                    <span class="font-medium">{{ profileSummary.completionRate }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${profileSummary.completionRate}%` }"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ profileSummary.savingsRate }}%
                    </div>
                    <div class="text-xs text-gray-500">
                      儲蓄率
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ getRiskLevelText(profileSummary.riskLevel) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      風險偏好
                    </div>
                  </div>
                </div>

                <div
                  v-if="profileSummary.lastUpdated"
                  class="text-xs text-gray-500 pt-2"
                >
                  最後更新：{{ formatDate(profileSummary.lastUpdated) }}
                </div>
              </div>

              <div
                v-else
                class="text-center py-4"
              >
                <div class="text-gray-400 mb-2">
                  📋
                </div>
                <p class="text-sm text-gray-600">
                  尚未完成問卷評估
                </p>
              </div>

              <template #fallback>
                <div class="text-center py-4">
                  <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto" />
                    <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- 快速操作 -->
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              快速操作
            </h2>

            <div class="space-y-3">
              <ClientOnly>
                <button
                  :disabled="isLoading"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
                  @click="openModal"
                >
                  {{ hasProfile ? '重新評估' : '開始問卷評估' }}
                </button>

                <button
                  v-if="hasProfile"
                  :disabled="isLoading"
                  class="w-full bg-red-50 hover:bg-red-100 disabled:bg-gray-300 text-red-700 font-medium py-2 px-4 rounded-md border border-red-200 transition-colors"
                  @click="handleDeleteProfile"
                >
                  清除問卷資料
                </button>

                <template #fallback>
                  <button
                    disabled
                    class="w-full bg-gray-300 text-gray-500 font-medium py-3 px-4 rounded-md transition-colors"
                  >
                    載入中...
                  </button>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- 歷史記錄區塊 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              財務分析中心
            </h2>
            <p class="text-gray-600 text-sm">
              查看您的分析結果和歷史記錄
            </p>
          </div>

          <!-- 歷史記錄列表 -->
          <div v-if="!isAnalyzing">
            <FinancialAnalysisHistory
              ref="historyComponent"
              :selected-record-id="selectedRecordId"
              :is-loading-record="isLoadingRecord"
              @select-record="handleRecordSelect"
            />
          </div>

          <!-- AI 分析載入狀態 -->
          <div
            v-if="isAnalyzing"
            class="p-8 text-center border-t border-gray-200"
          >
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              AI 正在分析您的財務狀況...
            </h3>
            <p class="text-gray-600">
              這可能需要幾秒鐘的時間，請稍候
            </p>
          </div>

          <!-- AI 分析結果區塊 -->
          <div
            v-if="currentAnalysisResult || analysisResult"
            class="financial-result border-t border-gray-200"
          >
            <div class="p-6 bg-blue-50 border-b border-blue-200">
              <h3 class="text-lg font-semibold text-blue-900 mb-1">
                AI 分析報告
              </h3>
              <p class="text-blue-700 text-sm">
                基於您的財務問卷，為您量身定制的財務規劃建議
              </p>
            </div>
            <FinancialPlanningResult
              :analysis-result="currentAnalysisResult || analysisResult"
            />
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div
          v-if="error"
          class="mb-6"
        >
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="text-red-400 mr-3">
                ⚠️
              </div>
              <div>
                <h4 class="text-sm font-medium text-red-800">
                  發生錯誤
                </h4>
                <p class="mt-1 text-sm text-red-700">
                  {{ error }}
                </p>
                <button
                  class="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                  @click="clearError"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 問卷 Modal -->
    <QuestionnaireModal
      :show="isModalOpen"
      @close="closeModal"
      @complete="handleQuestionnaireComplete"
      @analysis-started="handleAnalysisStarted"
      @analysis-complete="handleAnalysisComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { IFinancialProfile } from '~/lib/models/financial-profile'
import type { FinancialAnalysisResult } from '~/lib/models/financial-analysis'
import { useFinancialProfile } from '~/composables/useFinancialProfile'

// =========================
// SEO and Meta
// =========================

definePageMeta({
  title: 'AI 財務規劃',
  requiresAuth: true,
})

useSeoMeta({
  title: 'AI 財務規劃 - Personal Finance Manager',
  description: '透過智能問卷了解您的財務狀況，獲得個人化的理財建議和規劃',
})

// =========================
// Composables
// =========================

const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  profile, // Phase 2+ 會使用，先保留
  isLoading,
  error,
  isModalOpen,
  hasProfile,
  openModal,
  closeModal,
  saveProfile,
  deleteProfile,
  clearError,
  getProfileSummary,
} = useFinancialProfile()

// AI 分析功能
const { useFinancialAnalysis } = await import('~/composables/useFinancialAnalysis')
const { result: analysisResult, isAnalyzing, loadLatestAnalysisResult } = useFinancialAnalysis()

// AI 分析狀態
const currentAnalysisResult = ref(null)
const showAnalysisResult = ref(false)

// 歷史記錄組件引用
const historyComponent = ref<{ loadHistory: () => Promise<void> } | null>(null)

// 當前選中的記錄 ID
const selectedRecordId = ref<string | null>(null)

// API 請求載入狀態
const isLoadingRecord = ref(false)

// 修復 SSR 水合問題
const isClientSide = ref(false)

// =========================
// Computed
// =========================

const profileSummary = computed(() => {
  return getProfileSummary()
})

// =========================
// Methods
// =========================

const getStatusText = () => {
  if (!hasProfile.value) return '未開始'
  const summary = profileSummary.value
  if (summary?.completionRate === 100) return '已完成'
  return '進行中'
}

const getRiskLevelText = (riskLevel: string) => {
  const riskMap: Record<string, string> = {
    conservative: '保守',
    moderate: '穩健',
    aggressive: '積極',
  }
  return riskMap[riskLevel] || '未設定'
}

const formatDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleQuestionnaireComplete = async (profileData: IFinancialProfile) => {
  const result = await saveProfile(profileData)

  if (result.success) {
    // 顯示成功訊息 (可以用 toast 或其他方式)
    console.log('問卷完成並儲存成功！', result.data)
  }
}

const handleAnalysisStarted = () => {
  console.log('🤖 AI 分析開始...')
  showAnalysisResult.value = false
}

const handleAnalysisComplete = (result: any) => {
  console.log('✅ AI 分析完成!', result)
  currentAnalysisResult.value = result
  showAnalysisResult.value = true
  // 關閉問卷 modal
  closeModal()

  // 刷新歷史記錄列表
  nextTick(async () => {
    if (historyComponent.value?.loadHistory) {
      await historyComponent.value.loadHistory()
    }

    // 滾動到結果區域
    const resultElement = document.querySelector('.financial-result')
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

const handleRecordSelect = async (record: any) => {
  console.log('📋 選擇歷史記錄:', record)

  // 設定載入狀態和選中狀態
  isLoadingRecord.value = true
  selectedRecordId.value = record.id

  // 載入完整的分析結果
  try {
    const response: any = await $fetch(`/api/financial-profile/${record.id}`)

    if (response.success && response.data) {
      console.log('✅ 成功載入歷史記錄詳情:', response.data)
      currentAnalysisResult.value = response.data
      showAnalysisResult.value = true

      // 滾動到結果區域
      nextTick(() => {
        const resultElement = document.querySelector('.financial-result')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }
    else {
      console.error('⚠️ 無效的回應格式:', response)
      selectedRecordId.value = null
    }
  }
  catch (error) {
    console.error('❌ 載入歷史記錄詳情失敗:', error)
    selectedRecordId.value = null
  }
  finally {
    isLoadingRecord.value = false
  }
}

const handleDeleteProfile = async () => {
  if (confirm('確定要清除問卷資料嗎？此操作無法復原。')) {
    const result = await deleteProfile()

    if (result.success) {
      // 清除所有分析結果狀態
      currentAnalysisResult.value = null
      showAnalysisResult.value = false

      console.log('問卷資料已清除')
    }
  }
}

// =========================
// Lifecycle
// =========================

onMounted(async () => {
  // 修復 SSR 水合問題
  isClientSide.value = true

  // 頁面載入完成，資料已在 composable 中自動載入

  // 載入最新的分析結果
  await loadLatestAnalysisResult()
})
</script>
