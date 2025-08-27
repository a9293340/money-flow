<!--
  財務規劃分析結果顯示組件
  顯示 AI 分析後的詳細結果和建議
-->
<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- 頁面標題 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        AI 財務分析報告
      </h1>
      <p class="text-gray-600">
        基於您的財務問卷，AI 為您量身定制的財務規劃建議
      </p>
    </div>

    <!-- 載入狀態 -->
    <div
      v-if="isAnalyzing"
      class="bg-white rounded-lg shadow p-8 text-center"
    >
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        AI 正在分析您的財務狀況...
      </h2>
      <p class="text-gray-600 mb-4">
        預估還需要 {{ estimatedTime }} 秒
      </p>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-purple-600 h-2 rounded-full transition-all duration-500"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            分析失敗
          </h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error }}
          </div>
          <div class="mt-4">
            <button
              class="text-sm bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200 transition-colors"
              @click="retryAnalysis"
            >
              重新分析
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析結果 -->
    <div
      v-else-if="currentResult"
      class="space-y-8"
    >
      <!-- 財務健康度總覽 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          財務健康度評估
        </h2>
        <div class="flex items-center mb-4">
          <div class="mr-6">
            <div
              class="text-4xl font-bold mb-1"
              :class="getScoreColor(currentResult.analysis.healthScore)"
            >
              {{ currentResult.analysis.healthScore }}
            </div>
            <div class="text-sm text-gray-500">
              財務健康度
            </div>
          </div>
          <div class="flex-1">
            <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                class="h-4 rounded-full transition-all duration-1000"
                :class="getScoreBg(currentResult.analysis.healthScore)"
                :style="{ width: `${currentResult.analysis.healthScore}%` }"
              />
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2">
            AI 分析摘要
          </h3>
          <p class="text-gray-700 leading-relaxed">
            {{ currentResult.analysis.summary }}
          </p>
        </div>
      </div>

      <!-- 個人化建議 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          個人化建議
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="recommendation in currentResult.recommendations"
            :key="recommendation.id"
            class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            :class="getPriorityBorder(recommendation.priority)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center">
                <span class="text-lg mr-2">
                  {{ getPriorityIcon(recommendation.priority) }}
                </span>
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getPriorityClass(recommendation.priority)"
                >
                  {{ getPriorityText(recommendation.priority) }}
                </span>
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">
              {{ recommendation.title }}
            </h3>
            <p class="text-gray-600 text-sm mb-3">
              {{ recommendation.description }}
            </p>
            <div
              v-if="recommendation.actionSteps && recommendation.actionSteps.length > 0"
              class="border-t pt-3"
            >
              <h4 class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                行動步驟
              </h4>
              <ul class="text-xs text-gray-600 space-y-1">
                <li
                  v-for="step in recommendation.actionSteps.slice(0, 3)"
                  :key="step"
                  class="flex items-start"
                >
                  <span class="text-gray-400 mr-2">•</span>
                  <span>{{ step }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 預算建議 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          個人化預算規劃
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 預算分配餅圖 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              建議月預算分配
            </h3>
            <div class="space-y-3">
              <div
                v-for="category in currentResult.budgetSuggestions.categories"
                :key="category.name"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <div
                    class="w-4 h-4 rounded-full mr-3"
                    :style="{ backgroundColor: getCategoryColor(category.name) }"
                  />
                  <div>
                    <div class="font-medium text-gray-900">
                      {{ category.name }}
                    </div>
                    <div
                      v-if="category.description"
                      class="text-xs text-gray-500"
                    >
                      {{ category.description }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-gray-900">
                    ${{ category.amount.toLocaleString() }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ category.percentage }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 儲蓄目標 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              儲蓄目標
            </h3>
            <div class="bg-green-50 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-green-800 font-medium">建議月儲蓄</span>
                <span class="text-2xl font-bold text-green-900">
                  ${{ currentResult.budgetSuggestions.savingsTarget.toLocaleString() }}
                </span>
              </div>
              <div class="text-sm text-green-700">
                約佔收入的 {{ Math.round((currentResult.budgetSuggestions.savingsTarget / currentResult.budgetSuggestions.monthlyBudget) * 100) }}%
              </div>
            </div>

            <!-- 負債還款計劃 -->
            <div
              v-if="currentResult.budgetSuggestions.debtPayoffPlan"
              class="bg-orange-50 rounded-lg p-4"
            >
              <h4 class="font-medium text-orange-900 mb-3">
                負債還款計劃
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-orange-700">建議月還款</span>
                  <span class="font-semibold text-orange-900">
                    ${{ currentResult.budgetSuggestions.debtPayoffPlan.monthlyPayment.toLocaleString() }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-700">預計還清時間</span>
                  <span class="font-semibold text-orange-900">
                    {{ currentResult.budgetSuggestions.debtPayoffPlan.timeToPayoff }} 個月
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-700">總利息支出</span>
                  <span class="font-semibold text-orange-900">
                    ${{ currentResult.budgetSuggestions.debtPayoffPlan.totalInterest.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 投資建議 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          投資規劃建議
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              資產配置建議
            </h3>
            <div class="space-y-3">
              <div
                v-for="allocation in currentResult.investmentAdvice.recommendedAllocation"
                :key="allocation.type"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">
                    {{ allocation.type }}
                  </h4>
                  <span class="text-lg font-bold text-purple-600">
                    {{ allocation.percentage }}%
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                  {{ allocation.reasoning }}
                </p>
                <div
                  v-if="allocation.examples && allocation.examples.length > 0"
                  class="text-xs text-gray-500"
                >
                  範例：{{ allocation.examples.join('、') }}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              投資建議摘要
            </h3>
            <div class="bg-purple-50 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-purple-800 font-medium">建議月投資金額</span>
                <span class="text-2xl font-bold text-purple-900">
                  ${{ currentResult.investmentAdvice.monthlyInvestmentSuggestion.toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">
                預期年化報酬率
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">保守型策略</span>
                  <span class="font-semibold text-gray-900">
                    {{ currentResult.investmentAdvice.expectedReturns.conservative }}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">平衡型策略</span>
                  <span class="font-semibold text-gray-900">
                    {{ currentResult.investmentAdvice.expectedReturns.moderate }}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">積極型策略</span>
                  <span class="font-semibold text-gray-900">
                    {{ currentResult.investmentAdvice.expectedReturns.aggressive }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 目標達成策略 -->
      <div
        v-if="currentResult.goalStrategies && currentResult.goalStrategies.length > 0"
        class="bg-white rounded-lg shadow p-6"
      >
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          目標達成策略
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="strategy in currentResult.goalStrategies"
            :key="strategy.goalId"
            class="border rounded-lg p-4"
          >
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ strategy.goalName }}
              </h3>
              <div class="text-sm text-gray-600 space-y-1">
                <div>目標金額：${{ strategy.targetAmount.toLocaleString() }}</div>
                <div>時間期限：{{ strategy.timeframe }} 個月</div>
                <div>每月所需：${{ strategy.monthlyRequired.toLocaleString() }}</div>
              </div>
            </div>

            <div class="bg-gray-50 rounded p-3 mb-4">
              <h4 class="font-medium text-gray-900 mb-2">
                策略建議
              </h4>
              <p class="text-sm text-gray-700">
                {{ strategy.strategy }}
              </p>
            </div>

            <div
              v-if="strategy.milestones && strategy.milestones.length > 0"
            >
              <h4 class="font-medium text-gray-900 mb-2">
                里程碑
              </h4>
              <div class="space-y-2">
                <div
                  v-for="milestone in strategy.milestones.slice(0, 3)"
                  :key="milestone.month"
                  class="flex justify-between items-center text-sm"
                >
                  <span class="text-gray-600">第{{ milestone.month }}個月</span>
                  <span class="font-semibold text-gray-900">
                    ${{ milestone.target.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無分析結果時的提示 -->
    <div
      v-else
      class="bg-gray-50 rounded-lg p-8 text-center"
    >
      <div class="text-gray-400 mb-4">
        📊
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        暫無分析結果
      </h2>
      <p class="text-gray-600">
        請先完成財務問卷，AI 將為您提供個人化的財務建議
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FinancialAnalysisResult } from '~/lib/models/financial-analysis'

interface Props {
  analysisResult?: FinancialAnalysisResult | null
}

const props = withDefaults(defineProps<Props>(), {
  analysisResult: null,
})

// 使用 financial analysis composable
const { useFinancialAnalysis } = await import('~/composables/useFinancialAnalysis')
const {
  isAnalyzing,
  progress,
  estimatedTime,
  error,
  result,
} = useFinancialAnalysis()

// 如果有傳入的分析結果，使用它；否則使用 composable 的結果
const currentResult = computed(() => props.analysisResult || result.value)

// 重試分析
const retryAnalysis = () => {
  // 這裡可以重新觸發分析，需要有原始的財務問卷資料
  console.log('重試分析功能待實作')
}

// 顏色相關的輔助函數
const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreBg = (score: number) => {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return '🔴'
    case 'medium': return '🟡'
    case 'low': return '🟢'
    default: return '📋'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高優先級'
    case 'medium': return '中優先級'
    case 'low': return '低優先級'
    default: return '一般'
  }
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityBorder = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-red-200'
    case 'medium': return 'border-yellow-200'
    case 'low': return 'border-green-200'
    default: return 'border-gray-200'
  }
}

const getCategoryColor = (categoryName: string) => {
  const colors = {
    住房: '#3B82F6', // blue
    食物: '#10B981', // green
    交通: '#F59E0B', // yellow
    娛樂: '#EF4444', // red
    醫療: '#8B5CF6', // purple
    教育: '#06B6D4', // cyan
    儲蓄: '#059669', // emerald
    其他: '#6B7280', // gray
  }
  return colors[categoryName as keyof typeof colors] || '#6B7280'
}
</script>
