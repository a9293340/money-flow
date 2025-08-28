<!--
  財務分析歷史記錄組件
  顯示用戶的所有歷史分析記錄
-->
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        分析歷史記錄
      </h2>
      <div class="flex items-center space-x-3">
        <!-- 狀態篩選 -->
        <select
          v-model="statusFilter"
          class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          @change="() => loadHistory()"
        >
          <option value="">
            全部狀態
          </option>
          <option value="active">
            活躍中
          </option>
          <option value="expired">
            已過期
          </option>
          <option value="archived">
            已封存
          </option>
        </select>

        <!-- 重新載入按鈕 -->
        <button
          :disabled="isLoading"
          class="text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-3 py-1 rounded-md transition-colors flex items-center"
          @click="() => loadHistory()"
        >
          <svg
            class="w-4 h-4 mr-1"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重新載入
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div
      v-if="isLoading && records.length === 0"
      class="text-center py-8"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
      <p class="text-gray-600">
        載入分析記錄中...
      </p>
    </div>

    <!-- 無記錄狀態 -->
    <div
      v-else-if="records.length === 0"
      class="text-center py-8"
    >
      <div class="text-gray-400 mb-4">
        📊
      </div>
      <p class="text-gray-600">
        {{ statusFilter ? '沒有符合條件的分析記錄' : '尚未有任何分析記錄' }}
      </p>
    </div>

    <!-- 記錄列表 -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="record in records"
        :key="record.id"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        :class="getRecordBorderClass(record)"
        @click="$emit('select-record', record)"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <!-- 狀態指示 -->
            <div
              class="w-3 h-3 rounded-full"
              :class="getStatusIndicatorClass(record)"
            />

            <!-- 財務健康度 -->
            <div class="flex items-center">
              <span class="text-sm text-gray-600 mr-2">健康度：</span>
              <span
                class="font-semibold text-lg"
                :class="getHealthScoreColor(record.healthScore)"
              >
                {{ record.healthScore }}
              </span>
            </div>

            <!-- 風險等級 -->
            <div class="flex items-center">
              <span class="text-sm text-gray-600 mr-2">風險：</span>
              <span
                class="text-sm px-2 py-1 rounded-full font-medium"
                :class="getRiskProfileClass(record.riskProfile)"
              >
                {{ getRiskProfileText(record.riskProfile) }}
              </span>
            </div>
          </div>

          <!-- 狀態標籤 -->
          <span
            class="text-xs px-2 py-1 rounded-full font-medium"
            :class="getStatusClass(record)"
          >
            {{ getStatusText(record) }}
          </span>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span>分析時間：{{ formatDate(record.createdAt) }}</span>
          </div>

          <div class="flex items-center space-x-4">
            <!-- 過期時間 -->
            <span
              v-if="!record.isExpired"
              class="text-green-600"
            >
              {{ getTimeRemaining(record.expiresAt) }}
            </span>
            <span
              v-else
              class="text-red-600"
            >
              已過期
            </span>

            <!-- API 使用量 -->
            <span
              v-if="record.usage"
              class="text-gray-500"
            >
              {{ record.usage.totalTokens }} tokens
            </span>

            <!-- 評分 -->
            <div
              v-if="record.feedback?.rating"
              class="flex items-center"
            >
              <span class="text-yellow-500 mr-1">⭐</span>
              <span>{{ record.feedback.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div
      v-if="pagination && pagination.total > 1"
      class="flex items-center justify-between mt-6 pt-4 border-t"
    >
      <div class="text-sm text-gray-600">
        共 {{ pagination.totalRecords }} 筆記錄，第 {{ pagination.current }} / {{ pagination.total }} 頁
      </div>

      <div class="flex items-center space-x-2">
        <button
          :disabled="!pagination.hasPrevious || isLoading"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="loadPage(pagination.current - 1)"
        >
          上一頁
        </button>

        <span class="text-sm text-gray-600">
          {{ pagination.current }} / {{ pagination.total }}
        </span>

        <button
          :disabled="!pagination.hasNext || isLoading"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="loadPage(pagination.current + 1)"
        >
          下一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AnalysisRecord {
  id: string
  createdAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'archived'
  healthScore: number
  riskProfile: string
  usage?: {
    totalTokens: number
    estimatedCost: number
  }
  feedback?: {
    rating: number
    helpful: boolean
  }
  isExpired: boolean
}

interface Props {
  autoLoad?: boolean
}

defineProps<Props>()

defineEmits<{
  'select-record': [record: AnalysisRecord]
}>()

// 響應式數據
const records = ref<AnalysisRecord[]>([])
const pagination = ref<any>(null)
const isLoading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)

// 載入歷史記錄
const loadHistory = async (page = 1) => {
  try {
    isLoading.value = true
    currentPage.value = page

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    })

    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }

    const response: any = await $fetch(`/api/financial-profile/history?${params.toString()}`)

    if (response.success) {
      records.value = response.results || []
      pagination.value = response.pagination
    }
  }
  catch (error) {
    console.error('載入分析歷史失敗:', error)
  }
  finally {
    isLoading.value = false
  }
}

// 載入指定頁面
const loadPage = (page: number) => {
  loadHistory(page)
}

// 格式化日期
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

// 計算剩餘時間
const getTimeRemaining = (expiresAt: string) => {
  const expires = new Date(expiresAt)
  const now = new Date()
  const diff = expires.getTime() - now.getTime()

  if (diff <= 0) return '已過期'

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days > 1) return `${days} 天後過期`

  const hours = Math.ceil(diff / (1000 * 60 * 60))
  return `${hours} 小時後過期`
}

// 樣式相關函數
const getRecordBorderClass = (record: AnalysisRecord) => {
  if (record.isExpired) return 'border-red-200 bg-red-50'
  if (record.status === 'active') return 'border-green-200 bg-green-50'
  return 'border-gray-200'
}

const getStatusIndicatorClass = (record: AnalysisRecord) => {
  if (record.isExpired) return 'bg-red-500'
  if (record.status === 'active') return 'bg-green-500'
  return 'bg-gray-400'
}

const getStatusClass = (record: AnalysisRecord) => {
  if (record.isExpired) return 'bg-red-100 text-red-800'
  if (record.status === 'active') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

const getStatusText = (record: AnalysisRecord) => {
  if (record.isExpired) return '已過期'
  if (record.status === 'active') return '活躍中'
  if (record.status === 'archived') return '已封存'
  return '未知狀態'
}

const getHealthScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getRiskProfileClass = (profile: string) => {
  switch (profile) {
    case 'conservative': return 'bg-blue-100 text-blue-800'
    case 'moderate': return 'bg-yellow-100 text-yellow-800'
    case 'aggressive': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getRiskProfileText = (profile: string) => {
  switch (profile) {
    case 'conservative': return '保守'
    case 'moderate': return '穩健'
    case 'aggressive': return '積極'
    default: return '未知'
  }
}

// 暴露給父組件使用
defineExpose({
  loadHistory,
})

// 生命週期
onMounted(() => {
  loadHistory()
})
</script>
