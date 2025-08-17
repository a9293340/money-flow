<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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

    <p class="text-gray-600 mb-6">
      {{ description || '快速存取預算相關功能' }}
    </p>

    <div class="space-y-3">
      <!-- 查看所有預算 -->
      <NuxtLink
        to="/budgets"
        class="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors group"
      >
        <svg
          class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
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
        查看所有預算
      </NuxtLink>

      <!-- 新增預算 -->
      <NuxtLink
        to="/budgets/new"
        class="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200 transition-colors group"
      >
        <svg
          class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
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
        新增預算
      </NuxtLink>

      <!-- 新增支出記錄 -->
      <NuxtLink
        v-if="showRecordAction"
        to="/records"
        class="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors group"
      >
        <svg
          class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
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
        新增支出記錄
      </NuxtLink>

      <!-- 自定義動作 -->
      <div
        v-for="action in customActions"
        :key="action.label"
        class="w-full"
      >
        <component
          :is="action.to ? 'NuxtLink' : 'button'"
          :to="action.to"
          :class="`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${action.class || 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`"
          @click="action.onClick && action.onClick()"
        >
          <svg
            v-if="action.icon"
            class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="action.icon"
            />
          </svg>
          {{ action.label }}
        </component>
      </div>
    </div>

    <!-- 統計信息 -->
    <div
      v-if="showStats && stats"
      class="mt-6 pt-6 border-t border-gray-200"
    >
      <div class="grid grid-cols-2 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-orange-600">
            {{ stats.activeBudgets }}
          </p>
          <p class="text-xs text-gray-500">
            進行中預算
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">
            ${{ stats.totalAmount?.toLocaleString() || '0' }}
          </p>
          <p class="text-xs text-gray-500">
            預算總額
          </p>
        </div>
      </div>
    </div>

    <!-- 警告信息 -->
    <div
      v-if="showWarnings && warnings?.length && warnings.length > 0"
      class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <div class="flex items-start">
        <svg
          class="w-4 h-4 text-yellow-600 mt-0.5 mr-2"
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
        <div class="text-sm text-yellow-700">
          <p class="font-medium">
            預算提醒
          </p>
          <ul class="mt-1 space-y-1">
            <li
              v-for="warning in warnings?.slice(0, 2)"
              :key="warning"
            >
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CustomAction {
  label: string
  to?: string
  onClick?: () => void
  icon?: string
  class?: string
}

interface BudgetStats {
  activeBudgets: number
  totalAmount: number
  totalBudgets: number
}

interface Props {
  description?: string
  showRecordAction?: boolean
  showStats?: boolean
  showWarnings?: boolean
  stats?: BudgetStats
  warnings?: string[]
  customActions?: CustomAction[]
}

withDefaults(defineProps<Props>(), {
  showRecordAction: true,
  showStats: false,
  showWarnings: false,
  customActions: () => [],
})
</script>
