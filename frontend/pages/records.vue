<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900">
          記帳管理
        </h1>
        <p class="text-gray-600 mt-1">
          管理您的收支記錄
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- 新增記錄表單 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              {{ isEditing ? '編輯記錄' : '新增記錄' }}
            </h2>

            <form
              class="space-y-4"
              @submit.prevent="handleSubmit"
            >
              <!-- 類型選擇 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">類型</label>
                <div class="flex space-x-3">
                  <button
                    type="button"
                    :class="[
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      form.type === 'income'
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200',
                    ]"
                    @click="form.type = 'income'"
                  >
                    💰 收入
                  </button>
                  <button
                    type="button"
                    :class="[
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      form.type === 'expense'
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200',
                    ]"
                    @click="form.type = 'expense'"
                  >
                    💸 支出
                  </button>
                </div>
              </div>

              <!-- 金額 -->
              <div>
                <label
                  for="amount"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >金額</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    id="amount"
                    v-model="form.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <!-- 分類 -->
              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >分類</label>
                <select
                  id="category"
                  v-model="form.categoryId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    請選擇分類
                  </option>
                  <option
                    v-for="category in filteredCategories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- 描述 -->
              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >描述</label>
                <input
                  id="description"
                  v-model="form.description"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="記錄描述（選填）"
                >
              </div>

              <!-- 日期 -->
              <div>
                <label
                  for="date"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >日期</label>
                <input
                  id="date"
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>

              <!-- 標籤 -->
              <div>
                <label
                  for="tags"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >標籤</label>
                <input
                  id="tags"
                  v-model="tagsInput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="輸入標籤，用逗號分隔"
                >
                <div
                  v-if="form.tags.length > 0"
                  class="mt-2 flex flex-wrap gap-1"
                >
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                      @click="removeTag(tag)"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- 提交按鈕 -->
              <div class="space-y-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="isSubmitting">{{ isEditing ? '更新中...' : '新增中...' }}</span>
                  <span v-else>{{ isEditing ? '更新記錄' : '新增記錄' }}</span>
                </button>

                <!-- 取消編輯按鈕 -->
                <button
                  v-if="isEditing"
                  type="button"
                  class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  @click="cancelEdit"
                >
                  取消編輯
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 記錄列表 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <!-- 篩選區域 -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex flex-wrap gap-4">
                <!-- 年份選擇 -->
                <select
                  v-model="filters.year"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option
                    v-for="year in yearOptions"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}年
                  </option>
                </select>

                <!-- 月份選擇 -->
                <select
                  v-model="filters.month"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option
                    v-for="month in monthOptions"
                    :key="month.value"
                    :value="month.value"
                  >
                    {{ month.label }}
                  </option>
                </select>

                <!-- 類型篩選 -->
                <select
                  v-model="filters.type"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">
                    全部類型
                  </option>
                  <option value="income">
                    收入
                  </option>
                  <option value="expense">
                    支出
                  </option>
                </select>

                <!-- 分類篩選 -->
                <select
                  v-model="filters.categoryId"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">
                    全部分類
                  </option>
                  <option
                    v-for="category in categories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>

                <!-- 描述搜尋 -->
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="搜尋描述..."
                  class="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                >

                <!-- 標籤搜尋 -->
                <div class="flex-1 min-w-[180px]">
                  <input
                    v-model="filters.tags"
                    type="text"
                    placeholder="標籤搜尋 (多個用逗號分隔)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >

                  <!-- 標籤建議 -->
                  <div
                    v-if="suggestedTags.length > 0"
                    class="mt-2 flex flex-wrap gap-1"
                  >
                    <span class="text-xs text-gray-500 mr-2">常用標籤:</span>
                    <button
                      v-for="tag in suggestedTags.slice(0, 6)"
                      :key="tag"
                      type="button"
                      class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      @click="addTagToSearch(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 記錄列表 -->
            <div class="p-4">
              <div
                v-if="isLoading"
                class="text-center py-8"
              >
                <div class="text-gray-500">
                  載入中...
                </div>
              </div>

              <div
                v-else-if="records.length === 0"
                class="text-center py-8"
              >
                <div class="text-gray-500">
                  目前沒有記錄
                </div>
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <div
                  v-for="record in records"
                  :key="record._id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center space-x-4">
                    <div class="text-2xl">
                      {{ getCategoryIcon(record.categoryId) }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">
                        {{ record.description || '無描述' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ getCategoryName(record.categoryId) }} • {{ formatDate(record.date) }}
                      </div>
                      <div
                        v-if="record.tags && record.tags.length > 0"
                        class="mt-1 flex gap-1"
                      >
                        <span
                          v-for="tag in record.tags"
                          :key="tag"
                          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3">
                    <div
                      :class="[
                        'font-semibold',
                        record.type === 'income' ? 'text-green-600' : 'text-red-600',
                      ]"
                    >
                      {{ record.type === 'income' ? '+' : '-' }}${{ record.amount.toFixed(2) }}
                    </div>

                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm"
                      @click="editRecord(record)"
                    >
                      編輯
                    </button>

                    <button
                      class="text-red-600 hover:text-red-800 text-sm"
                      @click="deleteRecord(record._id)"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>

              <!-- 分頁控制 -->
              <div
                v-if="pagination.total > 0"
                class="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
              >
                <!-- 每頁顯示數量選擇器 -->
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-700">每頁顯示</span>
                  <select
                    v-model="pagination.limit"
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    @change="changePageSize"
                  >
                    <option value="5">
                      5 筆
                    </option>
                    <option value="10">
                      10 筆
                    </option>
                    <option value="20">
                      20 筆
                    </option>
                  </select>
                  <span class="text-sm text-gray-500">
                    共 {{ pagination.total }} 筆記錄
                  </span>
                </div>

                <!-- 分頁按鈕 -->
                <div
                  v-if="pagination.pages > 1"
                  class="flex items-center space-x-2"
                >
                  <!-- 上一頁 -->
                  <button
                    :disabled="pagination.page <= 1"
                    :class="[
                      'px-3 py-1 rounded text-sm transition-colors',
                      pagination.page <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    ]"
                    @click="changePage(pagination.page - 1)"
                  >
                    上一頁
                  </button>

                  <!-- 頁碼按鈕 -->
                  <div class="flex space-x-1">
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      :class="[
                        'px-3 py-1 rounded text-sm transition-colors',
                        page === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                      ]"
                      @click="changePage(page)"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <!-- 下一頁 -->
                  <button
                    :disabled="pagination.page >= pagination.pages"
                    :class="[
                      'px-3 py-1 rounded text-sm transition-colors',
                      pagination.page >= pagination.pages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    ]"
                    @click="changePage(pagination.page + 1)"
                  >
                    下一頁
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計摘要 -->
    <div
      v-if="summary"
      class="max-w-4xl mx-auto px-4 pb-6"
    >
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          本月統計
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
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
            <div class="text-2xl font-bold text-green-700">
              ${{ summary.totalIncome.toFixed(2) }}
            </div>
            <div class="text-sm text-green-600 font-medium">
              總收入
            </div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
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
            <div class="text-2xl font-bold text-red-700">
              ${{ summary.totalExpense.toFixed(2) }}
            </div>
            <div class="text-sm text-red-600 font-medium">
              總支出
            </div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div class="text-2xl font-bold text-blue-700">
              ${{ summary.netAmount.toFixed(2) }}
            </div>
            <div class="text-sm text-blue-600 font-medium">
              淨額
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度趨勢圖 -->
    <div class="max-w-4xl mx-auto px-4 pb-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            月度趨勢分析
          </h3>

          <!-- 趨勢圖控制選項 -->
          <div class="flex items-center space-x-4">
            <select
              v-model="trendPeriod"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm"
              @change="fetchTrends"
            >
              <option value="12">
                過去12個月
              </option>
              <option value="6">
                過去6個月
              </option>
              <option value="3">
                過去3個月
              </option>
            </select>

            <button
              :disabled="isTrendsLoading"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              @click="fetchTrends"
            >
              <span v-if="isTrendsLoading">載入中...</span>
              <span v-else>重新整理</span>
            </button>
          </div>
        </div>

        <!-- 圖表容器 - 始終存在以確保 ref 可用 -->
        <div class="relative h-80 mb-6">
          <canvas
            ref="trendsChartRef"
            class="w-full h-full"
            :style="{ display: trendsData?.trends && trendsData.trends.length > 0 ? 'block' : 'none' }"
          />
          
          <!-- 載入狀態覆蓋層 -->
          <div
            v-if="isTrendsLoading"
            class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75"
          >
            <div class="text-gray-500">
              載入趨勢資料中...
            </div>
          </div>

          <!-- 無資料狀態覆蓋層 -->
          <div
            v-else-if="!trendsData?.trends || trendsData.trends.length === 0"
            class="absolute inset-0 flex items-center justify-center bg-gray-50"
          >
            <div class="text-gray-500">
              暫無趨勢資料
            </div>
          </div>
        </div>

        <!-- 趨勢摘要 -->
        <div
          v-if="trendsData?.trends && trendsData.trends.length > 0 && !isTrendsLoading"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              ${{ trendsData.summary.avgIncome.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-600">
              平均月收入
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">
              ${{ trendsData.summary.avgExpense.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-600">
              平均月支出
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              ${{ trendsData.summary.avgNetAmount.toFixed(2) }}
            </div>
            <div class="text-sm text-gray-600">
              平均月淨額
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, type ChartConfiguration } from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 類型定義
interface Category {
  _id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  scope: string
}

interface Record {
  _id: string
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: string
  categoryId: string
  tags?: string[]
}

interface Summary {
  totalIncome: number
  totalExpense: number
  netAmount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

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

// 頁面標題
definePageMeta({
  title: '記帳管理',
  requiresAuth: true,
})

// 響應式數據
const categories = ref<Category[]>([])
const records = ref<Record[]>([])
const summary = ref<Summary | null>(null)
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
})

const isLoading = ref(false)
const isSubmitting = ref(false)

// 趨勢圖相關狀態
const isTrendsLoading = ref(false)
const trendsData = ref<TrendsData | null>(null)
const trendPeriod = ref(12)
const trendsChartRef = ref<HTMLCanvasElement>()
let trendsChart: Chart | null = null

// 編輯模式狀態
const editingRecord = ref<Record | null>(null)
const isEditing = computed(() => editingRecord.value !== null)

// 表單數據
const form = ref({
  type: 'expense' as 'income' | 'expense',
  amount: '',
  categoryId: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  tags: [] as string[],
})

const tagsInput = ref('')

// 標籤建議
const suggestedTags = ref<string[]>([])

// 篩選條件
const filters = ref({
  type: '',
  categoryId: '',
  search: '',
  tags: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
})

// 計算屬性
const filteredCategories = computed(() => {
  return categories.value.filter(category => category.type === form.value.type)
})

// 計算可見的頁碼（最多顯示5頁）
const visiblePages = computed(() => {
  const total = pagination.value.pages
  const current = pagination.value.page
  const pages = []

  if (total <= 5) {
    // 如果總頁數小於等於5，顯示所有頁碼
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  }
  else {
    // 否則顯示當前頁附近的5個頁碼
    let start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)

    // 確保始終顯示5個頁碼（如果可能）
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 年份選項 (當前年份的前後5年)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years.reverse() // 最新年份在前
})

// 月份選項
const monthOptions = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' },
]

// 監聽器
watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

watch(() => tagsInput.value, (newValue) => {
  if (newValue.includes(',')) {
    const tags = newValue.split(',').map(tag => tag.trim()).filter(Boolean)
    form.value.tags = [...new Set([...form.value.tags, ...tags])]
    tagsInput.value = ''
  }
})

watch([filters], () => {
  fetchRecords()
}, { deep: true })

// 監聽趨勢數據變化，重新渲染圖表
watch(() => trendsData.value, async () => {
  if (trendsData.value && trendsData.value.trends.length > 0) {
    await nextTick()
    await renderTrendsChart()
  }
}, { deep: true })

// 方法
const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories') as any
    categories.value = data.items
  }
  catch (error) {
    console.error('獲取分類失敗:', error)
  }
}

