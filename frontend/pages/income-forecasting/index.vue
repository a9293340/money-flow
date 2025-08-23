<template>
  <div class="min-h-screen bg-background">
    <!-- App Header -->
    <AppHeader :user="user" />

    <!-- Page Header -->
    <div class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-foreground">
              收入預測管理
            </h1>
            <p class="text-muted-foreground">
              管理您的收入預測項目並進行智能匹配追蹤
            </p>
          </div>
          <div class="flex gap-3">
            <button
              :disabled="isRefreshing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="refreshData"
            >
              <svg
                v-if="!isRefreshing"
                class="mr-2 h-4 w-4"
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
              <svg
                v-else
                class="animate-spin mr-2 h-4 w-4"
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
              重新整理
            </button>
            <button
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="openCreateModal"
            >
              <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新增預測項目
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Stats -->
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6 grid gap-4 md:grid-cols-4">
        <!-- Summary Stats -->
        <div class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                總項目數
              </p>
              <p class="text-2xl font-bold">
                {{ summary.totalItems }}
              </p>
            </div>
            <svg
              class="h-8 w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                啟用項目
              </p>
              <p class="text-2xl font-bold text-green-600">
                {{ summary.activeItems }}
              </p>
            </div>
            <svg
              class="h-8 w-8 text-green-600"
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
        </div>

        <div class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                本月預期收入
              </p>
              <p class="text-2xl font-bold text-blue-600">
                {{ formatCurrency(summary.monthlyExpected) }}
              </p>
            </div>
            <svg
              class="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                匹配率
              </p>
              <p class="text-2xl font-bold text-orange-600">
                {{ summary.matchRate }}%
              </p>
            </div>
            <svg
              class="h-8 w-8 text-orange-600"
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
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 rounded-lg border border-border bg-card p-4">
        <div class="grid gap-4 md:grid-cols-4">
          <select
            v-model="filters.status"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            @change="applyFilters"
          >
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <select
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            @change="applyFilters"
          >
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <select
            v-model="filters.frequency"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500"
            @change="applyFilters"
          >
            <option
              v-for="option in frequencyOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              v-model="filters.search"
              type="text"
              placeholder="搜尋名稱或描述..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              @input="debounceSearch"
            >
          </div>
        </div>
      </div>

      <!-- Forecasting Items List -->
      <div class="space-y-4">
        <div
          v-if="isLoading"
          class="space-y-4"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="animate-pulse rounded-lg border border-border bg-card p-6"
          >
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <div class="h-4 w-48 rounded bg-muted" />
                <div class="h-3 w-32 rounded bg-muted" />
              </div>
              <div class="h-8 w-20 rounded bg-muted" />
            </div>
          </div>
        </div>

        <div
          v-else-if="forecastingItems.length === 0"
          class="rounded-lg border border-border bg-card p-12 text-center"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-foreground">
            尚無收入預測項目
          </h3>
          <p class="mt-2 text-muted-foreground">
            建立您的第一個收入預測項目來開始追蹤收入
          </p>
          <button
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            @click="openCreateModal"
          >
            新增預測項目
          </button>
        </div>

        <IncomeForecastingCard
          v-for="item in forecastingItems"
          :key="item._id"
          :item="item"
          @edit="openEditModal"
          @delete="confirmDelete"
          @match="performMatch"
          @generate-periods="openGeneratePeriodsModal"
          @view-details="viewDetails"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="forecastingItems.length > 0"
        class="mt-6 flex justify-center"
      >
        <nav class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="hidden sm:block">
            <p class="text-sm text-gray-700">
              显示 <span class="font-medium">{{ ((currentPage - 1) * pageSize) + 1 }}</span> 到
              <span class="font-medium">{{ Math.min(currentPage * pageSize, totalItems) }}</span> 的
              <span class="font-medium">{{ totalItems }}</span> 笔记录
            </p>
          </div>
          <div class="flex-1 flex justify-between sm:justify-end">
            <button
              :disabled="currentPage <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="currentPage--; loadData()"
            >
              上一頁
            </button>
            <button
              :disabled="currentPage >= Math.ceil(totalItems / pageSize)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="currentPage++; loadData()"
            >
              下一頁
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Modals -->
    <IncomeForecastingModal
      v-model="isModalOpen"
      :item="selectedItem"
      :mode="modalMode"
      @success="handleModalSuccess"
    />

    <GeneratePeriodsModal
      v-model="isGeneratePeriodsModalOpen"
      :forecasting-id="selectedItem?._id"
      @success="handleGeneratePeriodsSuccess"
    />

    <!-- Delete Confirmation -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="isDeleteModalOpen = false"
        />
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  class="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  確認刪除
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    確定要刪除收入預測項目「{{ selectedItem?.name }}」嗎？
                  </p>
                  <p class="text-sm text-gray-400 mt-1">
                    此操作會軟刪除項目，相關的追蹤期間也會被標記為已刪除。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              :disabled="isDeleting"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              @click="executeDelete"
            >
              <svg
                v-if="isDeleting"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              確認刪除
            </button>
            <button
              :disabled="isDeleting"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="isDeleteModalOpen = false"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomeForecastingItem, IncomeForecastingSummary } from '~/lib/models/IncomeForecasting'
