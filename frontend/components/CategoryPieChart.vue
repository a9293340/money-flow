<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <!-- 標題和切換按鈕 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          分類統計
        </h3>
        <p class="text-sm text-gray-500">
          {{ getViewDescription() }}
        </p>
      </div>

      <!-- 類型切換按鈕 -->
      <div class="mt-4 sm:mt-0 flex bg-gray-100 rounded-lg p-1">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          :class="[
            'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-[80px]',
            currentView === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          ]"
          @click="changeView(option.value)"
        >
          {{ option.icon }} {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center h-64"
    >
      <div class="text-center">
        <svg
          class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p class="text-sm text-gray-500">
          載入統計資料中...
        </p>
      </div>
    </div>

    <!-- 無資料狀態 -->
    <div
      v-else-if="!hasData"
      class="flex items-center justify-center h-64"
    >
      <div class="text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-8 h-8 text-gray-400"
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
        <h4 class="text-lg font-medium text-gray-900 mb-2">
          尚無統計資料
        </h4>
        <p class="text-gray-500 mb-4">
          目前沒有{{ getViewDescription() }}資料可顯示
        </p>
        <NuxtLink
          to="/records"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          開始記帳
          <svg
            class="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- 圓餅圖和圖例 -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <!-- 圓餅圖區域 -->
      <div class="flex items-center justify-center">
        <div class="relative w-64 h-64">
          <ClientOnly
            fallback-tag="div"
            fallback="載入圖表中..."
          >
            <Pie
              :data="chartData"
              :options="chartOptions"
              class="max-w-full max-h-full"
            />
          </ClientOnly>
        </div>
      </div>

      <!-- 圖例和詳細資訊 -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm font-medium text-gray-700 border-b pb-2">
          <span>分類</span>
          <span>金額 (比例)</span>
        </div>

        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="(item, index) in statisticsData"
            :key="item.categoryId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: getItemColor(index) }"
              />
              <div class="flex items-center space-x-2">
                <span class="text-lg">{{ item.categoryIcon }}</span>
                <span class="font-medium text-gray-900">{{ item.categoryName }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-gray-900">
                ${{ item.totalAmount.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ item.percentage }}%
              </div>
            </div>
          </div>
        </div>

        <!-- 統計摘要 -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-blue-50 rounded-lg p-3">
              <div class="text-sm text-blue-600 font-medium">
                總金額
              </div>
              <div class="text-lg font-bold text-blue-700">
                ${{ summary?.totalAmount?.toFixed(2) || '0.00' }}
              </div>
            </div>
            <div class="bg-purple-50 rounded-lg p-3">
              <div class="text-sm text-purple-600 font-medium">
                分類數
              </div>
              <div class="text-lg font-bold text-purple-700">
                {{ summary?.categoryCount || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Pie } from 'vue-chartjs'
import type { ChartOptions, ChartData } from 'chart.js'

// 類型定義
interface CategoryStatistic {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  totalAmount: number
  recordCount: number
  percentage: number
}

interface StatisticsSummary {
  totalAmount: number
  categoryCount: number
  recordCount: number
}

type ViewType = 'all' | 'income' | 'expense'

// 響應式數據
const isLoading = ref(false)
const currentView = ref<ViewType>('all')
const statisticsData = ref<CategoryStatistic[]>([])
const summary = ref<StatisticsSummary | null>(null)

// 視圖選項
const viewOptions = [
  { value: 'all' as ViewType, label: '總覽', icon: '📊' },
  { value: 'income' as ViewType, label: '收入', icon: '💰' },
  { value: 'expense' as ViewType, label: '支出', icon: '💸' },
]

// 計算屬性
const hasData = computed(() => {
  return statisticsData.value.length > 0
})

const chartData = computed((): ChartData<'pie'> => {
  if (!hasData.value) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    }
  }

  const labels = statisticsData.value.map(item => item.categoryName)
  const data = statisticsData.value.map(item => item.totalAmount)

  // 生成顏色配色（如果分類沒有自定義顏色則使用預設配色）
  const colors = statisticsData.value.map((item, index) => {
    if (item.categoryColor) {
      return item.categoryColor
    }
    // 預設配色方案
    const defaultColors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
    ]
    return defaultColors[index % defaultColors.length]
  })

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 8,
    }],
  }
})

const chartOptions = computed((): ChartOptions<'pie'> => {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false, // 我們使用自定義圖例
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = statisticsData.value[context.dataIndex]
            return `${item.categoryName}: $${item.totalAmount.toFixed(2)} (${item.percentage}%)`
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  }
})

// 方法
const getViewDescription = (): string => {
  switch (currentView.value) {
    case 'income':
      return '收入分類統計'
    case 'expense':
      return '支出分類統計'
    default:
      return '全部分類統計'
  }
}

const changeView = (view: ViewType) => {
  currentView.value = view
}

const getItemColor = (index: number): string => {
  const colors = chartData.value.datasets[0].backgroundColor as string[]
  return colors[index] || '#6B7280'
}

const fetchStatistics = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams()

    if (currentView.value !== 'all') {
      params.append('type', currentView.value)
    }

    const response = await $fetch(`/api/statistics/categories?${params}`)

    if (response.success) {
      statisticsData.value = response.data.statistics
      summary.value = response.data.summary
    }
    else {
      statisticsData.value = []
      summary.value = null
    }
  }
  catch (error) {
    console.error('載入統計資料失敗:', error)
    statisticsData.value = []
    summary.value = null
  }
  finally {
    isLoading.value = false
  }
}

// 監聽器
watch(currentView, () => {
  fetchStatistics()
})

// 生命週期
onMounted(() => {
  fetchStatistics()
})
</script>
