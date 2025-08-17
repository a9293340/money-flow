<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-gray-900">
        {{ title }}
      </h3>
      <NuxtLink
        v-if="showViewAllLink"
        to="/budgets"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        查看全部
      </NuxtLink>
    </div>

    <!-- Stats Grid -->
    <div
      v-if="stats"
      class="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mb-3">
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
        <p class="text-lg font-bold text-gray-900">
          {{ stats.overview.totalBudgets }}
        </p>
        <p class="text-xs text-gray-500">
          預算總數
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-3">
          <svg
            class="w-5 h-5 text-green-600"
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
        <p class="text-lg font-bold text-gray-900">
          {{ stats.overview.activeBudgets }}
        </p>
        <p class="text-xs text-gray-500">
          進行中
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-3">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
        <p class="text-lg font-bold text-gray-900">
          ${{ stats.overview.totalAmount.toLocaleString() }}
        </p>
        <p class="text-xs text-gray-500">
          預算總額
        </p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mb-3">
          <svg
            class="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6"
            />
          </svg>
        </div>
        <p class="text-lg font-bold text-gray-900">
          ${{ stats.overview.totalSpent.toLocaleString() }}
        </p>
        <p class="text-xs text-gray-500">
          已花費
        </p>
      </div>
    </div>

    <!-- Warning Alerts -->
    <div
      v-if="stats && hasWarnings"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
    >
      <div class="flex items-start">
        <svg
          class="w-5 h-5 text-yellow-600 mt-0.5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-yellow-800 mb-1">
            預算警告
          </h4>
          <div class="text-sm text-yellow-700 space-y-1">
            <p v-if="stats.warnings.exceededBudgets > 0">
              {{ stats.warnings.exceededBudgets }} 個預算已超支
            </p>
            <p v-if="stats.warnings.dangerBudgets > 0">
              {{ stats.warnings.dangerBudgets }} 個預算達到危險狀態
            </p>
            <p v-if="stats.warnings.warningBudgets > 0">
              {{ stats.warnings.warningBudgets }} 個預算需要注意
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Budget Updates -->
    <div
      v-if="stats?.recentlyUpdated && stats.recentlyUpdated.length > 0"
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <h4 class="text-lg font-semibold text-gray-900 mb-4">
        近期更新的預算
      </h4>
      <div class="space-y-3">
        <div
          v-for="budget in stats?.recentlyUpdated?.slice(0, maxRecentItems)"
          :key="budget.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-900">
              {{ budget.name }}
            </p>
            <p class="text-sm text-gray-600">
              使用率: {{ budget.usageRate }}%
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">
              ${{ budget.spent.toLocaleString() }} / ${{ budget.amount.toLocaleString() }}
            </p>
            <div class="w-20 bg-gray-200 rounded-full h-2 mt-1">
              <div
                class="h-2 rounded-full transition-all"
                :class="{
                  'bg-green-500': budget.usageRate <= 70,
                  'bg-yellow-500': budget.usageRate > 70 && budget.usageRate <= 90,
                  'bg-red-500': budget.usageRate > 90,
                }"
                :style="{ width: Math.min(budget.usageRate, 100) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Budgets State -->
    <div
      v-else-if="stats && stats.overview.totalBudgets === 0"
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
        <svg
          class="w-6 h-6 text-orange-600"
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
      <h4 class="text-lg font-semibold text-gray-900 mb-2">
        開始設定預算
      </h4>
      <p class="text-gray-600 mb-4">
        建立預算來追蹤您的支出並達成理財目標
      </p>
      <NuxtLink
        to="/budgets/new"
        class="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
      >
        <svg
          class="w-4 h-4 mr-2"
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
        建立預算
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div
      v-else-if="!stats"
      class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4" />
      <p class="text-gray-600">
        載入預算資料中...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BudgetStats {
  overview: {
    totalBudgets: number
    activeBudgets: number
    completedBudgets: number
    totalAmount: number
    totalSpent: number
    totalRemaining: number
    avgUsageRate: number
  }
  warnings: {
    exceededBudgets: number
    dangerBudgets: number
    warningBudgets: number
    safeBudgets: number
  }
  currentMonth: {
    budgetCount: number
    totalAmount: number
    totalSpent: number
    usageRate: number
  }
  topSpendingBudgets: Array<{
    id: string
    name: string
    amount: number
    spent: number
    usageRate: number
    warningLevel: string
  }>
  recentlyUpdated: Array<{
    id: string
    name: string
    amount: number
    spent: number
    usageRate: number
    updatedAt: string
  }>
}

interface Props {
  stats?: BudgetStats | null
  title?: string
  showViewAllLink?: boolean
  maxRecentItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '預算概覽',
  showViewAllLink: true,
  maxRecentItems: 3,
})

// 計算是否有警告
const hasWarnings = computed(() => {
  if (!props.stats) return false
  const warnings = props.stats.warnings
  return warnings.exceededBudgets > 0 || warnings.dangerBudgets > 0 || warnings.warningBudgets > 0
})
</script>
