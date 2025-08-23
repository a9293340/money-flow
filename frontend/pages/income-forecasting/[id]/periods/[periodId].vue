<template>
  <div class="min-h-screen bg-background">
    <!-- Breadcrumb -->
    <div class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center gap-2 text-sm text-muted-foreground">
          <NuxtLink
            to="/income-forecasting"
            class="hover:text-foreground"
          >
            收入預測管理
          </NuxtLink>
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <NuxtLink
            v-if="forecasting"
            :to="`/income-forecasting/${forecasting._id}`"
            class="hover:text-foreground"
          >
            {{ forecasting.name }}
          </NuxtLink>
          <span
            v-else
            class="animate-pulse bg-muted rounded w-20 h-4"
          />
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="text-foreground font-medium">
            期間 {{ period?.periodNumber || '...' }}
          </span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="container mx-auto px-4 py-8"
    >
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-64 rounded bg-muted" />
        <div class="grid gap-6 md:grid-cols-4">
          <div
            v-for="i in 4"
            :key="i"
            class="h-32 rounded-lg bg-muted"
          />
        </div>
        <div class="h-64 rounded-lg bg-muted" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="container mx-auto px-4 py-8"
    >
      <div class="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 class="text-lg font-medium text-red-800 mb-2">
          載入失敗
        </h3>
        <p class="text-red-700">
          {{ error }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else-if="period && forecasting"
      class="container mx-auto px-4 py-8 space-y-6"
    >
      <!-- 期間標題區 -->
      <div class="bg-card rounded-lg border p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-foreground mb-2">
              期間 {{ period.periodNumber }}
            </h1>
            <p class="text-muted-foreground">
              {{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-muted-foreground">
              完成度
            </p>
            <p class="text-2xl font-bold text-green-600">
              {{ Math.round((period.actualAmount || 0) / (period.expectedAmount || 1) * 100) }}%
            </p>
          </div>
        </div>

        <!-- 統計卡片 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-green-800 mb-1">
              預期金額
            </h3>
            <p class="text-xl font-bold text-green-900">
              {{ formatCurrency(period.expectedAmount, forecasting.currency) }}
            </p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-blue-800 mb-1">
              實際金額
            </h3>
            <p class="text-xl font-bold text-blue-900">
              {{ formatCurrency(period.actualAmount || 0, forecasting.currency) }}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-purple-800 mb-1">
              匹配記錄
            </h3>
            <p class="text-xl font-bold text-purple-900">
              {{ period.matchedRecords?.length || 0 }} 筆
            </p>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-orange-800 mb-1">
              健康度
            </h3>
            <p class="text-xl font-bold text-orange-900">
              {{ period.healthScore || 0 }}/100
            </p>
          </div>
        </div>
      </div>

      <!-- 基本資訊 -->
      <div class="bg-card rounded-lg border p-6">
        <h2 class="text-lg font-semibold mb-4">
          基本資訊
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">收入分類</label>
              <p class="text-foreground">
                未設定
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">頻率</label>
              <p class="text-foreground">
                {{ getFrequencyLabel(forecasting.frequency) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">開始日期</label>
              <p class="text-foreground">
                {{ formatDate(period.startDate) }}
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground">結束日期</label>
              <p class="text-foreground">
                {{ formatDate(period.endDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">期望收款日</label>
              <p class="text-foreground">
                {{ formatDate(period.expectedPaymentDate) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground">狀態</label>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ getStatusLabel(period.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 匹配資訊 -->
      <div class="bg-card rounded-lg border p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">
            匹配資訊
          </h2>
          <div class="text-sm text-muted-foreground">
            自動匹配: {{ getAutoMatchCount() }} 筆 | 手動匹配: {{ getManualMatchCount() }} 筆
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="text-sm font-medium text-muted-foreground">金額容差率</label>
            <p class="text-foreground">
              ± {{ (forecasting.matchingConfig?.amountTolerance || 0) * 100 }}%
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-muted-foreground">日期容差</label>
            <p class="text-foreground">
              ± {{ forecasting.matchingConfig?.dateTolerance || 3 }} 天
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-muted-foreground">匹配範圍</label>
            <p class="text-foreground">
              {{ formatDate(period.matchingDateRange?.startDate) }} -
              {{ formatDate(period.matchingDateRange?.endDate) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-muted-foreground">優先順序</label>
            <p class="text-foreground">
              {{ getPriorityLabel() }}
            </p>
          </div>
        </div>

        <!-- 匹配記錄列表 -->
        <div
          v-if="period.matchedRecords && period.matchedRecords.length > 0"
          class="space-y-3"
        >
          <h3 class="font-medium">
            匹配記錄 ({{ period.matchedRecords.length }} 筆)
          </h3>
          <div class="space-y-2">
            <div
              v-for="match in period.matchedRecords"
              :key="match.recordId._id"
              class="border rounded-lg p-4 bg-muted/10"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">
                    {{ match.recordId.description || '收入記錄' }}
                  </h4>
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(match.recordId.date) }} • 信心度: {{ Math.round(match.confidence * 100) }}%
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">
                    {{ formatCurrency(match.matchedAmount, forecasting.currency) }}
                  </p>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="match.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                  >
                    {{ match.isManual ? '手動匹配' : '自動匹配' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="text-center py-8 text-muted-foreground"
        >
          <p>尚無匹配記錄</p>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex gap-4">
        <button
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          @click="handleRefreshMatching"
        >
          重新匹配
        </button>
        <button
          class="px-4 py-2 border border-border rounded-md hover:bg-muted"
          @click="handleManualMatch"
        >
          手動匹配記錄
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomePeriod } from '~/lib/models/IncomePeriod'
import type { IIncomeForecasting } from '~/lib/models/IncomeForecasting'

// Route params
const route = useRoute()
const forecastingId = route.params.id as string
const periodId = route.params.periodId as string

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const period = ref<IncomePeriod | null>(null)
const forecasting = ref<IIncomeForecasting | null>(null)

// Composables
const { formatCurrency } = useCurrency()
const { formatDate } = useDateFormat()

// Methods
async function fetchData() {
  console.log('🔍 [子頁面] fetchData 開始')
  console.log('  - Forecasting ID:', forecastingId)
  console.log('  - Period ID:', periodId)

  isLoading.value = true
  error.value = null

  try {
    const periodUrl = `/api/income-forecasting/${forecastingId}/periods/${periodId}`
    const forecastingUrl = `/api/income-forecasting/${forecastingId}`

    console.log('🔍 [子頁面] API 請求:')
    console.log('  - Period API:', periodUrl)
    console.log('  - Forecasting API:', forecastingUrl)

    const [periodResponse, forecastingResponse] = await Promise.all([
      $fetch(periodUrl),
      $fetch(forecastingUrl),
    ])

    console.log('🔍 [子頁面] API 響應:')
    console.log('  - Period response:', periodResponse)
    console.log('  - Forecasting response:', forecastingResponse)

    const periodResult = periodResponse as { success: boolean; data: any }
    const forecastingResult = forecastingResponse as { success: boolean; data: any }

    if (periodResult.success && forecastingResult.success) {
      period.value = periodResult.data
      // 修復 forecasting 數據結構問題
      const forecastingData = forecastingResult.data as any
      forecasting.value = forecastingData.forecasting || forecastingData
      console.log('🔍 [子頁面] 數據設定完成:')
      console.log('  - Period:', period.value)
      console.log('  - Forecasting:', forecasting.value)
    }
    else {
      throw new Error('無法載入期間資料')
    }
  }
  catch (err: unknown) {
    const errorObj = err as { statusMessage?: string }
    console.error('🔍 [子頁面] API 錯誤:', err)
    error.value = errorObj.statusMessage || '載入期間詳情失敗'
  }
  finally {
    isLoading.value = false
    console.log('🔍 [子頁面] fetchData 結束, loading:', isLoading.value)
  }
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    quarterly: '每季',
    yearly: '每年',
  }
  return labels[frequency] || frequency
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待完成',
    partial: '部分完成',
    completed: '已完成',
    overdue: '逾期',
    missed: '錯過',
  }
  return labels[status] || status
}

function getPriorityLabel(priority: string = 'amount'): string {
  const labels: Record<string, string> = {
    amount: '金額優先',
    date: '日期優先',
    category: '分類優先',
  }
  return labels[priority] || '金額優先'
}

function getAutoMatchCount(): number {
  return period.value?.matchedRecords?.filter(m => !m.isManual).length || 0
}

function getManualMatchCount(): number {
  return period.value?.matchedRecords?.filter(m => m.isManual).length || 0
}

async function handleRefreshMatching() {
  // TODO: 實作重新匹配功能
}

async function handleManualMatch() {
  // TODO: 實作手動匹配功能
}

// Lifecycle
onMounted(async () => {
  console.log('🔍 [子頁面] onMounted 觸發')
  console.log('  - Route params:', route.params)
  console.log('  - Forecasting ID:', forecastingId)
  console.log('  - Period ID:', periodId)
  if (import.meta.client) {
    console.log('  - Window location:', window.location.href)
    console.log('  - Document title:', document.title)
  }
  await fetchData()
})

// SEO
useHead({
  title: computed(() => {
    if (period.value && forecasting.value) {
      return `期間 ${period.value.periodNumber} - ${forecasting.value.name}`
    }
    if (period.value) {
      return `期間 ${period.value.periodNumber} - 載入中`
    }
    return '期間詳情 - 收入預測'
  }),
})
</script>
