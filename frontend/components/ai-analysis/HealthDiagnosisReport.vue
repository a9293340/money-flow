<template>
  <div class="space-y-6">
    <!-- 健康評分展示 -->
    <div class="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
      <div class="text-center">
        <div
          class="text-4xl sm:text-5xl font-bold"
          :class="getGradeColor(data.grade)"
        >
          {{ data.healthScore }}
        </div>
        <div class="text-lg font-semibold text-gray-600">
          {{ data.grade }} 等級
        </div>
      </div>
      <div class="flex-1 w-full">
        <div class="mb-2">
          <span class="text-sm font-medium text-gray-700">健康評分</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-1000"
            :class="getScoreBarColor(data.healthScore)"
            :style="`width: ${data.healthScore}%`"
          />
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ formatHealthScore(data.healthScore) }}
        </div>
      </div>
    </div>

    <!-- 詳細分析報告 -->
    <div class="bg-gray-50 rounded-xl p-6">
      <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          class="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        財務健康分析報告
      </h4>

      <!-- 格式化的分析內容 -->
      <div class="prose prose-sm max-w-none text-gray-700">
        <div
          v-if="formattedAnalysis.summary"
          class="mb-4"
        >
          <p class="text-base leading-relaxed">
            {{ formattedAnalysis.summary }}
          </p>
        </div>

        <!-- 各項指標分析 -->
        <div
          v-if="formattedAnalysis.metrics"
          class="space-y-4"
        >
          <h5 class="font-medium text-gray-900 text-sm uppercase tracking-wide">
            各項指標分析
          </h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(metric, key) in formattedAnalysis.metrics"
              :key="key"
              class="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">{{ getMetricLabel(String(key)) }}</span>
                <span
                  class="text-sm font-bold"
                  :class="getMetricScoreColor(Math.round(metric * 100))"
                >
                  {{ Math.round(metric * 100) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getMetricBarColor(Math.round(metric * 100))"
                  :style="`width: ${Math.round(metric * 100)}%`"
                />
              </div>
              <p class="text-xs text-gray-600 mt-2">
                {{ getMetricDescription(String(key), metric) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 改善建議 -->
    <div
      v-if="data.recommendations && data.recommendations.length > 0"
      class="bg-amber-50 rounded-xl p-6"
    >
      <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          class="w-5 h-5 text-amber-600"
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
        專業建議
      </h4>
      <div class="space-y-3">
        <div
          v-for="(recommendation, index) in data.recommendations"
          :key="index"
          class="flex items-start gap-3 p-4 bg-white rounded-lg border border-amber-200"
        >
          <div class="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
            <span class="text-xs font-bold text-amber-700">{{ index + 1 }}</span>
          </div>
          <p class="text-gray-700 text-sm leading-relaxed">
            {{ recommendation }}
          </p>
        </div>
      </div>
    </div>

    <!-- 時間戳記和來源 -->
    <div class="text-xs text-gray-500 text-center border-t border-gray-200 pt-4">
      <span v-if="data.isAIGenerated">✨ AI 驅動智能分析</span>
      <span v-else>📊 本地演算法分析</span>
      <span class="mx-2">•</span>
      <span>分析時間：{{ formatDate(data.timestamp || data.lastUpdated || '') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: {
    healthScore: number
    grade: string
    analysis: string
    recommendations: string[]
    metrics?: {
      savingsRate: number
      expenseStability: number
      categoryBalance: number
      trendHealth: number
      riskControl: number
      emergencyFund: number
    }
    isAIGenerated?: boolean
    timestamp?: string
    lastUpdated?: string
  }
}

const props = defineProps<Props>()

// 格式化分析內容
const formattedAnalysis = computed(() => {
  const analysis = props.data.analysis

  // 如果分析內容看起來像 JSON，嘗試解析
  if (analysis.trim().startsWith('{') && analysis.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(analysis)
      return {
        summary: parsed.analysis || analysis,
        metrics: props.data.metrics || parsed.metrics,
      }
    }
    catch {
      // 如果解析失敗，按段落分割
      return {
        summary: analysis,
        metrics: props.data.metrics,
      }
    }
  }

  // 處理純文字分析
  return {
    summary: analysis,
    metrics: props.data.metrics,
  }
})

// 指標標籤對照
const metricLabels = {
  savingsRate: '儲蓄率',
  expenseStability: '支出穩定性',
  categoryBalance: '分類均衡性',
  trendHealth: '趨勢健康度',
  riskControl: '風險控制',
  emergencyFund: '應急準備',
}

function getMetricLabel(key: string): string {
  return metricLabels[key as keyof typeof metricLabels] || key
}

function getMetricDescription(key: string, value: number): string {
  const score = Math.round(value * 100)

  const descriptions = {
    savingsRate: score >= 80 ? '儲蓄習慣優秀' : score >= 60 ? '儲蓄表現良好' : score >= 40 ? '儲蓄需要加強' : '亟需建立儲蓄習慣',
    expenseStability: score >= 80 ? '支出控制穩定' : score >= 60 ? '支出相對穩定' : score >= 40 ? '支出波動較大' : '支出缺乏規律性',
    categoryBalance: score >= 80 ? '支出分配均衡' : score >= 60 ? '分配基本合理' : score >= 40 ? '分配需要調整' : '支出分配失衡',
    trendHealth: score >= 80 ? '財務趨勢健康' : score >= 60 ? '趨勢基本良好' : score >= 40 ? '趨勢需要關注' : '財務趨勢堪憂',
    riskControl: score >= 80 ? '風險控制得當' : score >= 60 ? '風險管理尚可' : score >= 40 ? '風險控制不足' : '缺乏風險意識',
    emergencyFund: score >= 80 ? '應急資金充足' : score >= 60 ? '應急準備適中' : score >= 40 ? '應急資金不足' : '缺乏應急準備',
  }

  return descriptions[key as keyof typeof descriptions] || `評分：${score}%`
}

// 顏色相關函數
function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600'
  if (grade.startsWith('B')) return 'text-blue-600'
  if (grade.startsWith('C')) return 'text-yellow-600'
  if (grade.startsWith('D')) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

function getMetricScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

function getMetricBarColor(score: number): string {
  if (score >= 80) return 'bg-green-400'
  if (score >= 60) return 'bg-blue-400'
  if (score >= 40) return 'bg-yellow-400'
  if (score >= 20) return 'bg-orange-400'
  return 'bg-red-400'
}

function formatHealthScore(score: number): string {
  if (score >= 90) return '財務狀況優秀'
  if (score >= 80) return '財務狀況良好'
  if (score >= 70) return '財務狀況尚可'
  if (score >= 60) return '財務狀況需改善'
  if (score >= 50) return '財務狀況堪憂'
  return '財務狀況不佳'
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
