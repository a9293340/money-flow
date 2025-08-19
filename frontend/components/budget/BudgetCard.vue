<template>
  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div class="p-6">
      <div class="flex flex-col space-y-4">
        <div class="flex-1">
          <!-- 標題 -->
          <div class="mb-4">
            <h3 class="text-xl font-bold text-gray-900 leading-tight">
              {{ budget.name }}
            </h3>
          </div>

          <!-- 標籤區域：移動端垂直佈局 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full"
              :class="getStatusColor(budget.status)"
            >
              {{ formatStatus(budget.status) }}
            </span>
            <span
              class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full"
              :class="getWarningColor(budget.warningLevel)"
            >
              {{ formatWarningLevel(budget.warningLevel) }}
            </span>

            <!-- 模板標識 -->
            <span
              v-if="budget.isTemplate"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full bg-purple-100 text-purple-800"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              重複模板
            </span>
          </div>

          <p
            v-if="budget.description"
            class="text-gray-600 text-base mb-4 leading-relaxed"
          >
            {{ budget.description }}
          </p>

          <!-- 移動端友好的統計卡片 -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <!-- 預算金額 -->
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-gray-500 text-sm font-medium mb-1">
                預算金額
              </p>
              <p class="text-lg font-bold text-gray-900">
                ${{ budget.amount.toLocaleString() }}
              </p>
            </div>

            <!-- 已花費 -->
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-gray-500 text-sm font-medium mb-1">
                已花費
              </p>
              <p
                class="text-lg font-bold"
                :class="{
                  'text-red-600': budget.usagePercentage > 100,
                  'text-orange-600': budget.usagePercentage > 90 && budget.usagePercentage <= 100,
                  'text-yellow-600': budget.usagePercentage > 70 && budget.usagePercentage <= 90,
                  'text-gray-900': budget.usagePercentage <= 70,
                }"
              >
                ${{ budget.currentSpent.toLocaleString() }}
              </p>
            </div>

            <!-- 使用率 -->
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-gray-500 text-sm font-medium mb-1">
                使用率
              </p>
              <p
                class="text-lg font-bold"
                :class="{
                  'text-red-600': budget.usagePercentage > 100,
                  'text-orange-600': budget.usagePercentage > 90 && budget.usagePercentage <= 100,
                  'text-yellow-600': budget.usagePercentage > 70 && budget.usagePercentage <= 90,
                  'text-green-600': budget.usagePercentage <= 70,
                }"
              >
                {{ budget.usagePercentage }}%
              </p>
            </div>

            <!-- 剩餘天數 -->
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-gray-500 text-sm font-medium mb-1">
                剩餘天數
              </p>
              <p
                class="text-lg font-bold"
                :class="{
                  'text-red-600': budget.remainingDays <= 3 && budget.usagePercentage > 50,
                  'text-orange-600': budget.remainingDays <= 7 && budget.usagePercentage > 30,
                  'text-gray-900': budget.remainingDays > 7 || budget.usagePercentage <= 30,
                }"
              >
                {{ budget.remainingDays }} 天
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-700 font-medium">進度</span>
              <span
                class="text-lg font-bold"
                :class="{
                  'text-red-600': budget.usagePercentage > 100,
                  'text-orange-600': budget.usagePercentage > 90 && budget.usagePercentage <= 100,
                  'text-yellow-600': budget.usagePercentage > 70 && budget.usagePercentage <= 90,
                  'text-green-600': budget.usagePercentage <= 70,
                }"
              >
                {{ budget.usagePercentage }}%
                <span
                  v-if="budget.usagePercentage > 100"
                  class="ml-1 text-red-500"
                >⚠️</span>
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-300 relative"
                :class="{
                  'bg-green-500': budget.usagePercentage <= 70,
                  'bg-yellow-500': budget.usagePercentage > 70 && budget.usagePercentage <= 90,
                  'bg-red-500': budget.usagePercentage > 90,
                }"
                :style="{ width: Math.min(budget.usagePercentage, 100) + '%' }"
              >
                <!-- 超支動畫效果 -->
                <div
                  v-if="budget.usagePercentage > 100"
                  class="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-full animate-pulse shadow-lg"
                  style="animation: pulse-red 1s ease-in-out infinite;"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕區域 -->
        <div
          v-if="showActions"
          class="flex flex-col gap-3 pt-4 border-t border-gray-100"
        >
          <!-- 主要操作：查看詳情 -->
          <NuxtLink
            :to="`/budgets/${budget._id}`"
            class="flex items-center justify-center px-4 py-3 text-base font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            查看詳情
          </NuxtLink>

          <!-- 次要操作按鈕 -->
          <div class="grid grid-cols-2 gap-2">
            <!-- 模板相關操作 -->
            <template v-if="budget.isTemplate">
              <button
                class="flex items-center justify-center px-3 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                @click="$emit('generate-current', budget._id)"
              >
                <svg
                  class="w-4 h-4 mr-1"
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
                生成預算
              </button>
              <button
                class="flex items-center justify-center px-3 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                @click="$emit('toggle-template', budget._id)"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                取消模板
              </button>
            </template>
            <template v-else>
              <button
                class="flex items-center justify-center px-3 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors col-span-2"
                @click="$emit('toggle-template', budget._id)"
              >
                <svg
                  class="w-4 h-4 mr-1"
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
                設為模板
              </button>
            </template>
          </div>

          <!-- 危險操作：刪除 -->
          <button
            v-if="showDeleteAction"
            class="flex items-center justify-center px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
            @click="$emit('delete', budget._id)"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            刪除預算
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Budget {
  _id: string
  name: string
  description?: string
  amount: number
  currentSpent: number
  usagePercentage: number
  remainingDays: number
  status: 'active' | 'inactive' | 'completed' | 'exceeded'
  warningLevel: 'safe' | 'warning' | 'danger' | 'exceeded'

  // 重複模板相關
  isTemplate?: boolean
  templateFrequency?: 'monthly' | 'quarterly' | 'yearly'
  lastGeneratedPeriod?: string
  periodType?: 'monthly' | 'quarterly' | 'yearly'
}

interface Props {
  budget: Budget
  showActions?: boolean
  showDeleteAction?: boolean
}

interface Emits {
  'delete': [id: string]
  'toggle-template': [id: string]
  'generate-current': [id: string]
}

withDefaults(defineProps<Props>(), {
  showActions: true,
  showDeleteAction: true,
})

defineEmits<Emits>()

// 使用預算相關的格式化函數
const { getWarningColor, getStatusColor, formatStatus, formatWarningLevel } = useBudgets()
</script>

<style scoped>
@keyframes pulse-red {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}
</style>
