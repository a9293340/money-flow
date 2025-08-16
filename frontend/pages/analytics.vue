<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-white mb-2">
            財務分析報表
          </h1>
          <p class="text-blue-100 text-lg">
            深入了解您的財務狀況和趨勢變化
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- 快速統計概覽 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">
                總記錄數
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ quickStats.totalRecords }}
              </p>
            </div>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">
                平均月收入
              </p>
              <p class="text-2xl font-bold text-green-600">
                ${{ quickStats.avgIncome.toFixed(0) }}
              </p>
            </div>
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
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">
                平均月支出
              </p>
              <p class="text-2xl font-bold text-red-600">
                ${{ quickStats.avgExpense.toFixed(0) }}
              </p>
            </div>
            <div class="p-3 bg-red-100 rounded-xl">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">
                儲蓄率
              </p>
              <p
                class="text-2xl font-bold"
                :class="savingsRate >= 0 ? 'text-blue-600' : 'text-red-600'"
              >
                {{ savingsRate.toFixed(1) }}%
              </p>
            </div>
            <div
              class="p-3 rounded-xl"
              :class="savingsRate >= 0 ? 'bg-blue-100' : 'bg-red-100'"
            >
              <svg
                class="w-6 h-6"
                :class="savingsRate >= 0 ? 'text-blue-600' : 'text-red-600'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 月度趨勢分析 -->
      <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-white mb-1">
                月度趨勢分析
              </h2>
              <p class="text-indigo-100">
                追蹤您的財務趨勢變化
              </p>
            </div>

            <!-- 控制選項 -->
            <div class="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                v-model="trendPeriod"
                class="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                @change="fetchTrends"
              >
                <option
                  value="12"
                  class="text-gray-900"
                >
                  過去12個月
                </option>
                <option
                  value="6"
                  class="text-gray-900"
                >
                  過去6個月
                </option>
                <option
                  value="3"
                  class="text-gray-900"
                >
                  過去3個月
                </option>
              </select>

              <button
                :disabled="isTrendsLoading"
                class="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all duration-200"
                @click="fetchTrends"
              >
                <span v-if="isTrendsLoading">載入中...</span>
                <span v-else>重新整理</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 圖表容器 -->
        <div class="p-8">
          <div class="relative h-96 mb-8">
            <canvas
              ref="trendsChartRef"
              class="w-full h-full"
              :style="{ display: trendsData?.trends && trendsData.trends.length > 0 ? 'block' : 'none' }"
            />

            <!-- 載入狀態覆蓋層 -->
            <div
              v-if="isTrendsLoading"
              class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl"
            >
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <div class="text-gray-500">
                  載入趨勢資料中...
                </div>
              </div>
            </div>

            <!-- 無資料狀態覆蓋層 -->
            <div
              v-else-if="!trendsData?.trends || trendsData.trends.length === 0"
              class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl"
            >
              <div class="text-center">
                <svg
                  class="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                <div class="text-gray-500">
                  暫無趨勢資料
                </div>
              </div>
            </div>
          </div>

          <!-- 趨勢摘要統計 -->
          <div
            v-if="trendsData?.trends && trendsData.trends.length > 0 && !isTrendsLoading"
            class="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <!-- 平均月收入 -->
            <div class="group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 opacity-10 group-hover:opacity-15 transition-opacity duration-300" />
              <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 transform hover:-translate-y-1">
                <div class="flex items-center justify-between mb-6">
                  <div class="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                    <svg
                      class="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-emerald-600 font-bold uppercase tracking-widest">
                      INCOME AVG
                    </div>
                    <div class="text-xs text-emerald-500 mt-1">
                      {{ trendPeriod }}個月平均
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-4xl font-black text-emerald-700 tracking-tight">
                    ${{ trendsData.summary.avgIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex-1" />
                    <span class="text-sm font-bold text-emerald-600">平均月收入</span>
                  </div>
                </div>
                <!-- 裝飾元素 -->
                <div class="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-emerald-300/20 to-green-400/20 rounded-full blur-xl" />
                <div class="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-tr from-emerald-400/20 to-green-300/20 rounded-full blur-lg" />
              </div>
            </div>

            <!-- 平均月支出 -->
            <div class="group relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-rose-400 via-red-500 to-pink-600 opacity-10 group-hover:opacity-15 transition-opacity duration-300" />
              <div class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 transform hover:-translate-y-1">
                <div class="flex items-center justify-between mb-6">
                  <div class="p-4 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg">
                    <svg
                      class="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M17 13l-5 5m0 0l-5-5m5 5V6"
                      />
                    </svg>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-rose-600 font-bold uppercase tracking-widest">
                      EXPENSE AVG
                    </div>
                    <div class="text-xs text-rose-500 mt-1">
                      {{ trendPeriod }}個月平均
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="text-4xl font-black text-rose-700 tracking-tight">
                    ${{ trendsData.summary.avgExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="h-1 bg-gradient-to-r from-rose-400 to-red-500 rounded-full flex-1" />
                    <span class="text-sm font-bold text-rose-600">平均月支出</span>
                  </div>
                </div>
                <!-- 裝飾元素 -->
                <div class="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-300/20 to-red-400/20 rounded-full blur-xl" />
                <div class="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-tr from-rose-400/20 to-red-300/20 rounded-full blur-lg" />
              </div>
            </div>

            <!-- 平均月淨額 -->
            <div class="group relative overflow-hidden">
              <div
                class="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300"
                :class="trendsData.summary.avgNetAmount >= 0 ? 'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600' : 'bg-gradient-to-r from-orange-400 via-red-500 to-rose-600'"
              />
              <div
                class="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl"
                :class="trendsData.summary.avgNetAmount >= 0 ? 'border-blue-200/50 hover:border-blue-300 hover:shadow-blue-100/50' : 'border-orange-200/50 hover:border-orange-300 hover:shadow-orange-100/50'"
              >
                <div class="flex items-center justify-between mb-6">
                  <div
                    class="p-4 rounded-2xl shadow-lg"
                    :class="trendsData.summary.avgNetAmount >= 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'"
                  >
                    <svg
                      class="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-xs font-bold uppercase tracking-widest"
                      :class="trendsData.summary.avgNetAmount >= 0 ? 'text-blue-600' : 'text-orange-600'"
                    >
                      NET AMOUNT
                    </div>
                    <div
                      class="text-xs mt-1"
                      :class="trendsData.summary.avgNetAmount >= 0 ? 'text-blue-500' : 'text-orange-500'"
                    >
                      {{ trendPeriod }}個月平均
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    class="text-4xl font-black tracking-tight"
                    :class="trendsData.summary.avgNetAmount >= 0 ? 'text-blue-700' : 'text-orange-700'"
                  >
                    {{ trendsData.summary.avgNetAmount >= 0 ? '+' : '' }}${{ Math.abs(trendsData.summary.avgNetAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <div
                      class="h-1 rounded-full flex-1"
                      :class="trendsData.summary.avgNetAmount >= 0 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-orange-400 to-red-500'"
                    />
                    <span
                      class="text-sm font-bold"
                      :class="trendsData.summary.avgNetAmount >= 0 ? 'text-blue-600' : 'text-orange-600'"
                    >
                      {{ trendsData.summary.avgNetAmount >= 0 ? '盈餘' : '赤字' }}
                    </span>
                  </div>
                </div>
                <!-- 裝飾元素 -->
                <div
                  class="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-xl"
                  :class="trendsData.summary.avgNetAmount >= 0 ? 'bg-gradient-to-br from-blue-300/20 to-indigo-400/20' : 'bg-gradient-to-br from-orange-300/20 to-red-400/20'"
                />
                <div
                  class="absolute -bottom-4 -left-4 w-12 h-12 rounded-full blur-lg"
                  :class="trendsData.summary.avgNetAmount >= 0 ? 'bg-gradient-to-tr from-blue-400/20 to-indigo-300/20' : 'bg-gradient-to-tr from-orange-400/20 to-red-300/20'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分類支出分析 -->
      <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
          <h2 class="text-2xl font-bold text-white mb-1">
            分類支出分析
          </h2>
          <p class="text-purple-100">
            了解您的消費習慣和分類分布
          </p>
        </div>

        <div class="p-8">
          <div class="text-center text-gray-500">
            <svg
              class="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p>分類分析功能即將推出</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, type ChartConfiguration } from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 類型定義
interface MonthlyTrend {
  year: number
  month: number
  monthLabel: string
  totalIncome: number
  totalExpense: number
  netAmount: number
  recordCount: number
}

interface TrendsData {
  trends: MonthlyTrend[]
  summary: {
    totalMonths: number
    avgIncome: number
    avgExpense: number
    avgNetAmount: number
  }
}

interface QuickStats {
  totalRecords: number
  avgIncome: number
  avgExpense: number
}

// 頁面標題
definePageMeta({
  title: '財務分析報表',
  requiresAuth: true,
})

// 響應式數據
const isTrendsLoading = ref(false)
const trendsData = ref<TrendsData | null>(null)
const trendPeriod = ref(12)
const trendsChartRef = ref<HTMLCanvasElement>()
let trendsChart: Chart | null = null

const quickStats = ref<QuickStats>({
  totalRecords: 0,
  avgIncome: 0,
  avgExpense: 0,
})

// 計算屬性
const savingsRate = computed(() => {
  if (quickStats.value.avgIncome <= 0) return 0
  return ((quickStats.value.avgIncome - quickStats.value.avgExpense) / quickStats.value.avgIncome) * 100
})

// 趨勢圖相關方法
const fetchTrends = async () => {
  isTrendsLoading.value = true
  try {
    const params = new URLSearchParams({
      months: trendPeriod.value.toString(),
    })

    const response = await $fetch(`/api/statistics/trends?${params}`) as any
    trendsData.value = response.data

    // 更新快速統計
    quickStats.value.avgIncome = response.data.summary.avgIncome
    quickStats.value.avgExpense = response.data.summary.avgExpense
    quickStats.value.totalRecords = response.data.trends.reduce((sum: number, trend: any) => sum + trend.recordCount, 0)

    // 等待 DOM 更新後繪製圖表
    await nextTick()
    await nextTick()
    await renderTrendsChart()
  }
  catch (error) {
    console.error('獲取趨勢資料失敗:', error)
    trendsData.value = null
  }
  finally {
    isTrendsLoading.value = false
  }
}

const renderTrendsChart = async () => {
  if (!trendsChartRef.value || !trendsData.value || trendsData.value.trends.length === 0) {
    return
  }

  // 銷毀現有圖表
  if (trendsChart) {
    trendsChart.destroy()
    trendsChart = null
  }

  const ctx = trendsChartRef.value.getContext('2d')
  if (!ctx) {
    return
  }

  const trends = trendsData.value.trends

  // 計算 Y 軸的最大值
  const allValues = [
    ...trends.map(t => t.totalIncome),
    ...trends.map(t => t.totalExpense),
    ...trends.map(t => Math.abs(t.netAmount)),
  ]
  const maxValue = Math.max(...allValues)
  const suggestedMax = maxValue > 0 ? maxValue * 1.1 : 1000

  const chartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: trends.map(trend => trend.monthLabel),
      datasets: [
        {
          label: '收入',
          data: trends.map(trend => trend.totalIncome),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        {
          label: '支出',
          data: trends.map(trend => trend.totalExpense),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        {
          label: '淨額',
          data: trends.map(trend => trend.netAmount),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 30,
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#ddd',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: $${value.toFixed(2)}`
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          title: {
            display: true,
            text: '月份',
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#374151',
          },
          ticks: {
            font: {
              size: 12,
              weight: 500,
            },
            color: '#6b7280',
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          suggestedMax,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          title: {
            display: true,
            text: '金額 ($)',
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#374151',
          },
          ticks: {
            font: {
              size: 12,
              weight: 500,
            },
            color: '#6b7280',
            callback: function (value) {
              return '$' + Number(value).toLocaleString()
            },
          },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      elements: {
        point: {
          hoverBackgroundColor: '#fff',
          hoverBorderWidth: 3,
        },
        line: {
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
        },
      },
    },
  }

  try {
    trendsChart = new Chart(ctx, chartConfig)
  }
  catch (error) {
    console.error('創建圖表失敗:', error)
  }
}

// 生命週期
onMounted(async () => {
  await fetchTrends()
})

onUnmounted(() => {
  // 清理圖表資源
  if (trendsChart) {
    trendsChart.destroy()
    trendsChart = null
  }
})
</script>
