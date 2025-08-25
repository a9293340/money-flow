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
          >
            <!-- 檢查數據是否完整 -->
            <div
              v-if="!isCompleteDiagnosis(diagnosisResult.data)"
              class="bg-amber-50 rounded-xl p-6 border border-amber-200"
            >
              <div class="flex items-start gap-3">
                <svg
                  class="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div class="flex-1">
                  <h4 class="font-medium text-amber-900 mb-2">
                    數據不足提醒
                  </h4>
                  <div class="text-amber-800 text-sm leading-relaxed whitespace-pre-line">
                    {{ diagnosisResult.data.analysis }}
                  </div>
                  <div
                    v-if="diagnosisResult.data.recommendations && diagnosisResult.data.recommendations.length > 0"
                    class="mt-4"
                  >
                    <div class="space-y-2">
                      <div
                        v-for="(recommendation, index) in diagnosisResult.data.recommendations"
                        :key="index"
                        class="flex items-start gap-2"
                      >
                        <span class="text-amber-600">•</span>
                        <span class="text-amber-800 text-sm">{{ recommendation }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 完整分析報告 -->
            <div
              v-else
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
            <!-- 完整分析報告結束 -->
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

        <!-- 使用限制提示 -->
        <div
          v-if="!analysisLimits.health.canAnalyze && analysisLimits.health.waitTime"
          class="px-6 pb-4"
        >
          <div class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⏱️ 財務健康診斷每日限用一次，{{ analysisLimits.health.waitTime }}可再次使用
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

      <!-- Phase 2: 智能預算建議 -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-100 rounded-lg">
                <svg
                  class="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">
                智能預算建議
              </h2>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                v-model="budgetParams.budgetGoal"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="optimize">
                  優化現有預算
                </option>
                <option value="save">
                  增加儲蓄
                </option>
                <option value="reduce">
                  減少支出
                </option>
                <option value="balance">
                  平衡收支
                </option>
              </select>
              <button
                :disabled="budgetLoading"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                @click="getBudgetRecommendation"
              >
                <span
                  v-if="budgetLoading"
                  class="flex items-center gap-2"
                >
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  分析中...
                </span>
                <span v-else>獲取建議</span>
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="budgetResult && budgetResult.success"
            class="space-y-6"
          >
            <!-- 推薦預算結構 -->
            <div class="bg-emerald-50 rounded-lg p-4">
              <h3 class="font-medium text-emerald-900 mb-3">
                推薦預算分配
              </h3>
              <div class="space-y-2">
                <div
                  v-for="category in budgetResult.data.recommendedBudget.categories"
                  :key="category.name"
                  class="flex items-center justify-between"
                >
                  <span class="text-sm font-medium">{{ category.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">{{ category.percentage }}%</span>
                    <span class="font-semibold">{{ formatCurrency(category.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 建議摘要 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <h4 class="font-medium text-gray-900">
                  💡 主要建議
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="rec in formatRecommendations(budgetResult.data.recommendations).slice(0, 3)"
                    :key="rec"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-emerald-500 mt-1">•</span>
                    <span>{{ rec }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="hasImprovements(budgetResult.data.improvements)"
                class="space-y-3"
              >
                <h4 class="font-medium text-gray-900">
                  🎯 改善空間
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="improvement in formatRecommendations(budgetResult.data.improvements).slice(0, 3)"
                    :key="improvement"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-blue-500 mt-1">•</span>
                    <span>{{ improvement }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-else
                class="space-y-3"
              >
                <h4 class="font-medium text-gray-900">
                  ✅ 預算狀況
                </h4>
                <p class="text-sm text-green-600">
                  您的預算配置良好，無需特別改善！
                </p>
              </div>
            </div>

            <div class="text-right text-xs text-gray-500">
              信心度: {{ Math.round(budgetResult.data.confidence * 100) }}% |
              {{ budgetResult.cached ? '快取' : '即時' }}分析
            </div>
          </div>
          <div
            v-else
            class="text-gray-500 text-center py-8"
          >
            選擇預算目標並點擊「獲取建議」查看智能預算建議
          </div>
        </div>

        <!-- 使用限制提示 -->
        <div
          v-if="!analysisLimits.budget.canAnalyze && analysisLimits.budget.waitTime"
          class="px-6 pb-4"
        >
          <div class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⏱️ 智能預算建議每週限用一次，{{ analysisLimits.budget.waitTime }}可再次使用
          </div>
        </div>
      </div>

      <!-- Phase 2: 趨勢預測分析 -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <svg
                  class="w-6 h-6 text-indigo-600"
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
              <h2 class="text-xl font-semibold text-gray-900">
                趨勢預測分析
              </h2>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                v-model="trendParams.predictionPeriod"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1M">
                  預測 1 個月
                </option>
                <option value="3M">
                  預測 3 個月
                </option>
                <option value="6M">
                  預測 6 個月
                </option>
              </select>
              <button
                :disabled="trendLoading"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                @click="getTrendPrediction"
              >
                <span
                  v-if="trendLoading"
                  class="flex items-center gap-2"
                >
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  分析中...
                </span>
                <span v-else>預測趨勢</span>
              </button>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div
            v-if="trendResult && trendResult.success"
            class="space-y-6"
          >
            <!-- 預測數值 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{ formatCurrency(trendResult.data.predictions?.income?.predicted || 0) }}
                </div>
                <div class="text-sm text-gray-600">
                  預測收入
                </div>
                <div class="text-xs mt-1">
                  <span
                    :class="getTrendClass(trendResult.data.predictions?.income?.trend || 'stable')"
                  >
                    {{ getTrendLabel(trendResult.data.predictions?.income?.trend || 'stable') }}
                  </span>
                </div>
              </div>
              <div class="bg-red-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-red-600">
                  {{ formatCurrency(trendResult.data.predictions?.expenses?.predicted || 0) }}
                </div>
                <div class="text-sm text-gray-600">
                  預測支出
                </div>
                <div class="text-xs mt-1">
                  <span
                    :class="getTrendClass(trendResult.data.predictions?.expenses?.trend || 'stable')"
                  >
                    {{ getTrendLabel(trendResult.data.predictions?.expenses?.trend || 'stable') }}
                  </span>
                </div>
              </div>
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ formatCurrency(trendResult.data.predictions?.savings?.predicted || 0) }}
                </div>
                <div class="text-sm text-gray-600">
                  預測儲蓄
                </div>
                <div class="text-xs mt-1">
                  <span
                    :class="getTrendClass(trendResult.data.predictions?.savings?.trend || 'stable')"
                  >
                    {{ getTrendLabel(trendResult.data.predictions?.savings?.trend || 'stable') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 機會與風險 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-if="trendResult.data.opportunities.length > 0"
                class="space-y-3"
              >
                <h4 class="font-medium text-gray-900 flex items-center gap-2">
                  <span class="text-green-500">🌟</span>
                  機會點
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="opportunity in trendResult.data.opportunities.slice(0, 3)"
                    :key="opportunity"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-green-500 mt-1">•</span>
                    <span>{{ opportunity }}</span>
                  </li>
                </ul>
              </div>
              <div
                v-if="trendResult.data.risks.length > 0"
                class="space-y-3"
              >
                <h4 class="font-medium text-gray-900 flex items-center gap-2">
                  <span class="text-red-500">⚠️</span>
                  風險警示
                </h4>
                <ul class="space-y-1">
                  <li
                    v-for="risk in trendResult.data.risks.slice(0, 3)"
                    :key="risk"
                    class="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span class="text-red-500 mt-1">•</span>
                    <span>{{ risk }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="text-right text-xs text-gray-500">
              預測信心度: {{ Math.round(trendResult.data.confidence * 100) }}% |
              {{ trendResult.cached ? '快取' : '即時' }}分析
            </div>
          </div>
          <div
            v-else
            class="text-gray-500 text-center py-8"
          >
            選擇預測期間並點擊「預測趨勢」查看財務趨勢分析
          </div>
        </div>

        <!-- 使用限制提示 -->
        <div
          v-if="!analysisLimits.trend.canAnalyze && analysisLimits.trend.waitTime"
          class="px-6 pb-4"
        >
          <div class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⏱️ 趨勢預測每週限用一次，{{ analysisLimits.trend.waitTime }}可再次使用
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
const { getQuickInsight: getAIQuickInsight } = useAIAnalysis()
const { runDiagnosis, getGradeColor, formatHealthScore } = useFinancialHealth()

// 響應式數據

const diagnosisLoading = ref(false)
const diagnosisResult = ref<any>(null)
const diagnosisOptions = ref({
  timeRange: '3M' as '1M' | '3M' | '6M' | '1Y',
  useAI: true,
})

const insightLoading = ref(false)
const insightResult = ref<any>(null)

// 分析使用限制狀態
const analysisLimits = ref({
  health: { canAnalyze: true, waitTime: null, nextAvailable: null },
  budget: { canAnalyze: true, waitTime: null, nextAvailable: null },
  trend: { canAnalyze: true, waitTime: null, nextAvailable: null },
})

// Phase 2: 智能預算建議狀態
const budgetLoading = ref(false)
const budgetResult = ref<any>(null)
const budgetParams = ref({
  analysisRange: '3M' as '1M' | '3M' | '6M' | '1Y',
  budgetGoal: 'optimize' as 'optimize' | 'save' | 'reduce' | 'balance',
  focusAreas: [] as string[],
})

// Phase 2: 趨勢預測狀態
const trendLoading = ref(false)
const trendResult = ref<any>(null)
const trendParams = ref({
  analysisRange: '6M' as '1M' | '3M' | '6M' | '1Y',
  predictionPeriod: '3M' as '1M' | '3M' | '6M',
  focusMetrics: 3,
})

// 方法

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

// Phase 2: 智能預算建議方法
const getBudgetRecommendation = async () => {
  budgetLoading.value = true
  try {
    const response = await $fetch('/api/ai-insights/budget-recommendations', {
      method: 'POST',
      body: budgetParams.value,
    })
    budgetResult.value = response
  }
  catch (error: any) {
    budgetResult.value = {
      success: false,
      error: { message: error.data?.message || '預算建議獲取失敗' },
    }
  }
  finally {
    budgetLoading.value = false
  }
}

// Phase 2: 趨勢預測分析方法
const getTrendPrediction = async () => {
  trendLoading.value = true
  try {
    const response = await $fetch('/api/ai-insights/trend-prediction', {
      method: 'POST',
      body: trendParams.value,
    })
    trendResult.value = response
  }
  catch (error: any) {
    trendResult.value = {
      success: false,
      error: { message: error.data?.message || '趨勢預測獲取失敗' },
    }
  }
  finally {
    trendLoading.value = false
  }
}

// 輔助方法
const getTrendClass = (trend: string) => {
  const classes = {
    increasing: 'text-green-600',
    decreasing: 'text-red-600',
    stable: 'text-gray-600',
  }
  return classes[trend as keyof typeof classes] || 'text-gray-600'
}

const getTrendLabel = (trend: string) => {
  const labels = {
    increasing: '↗️ 上升',
    decreasing: '↘️ 下降',
    stable: '➡️ 穩定',
  }
  return labels[trend as keyof typeof labels] || trend
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount)
}

// 格式化建議內容，將 JSON 對象轉換為可讀文本
const formatRecommendations = (items: any[]) => {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => {
    // 如果是字符串，直接返回
    if (typeof item === 'string') {
      return item
    }

    // 如果是對象，嘗試提取有意義的文本
    if (typeof item === 'object' && item !== null) {
      // 查找常見的文本字段
      const textFields = ['text', 'description', 'content', 'message', 'recommendation', 'suggestion']
      for (const field of textFields) {
        if (item[field] && typeof item[field] === 'string') {
          return item[field]
        }
      }

      // 如果有 category 和其他信息，組合成句子
      if (item.category && item.suggestedAmount) {
        return `建議將 ${item.category} 調整為 ${formatCurrency(item.suggestedAmount)}`
      }

      if (item.category && item.reason) {
        return `${item.category}：${item.reason}`
      }

      // 最後嘗試將對象轉換為較友好的格式
      return JSON.stringify(item).replace(/[{}",]/g, ' ').trim()
    }

    return String(item)
  }).filter(text => text && text.length > 0)
}

// 檢查是否有改善建議
const hasImprovements = (improvements: any[]) => {
  if (!Array.isArray(improvements)) {
    return false
  }

  const formatted = formatRecommendations(improvements)
  return formatted.length > 0
}

// 檢查診斷結果是否完整
const isCompleteDiagnosis = (data: any) => {
  // 如果没有健康評分或為 null、grade 為 N/A，則視為不完整
  if (!data.healthScore || data.healthScore === null || data.grade === 'N/A') {
    return false
  }

  // 如果分析內容包含「無法進行全面的評估」或類似提示，則視為不完整
  if (data.analysis && (
    data.analysis.includes('無法進行全面的評估')
    || data.analysis.includes('需要更多資訊')
    || data.analysis.includes('數據不足')
    || data.analysis.includes('資料不充分')
  )) {
    return false
  }

  return true
}

// 載入緩存的分析結果
const loadCachedResults = async () => {
  try {
    console.log('🔄 載入已緩存的分析結果...')
    const response: any = await $fetch('/api/ai-insights/cached-results')

    if (response.success && response.data) {
      // 載入健康分析結果
      if (response.data.health.hasResult) {
        diagnosisResult.value = {
          success: true,
          data: response.data.health.result,
          message: '已載入上次分析結果',
          cached: true,
        }
      }

      // 載入預算建議結果
      if (response.data.budget.hasResult) {
        budgetResult.value = {
          success: true,
          data: response.data.budget.result,
          message: '已載入上次分析結果',
          cached: true,
        }
      }

      // 載入趨勢預測結果
      if (response.data.trend.hasResult) {
        trendResult.value = {
          success: true,
          data: response.data.trend.result,
          message: '已載入上次分析結果',
          cached: true,
        }
      }

      // 儲存使用限制狀態
      analysisLimits.value = {
        health: {
          canAnalyze: response.data.health.canAnalyze,
          waitTime: response.data.health.waitTime || null,
          nextAvailable: response.data.health.nextAvailable || null,
        },
        budget: {
          canAnalyze: response.data.budget.canAnalyze,
          waitTime: response.data.budget.waitTime || null,
          nextAvailable: response.data.budget.nextAvailable || null,
        },
        trend: {
          canAnalyze: response.data.trend.canAnalyze,
          waitTime: response.data.trend.waitTime || null,
          nextAvailable: response.data.trend.nextAvailable || null,
        },
      }

      console.log('✅ 已載入緩存分析結果')
    }
  }
  catch (error) {
    console.error('❌ 載入緩存結果失敗:', error)
    // 載入失敗不影響正常功能使用
  }
}

// 頁面載入時自動載入結果
onMounted(async () => {
  await loadCachedResults()
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
