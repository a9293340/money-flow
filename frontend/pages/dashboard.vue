<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- App Header -->
    <AppHeader :user="user" />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Welcome Section -->
      <div class="mb-8">
        <div class="text-center">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            歡迎回來，{{ user?.name || 'Loading...' }}
          </h2>
          <p class="text-gray-600">
            {{ formatWelcomeTime() }}，管理您的財務數據
          </p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <!-- Total Balance -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
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
          <h3 class="text-2xl font-bold text-gray-900 mb-1">
            ${{ stats?.netAmount?.toFixed(2) || '0.00' }}
          </h3>
          <p class="text-sm text-gray-500">
            總餘額
          </p>
        </div>

        <!-- This Month Income -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4">
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
          <h3 class="text-2xl font-bold text-green-600 mb-1">
            ${{ stats?.totalIncome?.toFixed(2) || '0.00' }}
          </h3>
          <p class="text-sm text-gray-500">
            本月收入
          </p>
        </div>

        <!-- This Month Expenses -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mb-4">
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
          <h3 class="text-2xl font-bold text-red-600 mb-1">
            ${{ stats?.totalExpense?.toFixed(2) || '0.00' }}
          </h3>
          <p class="text-sm text-gray-500">
            本月支出
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Add Record Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            快速記帳
          </h3>
          <p class="text-gray-600 mb-4">
            快速添加您的收支記錄
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

        <!-- Categories Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            分類管理
          </h3>
          <p class="text-gray-600 mb-4">
            管理您的收支分類設定
          </p>
          <NuxtLink
            to="/categories"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            管理分類
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

      <!-- Recent Transactions (if needed) -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            近期記錄
          </h3>
          <NuxtLink
            to="/records"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部
          </NuxtLink>
        </div>
        <div class="text-center py-8 text-gray-500">
          <svg
            class="w-12 h-12 mx-auto mb-3 opacity-50"
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
          <p>點擊「開始記帳」來添加您的第一筆記錄</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authenticatedFetch, handleRequireLogin } from '~/lib/utils/auth'

// 頁面設定
definePageMeta({
  auth: true,
})

// 響應式數據
const user = ref<any>(null)
const userError = ref('')
const loading = ref(false)
const stats = ref<any>(null)

// 頁面載入時獲取用戶資料
onMounted(() => {
  loadUser()
  loadStats()
})

// 載入使用者資訊
async function loadUser() {
  if (loading.value) return

  loading.value = true
  userError.value = ''

  try {
    const response = await authenticatedFetch<{
      success: boolean
      message?: string
      data?: {
        user: any
      }
      requireLogin?: boolean
    }>('/api/auth/me')

    if (response.success && response.data?.user) {
      user.value = response.data.user
    }
    else if (response.requireLogin) {
      userError.value = '需要重新登入'
      handleRequireLogin()
    }
    else {
      userError.value = response.message || '載入使用者資訊失敗'
    }
  }
  catch (error) {
    if (error instanceof Error && error.message === 'REQUIRE_LOGIN') {
      userError.value = 'Token 已過期，請重新登入'
      handleRequireLogin()
    }
    else {
      userError.value = '載入使用者資訊失敗'
    }
  }
  finally {
    loading.value = false
  }
}

// 載入統計數據
async function loadStats() {
  try {
    const response = await authenticatedFetch<{
      success: boolean
      data?: {
        summary?: any
      }
    }>('/api/records')

    if (response.success && response.data?.summary) {
      stats.value = response.data.summary
    }
  }
  catch (error) {
    console.error('載入統計失敗:', error)
  }
}

// 格式化歡迎時間
function formatWelcomeTime() {
  const hour = new Date().getHours()
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}

// SEO
useHead({
  title: 'Dashboard - Money Flow',
  meta: [
    { name: 'description', content: 'Money Flow Dashboard - 個人財務管理中心' },
  ],
})
</script>
