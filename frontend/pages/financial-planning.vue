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
            </div>

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
          </div>

          <!-- 快速操作 -->
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              快速操作
            </h2>

            <div class="space-y-3">
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
            </div>
          </div>
        </div>

        <!-- AI 分析結果區塊 -->
        <div v-if="hasProfile && analysisResult">
          <FinancialPlanningResult :analysis-result="analysisResult" />
        </div>

        <!-- Phase 3 功能說明 -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div class="flex items-start">
            <div class="text-green-400 mr-3 mt-1">
              ✅
            </div>
            <div>
              <h3 class="text-green-900 font-medium mb-2">
                Phase 3 - AI 智能分析已上線
              </h3>
              <ul class="text-green-800 text-sm space-y-1">
                <li>• OpenAI GPT-4 驅動的智能財務分析</li>
                <li>• 個人化投資建議和資產配置</li>
                <li>• 預算規劃和儲蓄目標設定</li>
                <li>• 分析結果 7 天有效期限制</li>
                <li>• 完整的風險評估和財務健康度評分</li>
              </ul>
            </div>
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
const { result: analysisResult } = useFinancialAnalysis()

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

const handleDeleteProfile = async () => {
  if (confirm('確定要清除問卷資料嗎？此操作無法復原。')) {
    const result = await deleteProfile()

    if (result.success) {
      console.log('問卷資料已清除')
    }
  }
}

// =========================
// Lifecycle
// =========================

onMounted(() => {
  // 頁面載入完成，資料已在 composable 中自動載入
})
</script>
