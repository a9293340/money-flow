<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        :class="{ 'pointer-events-none': isSubmitting }"
        @click="closeModal"
      />
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              生成追蹤期間
            </h3>
          </div>

          <div class="space-y-6">
            <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div class="flex items-start gap-3">
                <svg
                  class="h-5 w-5 text-blue-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-semibold mb-1">
                    什麼是追蹤期間？
                  </p>
                  <p>追蹤期間會根據預測項目的頻率設定，自動計算每個期間的預期收入時間點，用於後續的智能匹配功能。</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">生成期間數量 <span class="text-red-500">*</span></label>
              <input
                v-model.number="form.count"
                type="number"
                min="1"
                max="12"
                placeholder="3"
                :disabled="isSubmitting"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
              <p class="mt-1 text-xs text-gray-500">
                建議一次生成 3-6 個期間，最多可生成 12 個期間
              </p>
            </div>

            <div
              v-if="forecastingInfo"
              class="space-y-3"
            >
              <h4 class="text-sm font-semibold text-gray-900">
                預測項目資訊
              </h4>
              <div class="rounded-lg bg-gray-50 p-4 space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">項目名稱:</span>
                  <span class="text-sm font-medium">{{ forecastingInfo.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">頻率:</span>
                  <span class="text-sm font-medium">{{ getFrequencyLabel(forecastingInfo.frequency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">預期金額:</span>
                  <span class="text-sm font-medium">{{ formatCurrency(forecastingInfo.expectedAmount, forecastingInfo.currency) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">現有期間數:</span>
                  <span class="text-sm font-medium">{{ forecastingInfo.statistics?.totalPeriods || 0 }} 個</span>
                </div>
              </div>
            </div>

            <div
              v-if="previewPeriods.length > 0"
              class="space-y-3"
            >
              <h4 class="text-sm font-semibold text-gray-900">
                預覽將生成的期間
              </h4>
              <div class="max-h-60 overflow-y-auto space-y-2">
                <div
                  v-for="(period, index) in previewPeriods"
                  :key="index"
                  class="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-sm font-medium">
                        期間 {{ index + 1 }}
                      </p>
                      <p class="text-xs text-gray-600">
                        {{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold">
                        {{ formatCurrency(period.expectedAmount, period.currency) }}
                      </p>
                      <p class="text-xs text-gray-600">
                        預期收入
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="lastGenerationResult"
              class="rounded-lg bg-green-50 border border-green-200 p-4"
            >
              <div class="flex items-start gap-3">
                <svg
                  class="h-5 w-5 text-green-600 mt-0.5"
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
                <div class="text-sm text-green-800">
                  <p class="font-semibold mb-1">
                    上次生成結果
                  </p>
                  <p>成功生成了 {{ lastGenerationResult.generatedCount }} 個追蹤期間</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            :disabled="!isFormValid || isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            @click="generatePeriods"
          >
            <svg
              v-if="isSubmitting"
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
            生成期間
          </button>
          <button
            :disabled="isSubmitting"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            @click="closeModal"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomeForecastingItem } from '~/lib/models/IncomeForecasting'

interface Props {
  modelValue: boolean
  forecastingId?: string
}

interface Emits {
  'update:modelValue': [value: boolean]
  'success': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isSubmitting = ref(false)
const forecastingInfo = ref<IncomeForecastingItem | null>(null)
const previewPeriods = ref<Array<{
  startDate: string
  endDate: string
  expectedAmount: number
  currency: string
}>>([])
const lastGenerationResult = ref<{ generatedCount: number } | null>(null)

// Form data
const form = reactive({
  count: 3,
})

// Composables
const toast = {
  add: (options: { title: string, description?: string, color?: string }) => {
    // Simple console log for now
    console.log('Toast:', options.title, options.description)
  },
}
const { formatCurrency } = useCurrency()
const { formatDate } = useDateFormat()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const isFormValid = computed(() => {
  return form.count >= 1 && form.count <= 12
})

// Methods
async function loadForecastingInfo() {
  if (!props.forecastingId) return

  try {
    // 使用 any 類型避免複雜的路由類型推斷問題
    const response: any = await $fetch(`/api/income-forecasting/${props.forecastingId}`)
    
    // 根據實際 API 回應結構調整
    if (response.success && response.data) {
      forecastingInfo.value = response.data.forecasting || response.data
      generatePreview()
    }
  }
  catch (error) {
    console.error('載入預測項目資訊失敗:', error)
    toast.add({
      title: '載入失敗',
      description: '無法載入預測項目資訊',
      color: 'red',
    })
  }
}

function generatePreview() {
  if (!forecastingInfo.value) return

  previewPeriods.value = []
  const { frequency, expectedAmount, currency, startDate } = forecastingInfo.value

  // 計算下一個期間的開始日期
  const lastPeriodEnd = new Date(startDate) // 這裡應該根據現有期間計算，簡化處理

  for (let i = 0; i < form.count; i++) {
    const periodStart = new Date(lastPeriodEnd)
    const periodEnd = new Date(lastPeriodEnd)

    // 根據頻率計算期間結束日期
    switch (frequency) {
      case 'daily':
        periodEnd.setDate(periodStart.getDate() + 1)
        break
      case 'weekly':
        periodEnd.setDate(periodStart.getDate() + 7)
        break
      case 'monthly':
        periodEnd.setMonth(periodStart.getMonth() + 1)
        break
      case 'quarterly':
        periodEnd.setMonth(periodStart.getMonth() + 3)
        break
      case 'yearly':
        periodEnd.setFullYear(periodStart.getFullYear() + 1)
        break
    }

    previewPeriods.value.push({
      startDate: periodStart.toISOString(),
      endDate: periodEnd.toISOString(),
      expectedAmount,
      currency,
    })

    // 下一期間的開始日期
    lastPeriodEnd.setTime(periodEnd.getTime())
  }
}

async function generatePeriods() {
  if (!props.forecastingId || !isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const response = await $fetch(`/api/income-forecasting/${props.forecastingId}/generate-periods`, {
      method: 'POST',
      body: {
        count: form.count,
      },
    })
    const typedResponse = response as {
      success: boolean
      data: {
        generatedCount: number
        periods: any[]
        forecasting: IncomeForecastingItem
      }
      message: string
    }

    lastGenerationResult.value = {
      generatedCount: typedResponse.data.generatedCount,
    }

    toast.add({
      title: '生成成功',
      description: typedResponse.message,
      color: 'green',
    })

    emit('success')
  }
  catch (error: any) {
    console.error('生成期間失敗:', error)
    toast.add({
      title: '生成失敗',
      description: error.data?.message || '生成追蹤期間失敗，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isSubmitting.value = false
  }
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

function closeModal() {
  if (isSubmitting.value) return
  isOpen.value = false
  lastGenerationResult.value = null
  previewPeriods.value = []
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.forecastingId) {
    loadForecastingInfo()
  }
})

watch(() => form.count, () => {
  if (forecastingInfo.value) {
    generatePreview()
  }
})
</script>