// 獲取標籤建議（從現有記錄中提取）
const fetchSuggestedTags = async () => {
  try {
    // 獲取所有記錄的標籤
    const response = await $fetch('/api/records?limit=100') as any
    const allTags = new Set<string>()

    response.data.items.forEach((record: any) => {
      if (record.tags && Array.isArray(record.tags)) {
        record.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    // 轉換為陣列並排序
    suggestedTags.value = Array.from(allTags).sort()
  }
  catch (error) {
    console.error('獲取標籤建議失敗:', error)
  }
}

const fetchRecords = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    })

    if (filters.value.type) params.append('type', filters.value.type)
    if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId)
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.tags) params.append('tags', filters.value.tags)
    if (filters.value.year) params.append('year', filters.value.year.toString())
    if (filters.value.month) params.append('month', filters.value.month.toString())

    const response = await $fetch(`/api/records?${params}`) as any
    records.value = response.data.items
    pagination.value = response.data.pagination
    summary.value = response.data.summary
  }
  catch (error) {
    console.error('獲取記錄失敗:', error)
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // 處理尚未加入的標籤輸入
    if (tagsInput.value.trim()) {
      const pendingTags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
      form.value.tags = [...new Set([...form.value.tags, ...pendingTags])]
    }

    const payload = {
      ...form.value,
      amount: Number.parseFloat(form.value.amount),
      date: new Date(form.value.date).toISOString(),
    }

    if (isEditing.value && editingRecord.value) {
      // 編輯模式 - 更新記錄
      await $fetch(`/api/records/${editingRecord.value._id}`, {
        method: 'PUT',
        body: payload,
      })
      alert('記錄更新成功！')
    }
    else {
      // 新增模式 - 創建記錄
      await $fetch('/api/records', {
        method: 'POST',
        body: payload,
      })
      alert('記錄新增成功！')
    }

    // 重置表單
    resetForm()

    // 重新載入記錄
    await fetchRecords()
  }
  catch (error: any) {
    console.error(isEditing.value ? '更新記錄失敗:' : '新增記錄失敗:', error)
    alert((isEditing.value ? '更新記錄失敗：' : '新增記錄失敗：') + (error.data?.message || error.message))
  }
  finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
  }
  tagsInput.value = ''
  editingRecord.value = null
}

