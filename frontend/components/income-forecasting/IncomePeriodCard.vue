<template>
  <div class="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <!-- Period Info -->
      <div class="flex-1 space-y-3">
        <div class="flex items-center gap-3">
          <h4 class="font-semibold text-foreground">
            期間 {{ formatDateRange(period.startDate, period.endDate) }}
          </h4>
          <span
            :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass()]"
          >
            {{ getStatusLabel() }}
          </span>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <!-- Expected Amount -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">
                預期金額
              </p>
              <p class="font-semibold">
                {{ formatCurrency(period.expectedAmount, period.currency) }}
              </p>
            </div>
          </div>

          <!-- Matched Amount -->
          <div class="flex items-center gap-2">
            <svg
              class="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">
                已匹配金額
              </p>
              <p class="font-semibold">
                {{ formatCurrency(period.actualAmount || 0, period.currency) }}
              </p>
            </div>
          </div>

          <!-- Variance -->
          <div class="flex items-center gap-2">
            <svg
              :class="['h-4 w-4', getVarianceColor()]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="getVariance() > 0"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
              <path
                v-else-if="getVariance() < 0"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 12H4"
              />
            </svg>
            <div>
              <p class="text-xs text-muted-foreground">
                差異
              </p>
              <p :class="['font-semibold', getVarianceTextColor()]">
                {{ formatVariance() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Matched Records -->
        <div
          v-if="period.matchedRecords && period.matchedRecords.length > 0"
          class="space-y-2"
        >
          <h5 class="text-sm font-medium text-foreground">
            匹配記錄 ({{ period.matchedRecords.length }})
          </h5>
          <div class="space-y-2 max-h-32 overflow-y-auto">
            <div
              v-for="match in period.matchedRecords"
              :key="match.recordId._id"
              class="rounded-md bg-muted/50 p-3 text-sm space-y-2"
            >
              <!-- 記錄名稱與金額 (主要行) -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-foreground truncate">
                    {{ match.recordId?.description || `收入記錄 ${match.recordId?._id?.slice(-6) || ''}` }}
                  </p>
                  <div class="flex items-center gap-1 mt-1">
                    <div
                      v-if="match.recordId?.tags && match.recordId.tags.length > 0"
                      class="flex items-center gap-1"
                    >
                      <svg
                        class="w-3 h-3 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span class="text-xs text-muted-foreground truncate">
                        {{ match.recordId.tags.slice(0, 2).join(', ') }}{{ match.recordId.tags.length > 2 ? '...' : '' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="font-semibold text-foreground">
                    {{ formatCurrency(match.matchedAmount || match.recordId?.amount || 0, period.currency) }}
                  </p>
                </div>
              </div>

              <!-- 詳細資訊 (次要行) -->
              <div class="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-muted">
                <div class="flex items-center gap-2">
                  <span>{{ match.recordId?.date ? formatDate(match.recordId.date) : '日期未知' }}</span>
                  <span>•</span>
                  <span>信心度: {{ Math.round((match.confidence || 0) * 100) }}%</span>
                </div>
                <div class="flex items-center gap-1">
                  <div
                    :class="[
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                      match.isManual ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800',
                    ]"
                  >
                    {{ match.isManual ? '手動' : '自動' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Matches -->
        <div
          v-else
          class="rounded-md bg-muted/30 p-3 text-center"
        >
          <svg
            class="mx-auto h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="mt-1 text-sm text-muted-foreground">
            尚無匹配記錄
          </p>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">完成度</span>
            <span class="font-medium">{{ getCompletionRate() }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-muted">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="getProgressBarColor()"
              :style="{ width: `${getCompletionRate()}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="ml-4 flex flex-col gap-2">
        <div class="relative">
          <button
            class="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="toggleDropdown"
          >
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          <div
            v-if="showDropdown"
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="py-1">
              <button
                class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                @click="handleArchiveRecord"
              >
                <svg
                  class="mr-3 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                手動歸檔記錄
              </button>
              <button
                class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                @click="handleViewMatches"
              >
                <svg
                  class="mr-3 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                檢視匹配詳情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Info -->
    <div class="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
      <div class="flex items-center gap-1">
        <svg
          class="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>建立: {{ formatDate(period.createdAt) }}</span>
      </div>
      <div
        v-if="period.updatedAt !== period.createdAt"
        class="flex items-center gap-1"
      >
        <svg
          class="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>更新: {{ formatDate(period.updatedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomePeriod } from '~/lib/models/IncomePeriod'

interface Props {
  period: IncomePeriod
}

interface Emits {
  'archive-record': [period: IncomePeriod]
  'view-matches': [period: IncomePeriod]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const showDropdown = ref(false)

// Composables
const { formatCurrency } = useCurrency()
const { formatDate } = useDateFormat()

// Computed

function getStatusLabel(): string {
  const completion = getCompletionRate()
  if (completion >= 90) return '已完成'
  if (completion >= 50) return '部分匹配'
  if (completion > 0) return '少量匹配'
  return '未匹配'
}

function getCompletionRate(): number {
  if (!props.period.expectedAmount || props.period.expectedAmount === 0) return 0
  const actualAmount = props.period.actualAmount || 0
  return Math.min(Math.round((actualAmount / props.period.expectedAmount) * 100), 100)
}

function getVariance(): number {
  const expected = props.period.expectedAmount || 0
  const actual = props.period.actualAmount || 0
  return actual - expected
}

function getVarianceColor(): string {
  const variance = getVariance()
  if (variance > 0) return 'text-green-600'
  if (variance < 0) return 'text-red-600'
  return 'text-muted-foreground'
}

function getVarianceTextColor(): string {
  const variance = getVariance()
  if (variance > 0) return 'text-green-600'
  if (variance < 0) return 'text-red-600'
  return 'text-muted-foreground'
}

function getProgressBarColor(): string {
  const completion = getCompletionRate()
  if (completion >= 90) return 'bg-green-500'
  if (completion >= 50) return 'bg-yellow-500'
  if (completion > 0) return 'bg-orange-500'
  return 'bg-gray-400'
}

function formatVariance(): string {
  const variance = getVariance()
  const sign = variance > 0 ? '+' : ''
  return `${sign}${formatCurrency(Math.abs(variance), props.period.currency)}`
}

function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

function getStatusBadgeClass(): string {
  const completion = getCompletionRate()
  if (completion >= 90) return 'bg-green-100 text-green-800'
  if (completion >= 50) return 'bg-yellow-100 text-yellow-800'
  if (completion > 0) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-800'
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function handleArchiveRecord() {
  showDropdown.value = false
  emit('archive-record', props.period)
}

function handleViewMatches() {
  showDropdown.value = false
  emit('view-matches', props.period)
}
</script>
