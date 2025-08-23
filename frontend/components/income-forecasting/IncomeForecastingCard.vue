<template>
  <div class="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg">
    <div class="flex items-start justify-between">
      <!-- Main Info -->
      <div class="flex-1 space-y-3">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ item.name }}
          </h3>
          <span
            :class="item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          >
            {{ item.isActive ? '啟用' : '停用' }}
          </span>
          <span
            v-if="item.matchingConfig.autoMatch"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            自動匹配
          </span>
        </div>

        <div
          v-if="item.description"
          class="text-sm text-gray-600"
        >
          {{ item.description }}
        </div>

        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <!-- Expected Amount -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-green-600"
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
            <div>
              <p class="text-xs text-gray-500">
                預期金額
              </p>
              <p class="font-semibold">
                {{ formatCurrency(item.expectedAmount, item.currency) }}
              </p>
            </div>
          </div>

          <!-- Category -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-blue-600"
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
            <div>
              <p class="text-xs text-gray-500">
                分類
              </p>
              <p class="font-semibold">
                {{ getCategoryDisplay(item.incomeCategory) }}
              </p>
            </div>
          </div>

          <!-- Frequency -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p class="text-xs text-gray-500">
                頻率
              </p>
              <p class="font-semibold">
                {{ getFrequencyLabel(item.frequency) }}
              </p>
            </div>
          </div>

          <!-- Date Range -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p class="text-xs text-gray-500">
                期間
              </p>
              <p class="font-semibold">
                {{ formatDate(item.startDate) }}
                <span v-if="item.endDate"> - {{ formatDate(item.endDate) }}</span>
                <span
                  v-else
                  class="text-gray-500"
                > - 無期限</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div
          v-if="item.statistics"
          class="rounded-lg bg-gray-50 p-4"
        >
          <h4 class="mb-3 text-sm font-semibold text-gray-900">
            統計資訊
          </h4>
          <div class="grid gap-3 md:grid-cols-4">
            <div class="text-center">
              <p class="text-lg font-bold text-blue-600">
                {{ item.statistics.totalPeriods }}
              </p>
              <p class="text-xs text-gray-500">
                追蹤期間
              </p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-green-600">
                {{ item.statistics.matchedRecords }}
              </p>
              <p class="text-xs text-gray-500">
                匹配記錄
              </p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-orange-600">
                {{ item.statistics.averageAccuracy ? `${item.statistics.averageAccuracy}%` : '0%' }}
              </p>
              <p class="text-xs text-gray-500">
                平均準確度
              </p>
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-purple-600">
                {{ formatCurrency(item.statistics.totalMatchedAmount || 0, item.currency) }}
              </p>
              <p class="text-xs text-gray-500">
                匹配總額
              </p>
            </div>
          </div>
        </div>

        <!-- Matching Config -->
        <div class="flex items-center gap-6 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <svg
              class="h-4 w-4"
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
            <span>金額容差: ±{{ item.matchingConfig.amountTolerance }}%</span>
          </div>
          <div class="flex items-center gap-1">
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>日期容差: ±{{ item.matchingConfig.dateTolerance }} 天</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="ml-4 flex flex-col gap-2">
        <div class="relative">
          <button
            class="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            @click="toggleDropdown"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          <div
            v-if="showDropdown"
            class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          >
            <div class="py-1">
              <button
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                @click="$emit('view-details', item); showDropdown = false"
              >
                查看詳情
              </button>
              <button
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                @click="$emit('edit', item); showDropdown = false"
              >
                編輯
              </button>
              <button
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                @click="$emit('generate-periods', item); showDropdown = false"
              >
                生成期間
              </button>
              <hr class="my-1">
              <button
                class="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                @click="$emit('delete', item); showDropdown = false"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div
      v-if="item.statistics && item.statistics.totalPeriods > 0"
      class="mt-4"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">匹配進度</span>
        <span class="font-semibold">
          {{ item.statistics.matchedRecords }} / {{ item.statistics.totalPeriods }} 期間
        </span>
      </div>
      <div class="mt-2 h-2 w-full rounded-full bg-gray-200">
        <div
          class="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
          :style="{ width: `${getMatchingProgress()}%` }"
        />
      </div>
    </div>

    <!-- Quick Actions (visible on hover) -->
    <div class="mt-4 flex gap-2">
      <button
        v-if="item.isActive && item.matchingConfig.autoMatch"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="$emit('match', item)"
      >
        <svg
          class="mr-1.5 h-3 w-3"
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
        執行匹配
      </button>
      <button
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="$emit('generate-periods', item)"
      >
        <svg
          class="mr-1.5 h-3 w-3"
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
        生成期間
      </button>
      <button
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="$emit('view-details', item)"
      >
        <svg
          class="mr-1.5 h-3 w-3"
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
        檢視詳情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomeForecastingItem } from '~/lib/models/IncomeForecasting'

interface Props {
  item: IncomeForecastingItem
}

interface Emits {
  'edit': [item: IncomeForecastingItem]
  'delete': [item: IncomeForecastingItem]
  'match': [item: IncomeForecastingItem]
  'generate-periods': [item: IncomeForecastingItem]
  'view-details': [item: IncomeForecastingItem]
}

const props = defineProps<Props>()
defineEmits<Emits>()

// State
const showDropdown = ref(false)

// Composables
const { formatCurrency } = useCurrency()
const { formatDate } = useDateFormat()

// Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showDropdown.value = false
    }
  })
})

// Computed
function getMatchingProgress(): number {
  if (!props.item.statistics || props.item.statistics.totalPeriods === 0) {
    return 0
  }
  return Math.round((props.item.statistics.matchedRecords / props.item.statistics.totalPeriods) * 100)
}

function getCategoryDisplay(category: any): string {
  if (typeof category === 'string') {
    return category
  }
  return category?.name || '未知分類'
}

function getFrequencyLabel(frequency: string): string {
  const labels = {
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    quarterly: '每季',
    yearly: '每年',
  }
  return labels[frequency as keyof typeof labels] || frequency
}
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
