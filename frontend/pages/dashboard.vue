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

      <!-- Stats Cards - Modern Scrollable Layout -->
      <div class="mb-8">
        <!-- Desktop Layout -->
        <div class="hidden md:grid grid-cols-3 gap-6">
          <!-- Total Balance -->
          <div class="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-6">
                <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <svg
                    class="w-8 h-8 text-white"
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
                <div class="text-right">
                  <div class="text-xs text-blue-100 uppercase tracking-wide">
                    總餘額
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <h3 class="text-4xl font-bold">
                  ${{ stats?.netAmount?.toFixed(2) || '0.00' }}
                </h3>
                <p class="text-blue-100 text-sm">
                  當前可用資金
                </p>
              </div>
            </div>
          </div>

          <!-- This Month Income -->
          <div class="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-6">
                <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <svg
                    class="w-8 h-8 text-white"
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
                <div class="text-right">
                  <div class="text-xs text-green-100 uppercase tracking-wide">
                    本月收入
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <h3 class="text-4xl font-bold">
                  ${{ stats?.totalIncome?.toFixed(2) || '0.00' }}
                </h3>
                <p class="text-green-100 text-sm">
                  {{ new Date().toLocaleDateString('zh-TW', { month: 'long' }) }}進帳
                </p>
              </div>
            </div>
          </div>

          <!-- This Month Expenses -->
          <div class="group bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-8 text-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-6">
                <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <svg
                    class="w-8 h-8 text-white"
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
                <div class="text-right">
                  <div class="text-xs text-red-100 uppercase tracking-wide">
                    本月支出
                  </div>
                </div>
              </div>
              <div class="space-y-2">
                <h3 class="text-4xl font-bold">
                  ${{ stats?.totalExpense?.toFixed(2) || '0.00' }}
                </h3>
                <p class="text-red-100 text-sm">
                  {{ new Date().toLocaleDateString('zh-TW', { month: 'long' }) }}花費
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Layout - Horizontal Scroll -->
        <div class="md:hidden">
          <div class="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 -mx-4">
            <!-- Total Balance Mobile -->
            <div class="flex-shrink-0 w-80 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
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
                  <div class="text-xs text-blue-100 uppercase tracking-wide">
                    總餘額
                  </div>
                </div>
                <div class="space-y-1">
                  <h3 class="text-3xl font-bold">
                    ${{ stats?.netAmount?.toFixed(2) || '0.00' }}
                  </h3>
                  <p class="text-blue-100 text-sm">
                    當前可用資金
                  </p>
                </div>
              </div>
            </div>

            <!-- This Month Income Mobile -->
            <div class="flex-shrink-0 w-80 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
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
                  <div class="text-xs text-green-100 uppercase tracking-wide">
                    本月收入
                  </div>
                </div>
                <div class="space-y-1">
                  <h3 class="text-3xl font-bold">
                    ${{ stats?.totalIncome?.toFixed(2) || '0.00' }}
                  </h3>
                  <p class="text-green-100 text-sm">
                    {{ new Date().toLocaleDateString('zh-TW', { month: 'long' }) }}進帳
                  </p>
                </div>
              </div>
            </div>

            <!-- This Month Expenses Mobile -->
            <div class="flex-shrink-0 w-80 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-6 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                  <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
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
                  <div class="text-xs text-red-100 uppercase tracking-wide">
                    本月支出
                  </div>
                </div>
                <div class="space-y-1">
                  <h3 class="text-3xl font-bold">
                    ${{ stats?.totalExpense?.toFixed(2) || '0.00' }}
                  </h3>
                  <p class="text-red-100 text-sm">
                    {{ new Date().toLocaleDateString('zh-TW', { month: 'long' }) }}花費
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="mb-8">
        <BudgetOverview :stats="budgetStats" />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

        <!-- Budgets Card -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                class="w-5 h-5 text-orange-600"
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
            預算管理
          </h3>
          <p class="text-gray-600 mb-4">
            設定和追蹤您的預算規劃
          </p>
          <NuxtLink
            to="/budgets"
            class="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            管理預算
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

      <!-- Category Pie Chart Statistics -->
      <div class="mb-8">
        <CategoryPieChart />
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
const budgetStats = ref<any>(null)

// 頁面載入時獲取用戶資料
onMounted(() => {
  loadUser()
  loadStats()
  loadBudgetStats()
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

// 載入預算統計數據
async function loadBudgetStats() {
  try {
    const response = await authenticatedFetch<{
      success: boolean
      data?: any
    }>('/api/budgets/stats')

    if (response.success && response.data) {
      budgetStats.value = response.data
    }
  }
  catch (error) {
    console.error('載入預算統計失敗:', error)
    // 如果沒有預算或載入失敗，保持 budgetStats 為 null，會顯示建立預算的提示
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

<style scoped>
/* 隱藏滾動條但保持可滾動功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 為移動端滑動添加平滑滾動 */
.overflow-x-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
</style>