const removeTag = (tagToRemove: string) => {
  form.value.tags = form.value.tags.filter(tag => tag !== tagToRemove)
}

const editRecord = (record: Record) => {
  editingRecord.value = record

  // 填入表單數據
  form.value = {
    type: record.type,
    amount: record.amount.toString(),
    categoryId: record.categoryId,
    description: record.description || '',
    date: new Date(record.date).toISOString().split('T')[0],
    tags: record.tags ? [...record.tags] : [],
  }

  tagsInput.value = ''

  // 滾動到表單頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}

// 添加標籤到搜尋
const addTagToSearch = (tag: string) => {
  if (!filters.value.tags) {
    filters.value.tags = tag
  }
  else {
    // 檢查標籤是否已存在
    const existingTags = filters.value.tags.split(',').map(t => t.trim())
    if (!existingTags.includes(tag)) {
      filters.value.tags += ', ' + tag
    }
  }
}

const deleteRecord = async (recordId: string) => {
  if (!confirm('確定要刪除這筆記錄嗎？')) return

  try {
    await $fetch(`/api/records/${recordId}`, { method: 'DELETE' })
    await fetchRecords()
    alert('記錄刪除成功！')
  }
  catch (error: any) {
    console.error('刪除記錄失敗:', error)
    alert('刪除記錄失敗：' + (error.data?.message || error.message))
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchRecords()
}

const changePageSize = () => {
  // 當改變每頁顯示數量時，重置到第1頁
  pagination.value.page = 1
  fetchRecords()
}

const getCategoryIcon = (categoryId: string) => {
  const category = categories.value.find(c => c._id === categoryId)
  return category?.icon || '📝'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c._id === categoryId)
  return category?.name || '未知分類'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 趨勢圖相關方法
const fetchTrends = async () => {
  isTrendsLoading.value = true
  try {
    const params = new URLSearchParams({
      months: trendPeriod.value.toString(),
    })

    const response = await $fetch(`/api/statistics/trends?${params}`) as any
    
    trendsData.value = response.data

    // 等待 DOM 更新後繪製圖表
    await nextTick()
    // 再等一個 tick 確保 Canvas 元素完全渲染
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
    // 如果 Canvas 元素還沒準備好，等待一下再試
    if (!trendsChartRef.value && trendsData.value && trendsData.value.trends.length > 0) {
      setTimeout(async () => {
        await renderTrendsChart()
      }, 100)
    }
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

  // 計算 Y 軸的最大值，確保圖表有合理的範圍
  const allValues = [
    ...trends.map(t => t.totalIncome),
    ...trends.map(t => t.totalExpense),
    ...trends.map(t => Math.abs(t.netAmount))
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
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: '支出',
          data: trends.map(trend => trend.totalExpense),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: '淨額',
          data: trends.map(trend => trend.netAmount),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
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
            padding: 20,
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
            color: 'rgba(0, 0, 0, 0.1)',
          },
          title: {
            display: true,
            text: '月份',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          suggestedMax,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
          },
          title: {
            display: true,
            text: '金額 ($)',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          ticks: {
            callback: function(value) {
              return '$' + Number(value).toFixed(0)
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
          hoverBorderWidth: 2,
        },
      },
    },
  }

  try {
    trendsChart = new Chart(ctx, chartConfig)
  } catch (error) {
    console.error('創建圖表失敗:', error)
  }
}

// 生命週期
onMounted(async () => {
  await fetchCategories()
  await fetchSuggestedTags()
  await fetchRecords()
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
