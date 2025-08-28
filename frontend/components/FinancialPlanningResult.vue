<!--
  財務規劃分析結果顯示組件
  顯示 AI 分析後的詳細結果和建議
-->
<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- 頁面標題和過期提醒 -->
    <div class="mb-8">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            AI 財務分析報告
          </h1>
          <p class="text-gray-600">
            基於您的財務問卷，AI 為您量身定制的財務規劃建議
          </p>
        </div>

        <!-- 分析日期顯示 -->
        <div
          v-if="currentResult"
          class="text-right"
        >
          <div class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <div class="flex items-center">
              <span class="mr-2">📊</span>
              <div>
                <div class="font-semibold">
                  分析報告
                </div>
                <div class="text-xs opacity-75">
                  {{ currentResult.expiresAt ? formatExpirationDate(currentResult.expiresAt.toString()) : '未設定' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div
      v-if="isAnalyzing"
      class="bg-white rounded-lg shadow p-8"
    >
      <!-- 進度概觀 -->
      <div class="text-center mb-6">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          AI 正在分析您的財務狀況
        </h2>
        <p class="text-gray-600 mb-4">
          第 {{ completedStagesCount + 1 }} / {{ totalStagesCount }} 階段 - {{ currentStage }}
        </p>

        <!-- 總進度條 -->
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            class="bg-purple-600 h-3 rounded-full transition-all duration-500 relative"
            :style="{ width: `${progress}%` }"
          >
            <div class="absolute right-0 top-0 h-3 w-3 bg-white rounded-full border-2 border-purple-600 -mr-1.5" />
          </div>
        </div>

        <div class="flex justify-between text-sm text-gray-600 mb-4">
          <span>{{ Math.round(progress) }}% 完成</span>
          <span>預估還需 {{ estimatedTime }} 秒</span>
        </div>
      </div>

      <!-- 階段詳細進度 -->
      <div class="space-y-3">
        <div
          v-for="(stage, index) in stages"
          :key="stage.id"
          class="flex items-center p-3 rounded-lg transition-all duration-300"
          :class="{
            'bg-green-50 border border-green-200': stage.completed,
            'bg-blue-50 border border-blue-200': currentStage === stage.name && !stage.completed,
            'bg-gray-50 border border-gray-100': currentStage !== stage.name && !stage.completed,
          }"
        >
          <!-- 狀態指示器 -->
          <div class="flex-shrink-0 mr-3">
            <div
              v-if="stage.completed"
              class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            >
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div
              v-else-if="currentStage === stage.name"
              class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse"
            >
              <div class="w-2 h-2 bg-white rounded-full" />
            </div>
            <div
              v-else
              class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
            >
              <span class="text-xs font-semibold text-gray-600">{{ index + 1 }}</span>
            </div>
          </div>

          <!-- 階段資訊 -->
          <div class="flex-grow">
            <div class="flex items-center justify-between mb-1">
              <h4
                class="font-medium"
                :class="{
                  'text-green-900': stage.completed,
                  'text-blue-900': currentStage === stage.name && !stage.completed,
                  'text-gray-600': currentStage !== stage.name && !stage.completed,
                }"
              >
                {{ stage.name }}
              </h4>

              <!-- 時間顯示 -->
              <span
                class="text-xs"
                :class="{
                  'text-green-600': stage.completed,
                  'text-blue-600': currentStage === stage.name && !stage.completed,
                  'text-gray-500': currentStage !== stage.name && !stage.completed,
                }"
              >
                <span v-if="stage.completed && stage.completedAt">
                  {{ stage.completedAt ? formatStageTime(stage.completedAt) : '' }}
                </span>
                <span v-else-if="currentStage === stage.name">
                  進行中...
                </span>
                <span v-else>
                  ~{{ stage.duration }}秒
                </span>
              </span>
            </div>

            <p
              class="text-sm"
              :class="{
                'text-green-700': stage.completed,
                'text-blue-700': currentStage === stage.name && !stage.completed,
                'text-gray-500': currentStage !== stage.name && !stage.completed,
              }"
            >
              {{ stage.description }}
            </p>

            <!-- 當前階段的進度條 -->
            <div
              v-if="currentStage === stage.name && !stage.completed && getCurrentStageInfo"
              class="mt-2"
            >
              <div class="w-full bg-blue-200 rounded-full h-1.5">
                <div
                  class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${getCurrentStageInfo.progressPercentage}%` }"
                />
              </div>
            </div>
          </div>
        </div>
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
              :class="getScoreColor(currentResult.analysis?.healthScore || 0)"
            >
              {{ currentResult.analysis?.healthScore || 0 }}
            </div>
            <div class="text-sm text-gray-500">
              財務健康度
            </div>
          </div>
          <div class="flex-1">
            <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                class="h-4 rounded-full transition-all duration-1000"
                :class="getScoreBg(currentResult.analysis?.healthScore || 0)"
                :style="{ width: `${currentResult.analysis?.healthScore || 0}%` }"
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
          <div class="text-gray-700 leading-relaxed space-y-3">
            <div
              v-for="(paragraph, index) in formatSummary(currentResult.analysis?.summary || '')"
              :key="index"
              class="text-sm"
              v-html="paragraph"
            />
          </div>
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
                v-for="category in (currentResult.budgetSuggestions?.categories || [])"
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
                    ${{ (category.amount || 0).toLocaleString() }}
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
                  ${{ (currentResult.budgetSuggestions?.savingsTarget || 0).toLocaleString() }}
                </span>
              </div>
              <div class="text-sm text-green-700">
                約佔收入的 {{ Math.round(((currentResult.budgetSuggestions?.savingsTarget || 0) / (currentResult.budgetSuggestions?.monthlyBudget || 1)) * 100) }}%
              </div>
            </div>

            <!-- 負債還款計劃 -->
            <div
              v-if="currentResult.budgetSuggestions?.debtPayoffPlan"
              class="bg-orange-50 rounded-lg p-4"
            >
              <h4 class="font-medium text-orange-900 mb-3">
                負債還款計劃
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-orange-700">建議月還款</span>
                  <span class="font-semibold text-orange-900">
                    ${{ (currentResult.budgetSuggestions?.debtPayoffPlan?.monthlyPayment || 0).toLocaleString() }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-700">預計還清時間</span>
                  <span class="font-semibold text-orange-900">
                    {{ currentResult.budgetSuggestions?.debtPayoffPlan?.timeToPayoff || 0 }} 個月
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-orange-700">總利息支出</span>
                  <span class="font-semibold text-orange-900">
                    ${{ (currentResult.budgetSuggestions?.debtPayoffPlan?.totalInterest || 0).toLocaleString() }}
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
                v-for="allocation in (currentResult.investmentAdvice?.recommendedAllocation || [])"
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
                  ${{ (currentResult.investmentAdvice?.monthlyInvestmentSuggestion || 0).toLocaleString() }}
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
                    {{ currentResult.investmentAdvice?.expectedReturns?.conservative || '未設定' }}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">平衡型策略</span>
                  <span class="font-semibold text-gray-900">
                    {{ currentResult.investmentAdvice?.expectedReturns?.moderate || '未設定' }}%
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">積極型策略</span>
                  <span class="font-semibold text-gray-900">
                    {{ currentResult.investmentAdvice?.expectedReturns?.aggressive || '未設定' }}%
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
                <div>目標金額：${{ (strategy.targetAmount || 0).toLocaleString() }}</div>
                <div>時間期限：{{ strategy.timeframe }} 個月</div>
                <div>每月所需：${{ (strategy.monthlyRequired || 0).toLocaleString() }}</div>
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
                    ${{ (milestone.target || 0).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用戶反饋區塊 -->
    <div
      v-if="currentResult"
      class="bg-white rounded-lg shadow p-6 mt-8"
    >
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        分析結果反饋
      </h2>

      <div v-if="!currentResult.feedback">
        <p class="text-gray-600 mb-4">
          這份分析對您有幫助嗎？請為我們的分析品質評分：
        </p>

        <!-- 評分區 -->
        <div class="flex items-center space-x-4 mb-4">
          <span class="text-sm font-medium text-gray-700">評分：</span>
          <div class="flex items-center space-x-1">
            <button
              v-for="star in 5"
              :key="star"
              class="text-2xl transition-colors duration-150"
              :class="star <= hoveredRating || star <= selectedRating ? 'text-yellow-400' : 'text-gray-300'"
              @click="selectRating(star)"
              @mouseenter="hoveredRating = star"
              @mouseleave="hoveredRating = 0"
            >
              ⭐
            </button>
          </div>
          <span
            v-if="selectedRating > 0"
            class="text-sm text-gray-600"
          >
            {{ getRatingText(selectedRating) }}
          </span>
        </div>

        <!-- 有用性選擇 -->
        <div class="flex items-center space-x-4 mb-4">
          <span class="text-sm font-medium text-gray-700">這份分析對您有用嗎？</span>
          <div class="flex items-center space-x-2">
            <button
              class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              :class="isHelpful === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="isHelpful = true"
            >
              👍 有用
            </button>
            <button
              class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              :class="isHelpful === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              @click="isHelpful = false"
            >
              👎 沒用
            </button>
          </div>
        </div>

        <!-- 評論框 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            額外建議或意見 (選填)：
          </label>
          <textarea
            v-model="feedbackComment"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            maxlength="500"
            placeholder="請分享您對這份分析的想法，或是希望改進的地方..."
          />
          <div class="text-xs text-gray-500 mt-1 text-right">
            {{ feedbackComment.length }}/500 字
          </div>
        </div>

        <!-- 提交按鈕 -->
        <button
          :disabled="selectedRating === 0 || isSubmittingFeedback"
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md transition-colors"
          @click="submitFeedback"
        >
          {{ isSubmittingFeedback ? '提交中...' : (isEditingFeedback ? '更新反饋' : '提交反饋') }}
        </button>
      </div>

      <!-- 已提交反饋的顯示 -->
      <div v-else>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="text-green-400 mr-3 mt-1">
              ✅
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-green-900 font-medium">
                  感謝您的反饋！
                </h4>
                <button
                  class="text-sm text-blue-600 hover:text-blue-800 underline"
                  @click="editExistingFeedback"
                >
                  修改反饋
                </button>
              </div>
              <div class="text-green-800 text-sm space-y-1">
                <div class="flex items-center">
                  <span class="mr-2">評分：</span>
                  <div class="flex items-center">
                    <span
                      v-for="star in (currentResult.feedback?.rating || 0)"
                      :key="star"
                      class="text-yellow-400"
                    >⭐</span>
                  </div>
                  <span class="ml-2">{{ getRatingText(currentResult.feedback?.rating || 0) }}</span>
                </div>
                <div v-if="currentResult.feedback?.helpful !== undefined">
                  有用性：{{ currentResult.feedback?.helpful ? '👍 有用' : '👎 沒用' }}
                </div>
                <div v-if="currentResult.feedback?.comments">
                  意見：{{ currentResult.feedback?.comments }}
                </div>
                <div class="text-xs text-green-600 mt-2">
                  提交時間：{{ currentResult.feedback?.feedbackAt ? formatDate(currentResult.feedback.feedbackAt.toString()) : '未設定' }}
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
  currentStage,
  stages,
  getCurrentStageInfo,
  completedStagesCount,
  totalStagesCount,
} = useFinancialAnalysis()

// 如果有傳入的分析結果，使用它；否則使用 composable 的結果
const currentResult = computed(() => props.analysisResult || result.value)

// 反饋相關狀態
const selectedRating = ref(0)
const hoveredRating = ref(0)
const isHelpful = ref<boolean | null>(null)
const feedbackComment = ref('')
const isSubmittingFeedback = ref(false)
const isEditingFeedback = ref(false)

// 格式化過期日期
const formatExpirationDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 觸發重新分析
const triggerReanalysis = () => {
  // 這裡可以觸發重新分析，需要有原始的財務問卷資料
  console.log('觸發重新分析功能')
  // 可以 emit 事件讓父組件處理
  // emit('triggerReanalysis')
}

// 重試分析
const retryAnalysis = () => {
  triggerReanalysis()
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

// 反饋相關函數
const selectRating = (rating: number) => {
  selectedRating.value = rating
}

const getRatingText = (rating: number) => {
  const texts = {
    1: '非常不滿意',
    2: '不滿意',
    3: '普通',
    4: '滿意',
    5: '非常滿意',
  }
  return texts[rating as keyof typeof texts] || ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatStageTime = (date: Date) => {
  return date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatSummary = (summary: string) => {
  if (!summary) return ['']

  // 分割段落，處理不同的分隔符號
  let paragraphs = summary
    .split(/\n{2,}|\n\s*\n|\r\n\r\n/) // 雙換行符
    .filter(p => p.trim())

  // 如果沒有明顯的段落分隔，嘗試使用其他標記
  if (paragraphs.length === 1) {
    paragraphs = summary
      .split(/### |## |# |\d+\.\s*/) // 標題或編號
      .filter(p => p.trim())
      .map(p => p.trim())
  }

  // 如果還是只有一個段落，強制每80-100字換行
  if (paragraphs.length === 1 && summary.length > 100) {
    const chars = summary.split('')
    const chunks: string[] = []
    let currentChunk = ''

    for (let i = 0; i < chars.length; i++) {
      currentChunk += chars[i]

      // 在適當的標點符號後換行，且達到最小長度
      if ((chars[i] === '。' || chars[i] === '！' || chars[i] === '？')
        && currentChunk.length >= 80) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
      // 強制換行如果超過120字
      else if (currentChunk.length >= 120) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    paragraphs = chunks
  }

  return paragraphs.map(p => p.replace(/\n/g, '<br>'))
}

const editExistingFeedback = () => {
  if (!currentResult.value?.feedback) return

  // 載入現有反饋資料到表單
  selectedRating.value = currentResult.value.feedback?.rating || 0
  isHelpful.value = currentResult.value.feedback?.helpful ?? null
  feedbackComment.value = currentResult.value.feedback?.comments || ''
  isEditingFeedback.value = true

  // 暫時移除反饋顯示，讓用戶可以編輯
  currentResult.value.feedback = undefined
}

const submitFeedback = async () => {
  if (!currentResult.value || selectedRating.value === 0) {
    return
  }

  try {
    isSubmittingFeedback.value = true

    const { authenticatedFetch } = await import('~/lib/utils/auth')
    const response: any = await authenticatedFetch(`/api/financial-profile/${currentResult.value.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: selectedRating.value,
        helpful: isHelpful.value ?? undefined,
        comments: feedbackComment.value.trim() || undefined,
      }),
    })

    if (response.success) {
      // 更新當前結果中的反饋資料
      if (currentResult.value) {
        currentResult.value.feedback = {
          rating: selectedRating.value,
          helpful: isHelpful.value as any,
          comments: feedbackComment.value.trim() || undefined,
          feedbackAt: new Date().toISOString() as any,
        }
      }

      console.log('✅ 反饋提交成功!')
      isEditingFeedback.value = false
    }
    else {
      throw new Error(response.message || '提交反饋失敗')
    }
  }
  catch (error: any) {
    console.error('❌ 提交反饋失敗:', error)
    alert('提交反饋失敗，請稍後再試')
  }
  finally {
    isSubmittingFeedback.value = false
  }
}
</script>