import { debounce } from '~/utils/debounce'
// 明確導入組件
import GeneratePeriodsModal from '~/components/income-forecasting/GeneratePeriodsModal.vue'

// Meta
definePageMeta({
  title: '收入預測管理',
  requiresAuth: true,
})

// State
const isLoading = ref(true)
const isRefreshing = ref(false)
const isModalOpen = ref(false)
const isGeneratePeriodsModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedItem = ref<IncomeForecastingItem | null>(null)
const user = ref(null)

// Data
const forecastingItems = ref<IncomeForecastingItem[]>([])
const summary = ref<IncomeForecastingSummary>({
  totalItems: 0,
  activeItems: 0,
  monthlyExpected: 0,
  matchRate: 0,
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// Filters
const filters = ref({
  status: '',
  category: '',
  frequency: '',
  search: '',
})

// Options for filters
const statusOptions = [
  { label: '全部狀態', value: '' },
  { label: '啟用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const frequencyOptions = [
  { label: '全部頻率', value: '' },
  { label: '每日', value: 'daily' },
  { label: '每週', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每季', value: 'quarterly' },
  { label: '每年', value: 'yearly' },
]

const categoryOptions = ref([
  { label: '全部分類', value: '' },
])

// Composables
const { formatCurrency } = useCurrency()
const toast = {
  add: (options: { title: string, description?: string, color?: string }) => {
    // Simple console log for now
    console.log('Toast:', options.title, options.description)
  },
}

// Debounced search
const debounceSearch = debounce(() => {
  applyFilters()
}, 500)

// Methods
async function loadData() {
  try {
    isLoading.value = currentPage.value === 1

    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v !== '')),
    })

    const response = await $fetch(`/api/income-forecasting?${params}`)
    const typedResponse = response as {
      success: boolean
      data: {
        items: IncomeForecastingItem[]
        pagination: {
          total: number
          page: number
          limit: number
          pages: number
        }
        summary: IncomeForecastingSummary
      }
    }

    // 確保 typedResponse.data 存在
    if (typedResponse.success && typedResponse.data) {
      forecastingItems.value = typedResponse.data.items || []
      totalItems.value = typedResponse.data.pagination?.total || 0
      summary.value = typedResponse.data.summary || {
        totalItems: 0,
        activeItems: 0,
        monthlyExpected: 0,
        matchRate: 0,
      }
    }
    else {
      // 如果 API 回應不正確，設置預設值
      forecastingItems.value = []
      totalItems.value = 0
      summary.value = {
        totalItems: 0,
        activeItems: 0,
        monthlyExpected: 0,
        matchRate: 0,
      }
    }
  }
  catch (error) {
    console.error('載入收入預測項目失敗:', error)
    // 發生錯誤時也要設置預設值
    forecastingItems.value = []
    totalItems.value = 0
    summary.value = {
      totalItems: 0,
      activeItems: 0,
      monthlyExpected: 0,
      matchRate: 0,
    }
    toast.add({
      title: '載入失敗',
      description: '無法載入收入預測項目，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

async function loadCategories() {
  try {
    const response: any = await $fetch('/api/categories?type=income')

    // 檢查回應格式 - API 回傳的是 data.items 結構
    if (response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      categoryOptions.value = [
        { label: '全部分類', value: '' },
        ...response.data.items.map((cat: any) => ({ label: cat.name, value: cat._id })),
      ]
      console.log('成功載入分類篩選:', response.data.items.length, '個分類')
    }
    else {
      // 如果資料格式不正確，設置預設值
      categoryOptions.value = [{ label: '全部分類', value: '' }]
      console.warn('Categories API 回應格式不正確:', response)
    }
  }
  catch (error) {
    console.error('載入分類失敗:', error)
    // 發生錯誤時設置預設值
    categoryOptions.value = [{ label: '全部分類', value: '' }]
    toast.add({
      title: '載入失敗',
      description: '無法載入收入分類，請稍後再試',
      color: 'red',
    })
  }
}

function applyFilters() {
  currentPage.value = 1
  loadData()
}

function refreshData() {
  isRefreshing.value = true
  loadData()
}

function openCreateModal() {
  selectedItem.value = null
  modalMode.value = 'create'
  isModalOpen.value = true
}

function openEditModal(item: IncomeForecastingItem) {
  selectedItem.value = item
  modalMode.value = 'edit'
  isModalOpen.value = true
}

function confirmDelete(item: IncomeForecastingItem) {
  selectedItem.value = item
  isDeleteModalOpen.value = true
}

async function executeDelete() {
  if (!selectedItem.value) return

  try {
    isDeleting.value = true
    await $fetch(`/api/income-forecasting/${selectedItem.value._id}`, {
      method: 'DELETE',
    })

    toast.add({
      title: '刪除成功',
      description: '收入預測項目已成功刪除',
      color: 'green',
    })

    isDeleteModalOpen.value = false
    loadData()
  }
  catch (error) {
    console.error('刪除失敗:', error)
    toast.add({
      title: '刪除失敗',
      description: '無法刪除收入預測項目，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isDeleting.value = false
  }
}

async function performMatch(item: IncomeForecastingItem) {
  try {
    const response: any = await $fetch(`/api/income-forecasting/${item._id}/match`, {
      method: 'POST',
    })

    toast.add({
      title: '匹配完成',
      description: response.message,
      color: 'green',
    })

    loadData()
  }
  catch (error: any) {
    console.error('智能匹配失敗:', error)
    toast.add({
      title: '匹配失敗',
      description: error.data?.message || '智能匹配失敗，請稍後再試',
      color: 'red',
    })
  }
}

function openGeneratePeriodsModal(item: IncomeForecastingItem) {
  selectedItem.value = item
  isGeneratePeriodsModalOpen.value = true
}

function viewDetails(item: IncomeForecastingItem) {
  navigateTo(`/income-forecasting/${item._id}`)
}

async function handleModalSuccess() {
  isModalOpen.value = false
  // 確保數據刷新
  await loadData()
  // 如果是新增模式，重置到第一頁顯示最新數據
  if (modalMode.value === 'create') {
    currentPage.value = 1
    await loadData()
  }
}

function handleGeneratePeriodsSuccess() {
  isGeneratePeriodsModalOpen.value = false
  loadData()
}

// Load user info
async function loadUser() {
  try {
    const response = await $fetch('/api/auth/me')
    const typedResponse = response as {
      success: boolean
      data: any
    }

    if (typedResponse.success) {
      user.value = typedResponse.data
    }
  }
  catch (error) {
    console.error('載入使用者資訊失敗:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadUser()
  loadCategories()
  loadData()
})
</script>
