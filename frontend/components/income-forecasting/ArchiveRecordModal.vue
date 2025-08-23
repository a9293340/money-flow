<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          手動歸檔收入記錄
        </h3>
      </div>

      <div class="px-6 py-4 space-y-6">
        <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div class="flex items-start gap-3">
            <svg
              class="h-5 w-5 text-blue-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
                什麼是手動歸檔？
              </p>
              <p>手動歸檔可以將特定的收入記錄關聯到預測期間，用於未被自動匹配到的記錄。</p>
            </div>
          </div>
        </div>

        <!-- Period Selection (if no period specified) -->
        <div
          v-if="!periodId"
          class="space-y-3"
        >
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">選擇期間 <span class="text-red-500">*</span></label>
            <select
              v-model="form.periodId"
              :disabled="isSubmitting || isLoadingPeriods"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                選擇要歸檔到的期間
              </option>
              <option
                v-for="option in periodOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Record Selection -->
        <div class="space-y-3">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">搜尋收入記錄</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜尋記錄描述、金額或日期..."
                :disabled="isSubmitting"
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                @input="debounceSearch"
              >
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-sm font-semibold text-foreground">
              可歸檔的記錄
            </h4>

            <div
              v-if="isLoadingRecords"
              class="space-y-2"
            >
              <div
                v-for="i in 3"
                :key="i"
                class="animate-pulse rounded-lg border border-border p-3"
              >
                <div class="flex justify-between">
                  <div class="space-y-1">
                    <div class="h-4 w-32 rounded bg-muted" />
                    <div class="h-3 w-48 rounded bg-muted" />
                  </div>
                  <div class="h-4 w-20 rounded bg-muted" />
                </div>
              </div>
            </div>

            <div
              v-else-if="availableRecords.length === 0"
              class="rounded-lg border border-border p-6 text-center"
            >
              <svg
                class="mx-auto h-8 w-8 text-gray-400"
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
              <p class="mt-2 text-sm text-muted-foreground">
                {{ searchQuery ? '找不到符合條件的記錄' : '沒有可歸檔的收入記錄' }}
              </p>
            </div>

            <div
              v-else
              class="max-h-64 overflow-y-auto space-y-2"
            >
              <div
                v-for="record in availableRecords"
                :key="record._id"
                class="rounded-lg border border-border p-3 cursor-pointer transition-colors hover:bg-muted/50"
                :class="{ 'bg-primary/10 border-primary': form.recordId === record._id }"
                @click="selectRecord(record)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <input
                        type="radio"
                        :checked="form.recordId === record._id"
                        :value="record._id"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        @change="form.recordId = record._id"
                      >
                      <div>
                        <p class="font-medium">
                          {{ record.description || '無描述' }}
                        </p>
                        <p class="text-sm text-muted-foreground">
                          {{ formatDate(record.date) }} •
                          {{ getCategoryName(record.category) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">
                      {{ formatCurrency(record.amount, record.currency) }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ record.account?.name || '未知帳戶' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Record Preview -->
        <div
          v-if="selectedRecord"
          class="rounded-lg bg-green-50 border border-green-200 p-4"
        >
          <h4 class="text-sm font-semibold text-green-800 mb-2">
            已選擇記錄
          </h4>
          <div class="text-sm text-green-700">
            <p><strong>描述:</strong> {{ selectedRecord.description || '無描述' }}</p>
            <p><strong>金額:</strong> {{ formatCurrency(selectedRecord.amount, selectedRecord.currency) }}</p>
            <p><strong>日期:</strong> {{ formatDate(selectedRecord.date) }}</p>
            <p><strong>分類:</strong> {{ getCategoryName(selectedRecord.category) }}</p>
          </div>
        </div>

        <!-- Confidence Preview -->
        <div
          v-if="confidenceScore !== null"
          class="rounded-lg bg-orange-50 border border-orange-200 p-4"
        >
          <h4 class="text-sm font-semibold text-orange-800 mb-2">
            匹配信心度
          </h4>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="h-2 rounded-full bg-orange-200">
                <div
                  class="h-2 rounded-full bg-orange-500 transition-all duration-500"
                  :style="{ width: `${confidenceScore * 100}%` }"
                />
              </div>
            </div>
            <span class="text-sm font-medium text-orange-700">
              {{ Math.round(confidenceScore * 100) }}%
            </span>
          </div>
          <p class="mt-1 text-xs text-orange-600">
            手動歸檔的記錄會被標記為高信心度匹配
          </p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div class="flex justify-end gap-3">
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="closeModal"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="!isFormValid || isSubmitting"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="archiveRecord"
          >
            <svg
              v-if="isSubmitting"
              class="-ml-1 mr-2 h-4 w-4 animate-spin"
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
                d="m100 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm-90.288 0c0 22.249 18.039 40.288 40.288 40.288s40.288-18.039 40.288-40.288-18.039-40.288-40.288-40.288-40.288 18.039-40.288 40.288z"
              />
            </svg>
            歸檔記錄
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from '~/utils/debounce'

interface Props {
  modelValue: boolean
  forecastingId: string
  periodId?: string
}

interface Emits {
  'update:modelValue': [value: boolean]
  'success': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isSubmitting = ref(false)
const isLoadingRecords = ref(false)
const isLoadingPeriods = ref(false)
const searchQuery = ref('')

// Form data
const form = reactive({
  recordId: '',
  periodId: props.periodId || '',
})

// Data
const availableRecords = ref<any[]>([])
const periodOptions = ref<Array<{ label: string, value: string }>>([])
const selectedRecord = ref<any>(null)
const confidenceScore = ref<number | null>(null)

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
  return form.recordId !== '' && form.periodId !== ''
})

// Debounced search
const debounceSearch = debounce(() => {
  loadAvailableRecords()
}, 500)

// Methods
async function loadPeriods() {
  if (props.periodId) return // If period is specified, no need to load

  try {
    isLoadingPeriods.value = true
    const response = await $fetch(`/api/income-forecasting/${props.forecastingId}/periods`) as {
      success: boolean
      data: {
        periods: Array<{
          _id: string
          startDate: string
          endDate: string
          expectedAmount: number
        }>
      }
    }

    periodOptions.value = response.data.periods.map((period: any) => ({
      label: `${formatDate(period.startDate)} - ${formatDate(period.endDate)} (${formatCurrency(period.expectedAmount, 'TWD')})`,
      value: period._id,
    }))
  }
  catch (error) {
    console.error('載入期間失敗:', error)
    toast.add({
      title: '載入失敗',
      description: '無法載入期間列表',
      color: 'red',
    })
  }
  finally {
    isLoadingPeriods.value = false
  }
}

async function loadAvailableRecords() {
  try {
    isLoadingRecords.value = true

    const params = new URLSearchParams({
      type: 'income',
      unmatched: 'true',
      ...(searchQuery.value && { search: searchQuery.value }),
    })

    const response = await $fetch(`/api/records?${params}`) as {
      success: boolean
      data: any[]
    }

    availableRecords.value = response.data
  }
  catch (error) {
    console.error('載入可歸檔記錄失敗:', error)
    toast.add({
      title: '載入失敗',
      description: '無法載入可歸檔記錄',
      color: 'red',
    })
  }
  finally {
    isLoadingRecords.value = false
  }
}

function selectRecord(record: any) {
  form.recordId = record._id
  selectedRecord.value = record
  calculateConfidence()
}

function calculateConfidence() {
  // Simplified confidence calculation
  // In reality, this would call the backend API or use the same logic
  confidenceScore.value = 0.85 // High confidence for manual archiving
}

async function archiveRecord() {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const response = await $fetch(`/api/income-forecasting/${props.forecastingId}/archive`, {
      method: 'POST',
      body: {
        recordId: form.recordId,
        periodId: form.periodId || undefined,
      },
    }) as {
      success: boolean
      message: string
    }

    toast.add({
      title: '歸檔成功',
      description: response.message,
      color: 'green',
    })

    emit('success')
  }
  catch (error: any) {
    console.error('歸檔失敗:', error)
    toast.add({
      title: '歸檔失敗',
      description: error.data?.message || '歸檔記錄失敗，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isSubmitting.value = false
  }
}

function getCategoryName(category: any): string {
  if (typeof category === 'string') return category
  return category?.name || '未知分類'
}

function resetForm() {
  form.recordId = ''
  if (!props.periodId) {
    form.periodId = ''
  }
  selectedRecord.value = null
  confidenceScore.value = null
  searchQuery.value = ''
}

function closeModal() {
  if (isSubmitting.value) return
  isOpen.value = false
  resetForm()
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (!props.periodId) {
      loadPeriods()
    }
    loadAvailableRecords()
  }
  else {
    resetForm()
  }
})

watch(() => form.periodId, () => {
  if (selectedRecord.value) {
    calculateConfidence()
  }
})
</script>
