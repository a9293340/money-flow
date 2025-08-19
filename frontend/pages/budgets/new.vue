<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/budgets"
            class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回預算列表
          </NuxtLink>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mt-4">
          新增預算
        </h1>
        <p class="text-gray-600 mt-1">
          建立新的預算來追蹤您的支出
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow-sm border">
        <form
          class="p-6 space-y-6"
          @submit.prevent="handleSubmit"
        >
          <!-- 基本資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 預算名稱 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                預算名稱 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：2025年8月生活費預算"
                maxlength="100"
              >
              <p class="text-xs text-gray-500 mt-1">
                {{ form.name.length }}/100
              </p>
            </div>

            <!-- 預算金額 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                預算金額 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  v-model="form.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99999999"
                  required
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                >
              </div>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              預算描述
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="預算的詳細說明（選填）"
              maxlength="500"
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ (form.description || '').length }}/500
            </p>
          </div>

          <!-- 期間設定 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 期間類型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                期間類型
              </label>
              <select
                v-model="form.periodType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="handlePeriodTypeChange"
              >
                <option value="monthly">
                  每月
                </option>
                <option value="quarterly">
                  每季
                </option>
                <option value="yearly">
                  每年
                </option>
              </select>
            </div>

            <!-- 開始日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                開始日期 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.startDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="handleStartDateChange"
              >
            </div>

            <!-- 結束日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                結束日期
              </label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <p class="text-xs text-gray-500 mt-1">
                留空則根據期間類型自動計算
              </p>
            </div>
          </div>

          <!-- 期間預算計數器 -->
          <div
            v-if="form.startDate && form.periodType"
            class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 rounded-lg">
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
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-blue-900">
                    期間預算計數
                  </h4>
                  <p class="text-xs text-blue-600">
                    {{ formatPeriodType(form.periodType) }}期間已有預算
                  </p>
                </div>
              </div>

              <div class="text-right">
                <div class="flex items-center gap-2">
                  <span
                    v-if="isCheckingPeriod"
                    class="text-sm text-blue-600"
                  >
                    檢查中...
                  </span>
                  <div
                    v-else
                    class="flex items-center gap-1"
                  >
                    <span class="text-2xl font-bold text-blue-900">
                      {{ periodBudgetCount }}
                    </span>
                    <span class="text-sm text-blue-600">
                      / {{ maxBudgetsPerPeriod }}
                    </span>
                  </div>
                </div>
                <div
                  v-if="!isCheckingPeriod"
                  class="text-xs mt-1"
                  :class="{
                    'text-green-600': periodBudgetCount < maxBudgetsPerPeriod,
                    'text-red-600': periodBudgetCount >= maxBudgetsPerPeriod,
                  }"
                >
                  {{ periodBudgetCount >= maxBudgetsPerPeriod ? '已達上限' : `還可創建 ${maxBudgetsPerPeriod - periodBudgetCount} 筆` }}
                </div>
              </div>
            </div>
          </div>

          <!-- 分類選擇 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              適用分類（可選）
            </label>
            <div class="border border-gray-300 rounded-md p-3">
              <div
                v-if="isLoadingCategories"
                class="text-sm text-gray-500"
              >
                載入分類中...
              </div>
              <div
                v-else-if="expenseCategories.length === 0"
                class="text-sm text-gray-500"
              >
                沒有可用的支出分類
              </div>
              <div
                v-else
                class="space-y-2 max-h-40 overflow-y-auto"
              >
                <div
                  v-for="category in expenseCategories"
                  :key="category._id"
                  class="flex items-center"
                >
                  <input
                    v-model="form.categoryIds"
                    :value="category._id"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <label class="ml-2 text-sm text-gray-700 flex items-center">
                    <span class="mr-2">{{ category.icon }}</span>
                    {{ category.name }}
                  </label>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              選擇此預算要追蹤的支出分類，不選擇任何分類表示追蹤所有支出
            </p>
          </div>

          <!-- 進階設定 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 警告閾值 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                警告閾值 (%)
              </label>
              <input
                v-model.number="form.warningThreshold"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <p class="text-xs text-gray-500 mt-1">
                當支出達到預算的百分比時發出警告，預設為 80%
              </p>
            </div>

            <!-- 幣別 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                幣別
              </label>
              <select
                v-model="form.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TWD">
                  TWD (新台幣)
                </option>
                <option value="USD">
                  USD (美金)
                </option>
                <option value="EUR">
                  EUR (歐元)
                </option>
                <option value="JPY">
                  JPY (日圓)
                </option>
              </select>
            </div>
          </div>

          <!-- 重複預算設定 -->
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-purple-900 mb-4 flex items-center gap-2">
              <svg
                class="w-5 h-5"
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
              重複預算設定
            </h3>

            <div class="space-y-4">
              <!-- 是否為重複模板 -->
              <div>
                <div class="flex items-center">
                  <input
                    v-model="form.isTemplate"
                    type="checkbox"
                    class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    @change="handleTemplateChange"
                  >
                  <label class="ml-2 text-sm font-medium text-gray-700">
                    設為重複預算模板
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  啟用後，系統將根據設定頻率自動創建新的預算期間
                </p>
              </div>

              <!-- 重複頻率設定 -->
              <div
                v-if="form.isTemplate"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    重複頻率 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.templateFrequency"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    @change="checkTemplateCount"
                  >
                    <option value="monthly">
                      每月重複
                    </option>
                    <option value="quarterly">
                      每季重複
                    </option>
                    <option value="yearly">
                      每年重複
                    </option>
                  </select>
                  <p class="text-xs text-gray-500 mt-1">
                    選擇預算自動重複的時間間隔
                  </p>
                </div>

                <!-- 模板數量顯示 -->
                <div class="bg-white border border-purple-200 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-purple-900">
                        模板數量
                      </h4>
                      <p class="text-xs text-purple-600">
                        {{ formatPeriodType(form.templateFrequency) }}模板已創建
                      </p>
                    </div>
                    <div class="text-right">
                      <div class="flex items-center gap-1">
                        <span
                          v-if="isCheckingTemplates"
                          class="text-sm text-purple-600"
                        >
                          檢查中...
                        </span>
                        <div
                          v-else
                          class="flex items-center gap-1"
                        >
                          <span class="text-2xl font-bold text-purple-900">
                            {{ templateCount }}
                          </span>
                          <span class="text-sm text-purple-600">
                            / {{ maxTemplatesPerFrequency }}
                          </span>
                        </div>
                      </div>
                      <div
                        v-if="!isCheckingTemplates"
                        class="text-xs mt-1"
                        :class="{
                          'text-green-600': templateCount < maxTemplatesPerFrequency,
                          'text-red-600': templateCount >= maxTemplatesPerFrequency,
                        }"
                      >
                        {{ templateCount >= maxTemplatesPerFrequency ? '已達上限' : `還可創建 ${maxTemplatesPerFrequency - templateCount} 筆` }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 重複說明 -->
              <div
                v-if="form.isTemplate"
                class="bg-white border border-purple-200 rounded-lg p-3"
              >
                <h4 class="text-sm font-medium text-purple-900 mb-2">
                  自動生成說明
                </h4>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li>• <strong>每月重複</strong>：每月1日到月底最後一天</li>
                  <li>• <strong>每季重複</strong>：每季第一天到最後一天（Q1: 1-3月，Q2: 4-6月...）</li>
                  <li>• <strong>每年重複</strong>：每年1月1日到12月31日</li>
                  <li>• 系統會在新期間開始時自動創建預算，並重置統計數據</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 狀態設定 -->
          <div>
            <div class="flex items-center">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-700">
                立即啟用此預算
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              取消勾選將建立暫停狀態的預算，可之後手動啟用
            </p>
          </div>

          <!-- 表單按鈕 -->
          <div class="flex justify-end space-x-3 pt-6 border-t">
            <NuxtLink
              to="/budgets"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </NuxtLink>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :title="getSubmitButtonTitle()"
            >
              {{ getSubmitButtonText() }}
            </button>

            <!-- 上限提示 -->
            <div
              v-if="shouldShowLimitWarning()"
              class="mt-2 text-sm text-red-600 flex items-center gap-2"
            >
              <svg
                class="w-4 h-4"
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
              {{ getLimitWarningText() }}
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '新增預算',
  auth: true,
})

const { createBudget, isSubmitting, checkPeriodBudgetCount, formatPeriodType } = useBudgets()

// 表單資料
const form = ref({
  name: '',
  description: '',
  amount: '',
  currency: 'TWD',
  categoryIds: [] as string[],
  periodType: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
  startDate: '',
  endDate: '',
  warningThreshold: 80,
  isActive: true,

  // 重複預算設定
  isTemplate: false,
  templateFrequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
})

// 分類相關
const categories = ref<any[]>([])
const isLoadingCategories = ref(false)

// 期間預算計數器
const periodBudgetCount = ref(0)
const maxBudgetsPerPeriod = 5 // 實際預算上限為5個
const isCheckingPeriod = ref(false)

// 模板計數器
const templateCount = ref(0)
const maxTemplatesPerFrequency = 3 // 每個頻率最多3個模板
const isCheckingTemplates = ref(false)

// 計算屬性
const expenseCategories = computed(() =>
  categories.value.filter((category: any) => category.type === 'expense'),
)

const isFormValid = computed(() => {
  const basicValid = form.value.name.trim()
    && form.value.amount
    && Number(form.value.amount) > 0
    && form.value.startDate

  if (form.value.isTemplate) {
    // 模板驗證：需要頻率且未達模板上限
    return basicValid
      && form.value.templateFrequency
      && templateCount.value < maxTemplatesPerFrequency
  }
  else {
    // 實際預算驗證：未達期間上限
    return basicValid && periodBudgetCount.value < maxBudgetsPerPeriod
  }
})

// 檢查期間預算數量
const checkPeriodBudgets = async () => {
  if (!form.value.startDate || !form.value.periodType) return

  isCheckingPeriod.value = true
  try {
    const count = await checkPeriodBudgetCount(
      form.value.periodType,
      form.value.startDate,
      form.value.endDate,
    )
    periodBudgetCount.value = count
  }
  catch (error) {
    console.error('檢查期間預算數量失敗:', error)
    periodBudgetCount.value = 0
  }
  finally {
    isCheckingPeriod.value = false
  }
}

// 處理期間類型變更
const handlePeriodTypeChange = () => {
  if (form.value.startDate) {
    handleStartDateChange()
  }
  // 檢查期間預算數量
  checkPeriodBudgets()
}

// 處理開始日期變更
const handleStartDateChange = () => {
  if (!form.value.startDate) return

  const startDate = new Date(form.value.startDate)
  let endDate: Date

  switch (form.value.periodType) {
    case 'monthly':
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      break
    case 'quarterly': {
      const quarter = Math.floor(startDate.getMonth() / 3)
      endDate = new Date(startDate.getFullYear(), quarter * 3 + 3, 0)
      break
    }
    case 'yearly':
      endDate = new Date(startDate.getFullYear(), 11, 31)
      break
    default:
      return
  }

  form.value.endDate = endDate.toISOString().split('T')[0]

  // 檢查期間預算數量
  checkPeriodBudgets()
}

// 處理表單提交
const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const budgetData = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      amount: Number(form.value.amount),
      currency: form.value.currency,
      categoryIds: form.value.categoryIds,
      periodType: form.value.periodType,
      startDate: form.value.startDate,
      endDate: form.value.endDate || undefined,
      warningThreshold: form.value.warningThreshold,
      isActive: form.value.isActive,

      // 重複預算設定
      isTemplate: form.value.isTemplate,
      templateFrequency: form.value.isTemplate ? form.value.templateFrequency : undefined,
    }

    await createBudget(budgetData)

    // 跳轉回預算列表
    await navigateTo('/budgets')
  }
  catch (error) {
    console.error('建立預算失敗:', error)
    alert('建立預算失敗，請檢查輸入資料後重試')
  }
}

// 載入分類資料
const loadCategories = async () => {
  isLoadingCategories.value = true
  try {
    const response = await $fetch('/api/categories')
    categories.value = response.data.items || []
  }
  catch (error) {
    console.error('載入分類失敗:', error)
  }
  finally {
    isLoadingCategories.value = false
  }
}

// 檢查模板數量
const checkTemplateCount = async () => {
  if (!form.value.templateFrequency) return

  isCheckingTemplates.value = true
  try {
    const response = await fetch(`/api/budgets/templates?frequency=${form.value.templateFrequency}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    templateCount.value = result.data?.items?.length || 0
  }
  catch (error) {
    console.error('檢查模板數量失敗:', error)
    templateCount.value = 0
  }
  finally {
    isCheckingTemplates.value = false
  }
}

// 處理模板切換
const handleTemplateChange = () => {
  if (form.value.isTemplate) {
    // 啟用模板時檢查數量
    checkTemplateCount()
  }
  else {
    // 停用模板時重置計數
    templateCount.value = 0
    // 重新檢查期間預算
    checkPeriodBudgets()
  }
}

// 獲取提交按鈕標題
const getSubmitButtonTitle = () => {
  if (form.value.isTemplate) {
    return templateCount.value >= maxTemplatesPerFrequency
      ? `${formatPeriodType(form.value.templateFrequency)}模板已達上限（${maxTemplatesPerFrequency}筆）`
      : ''
  }
  else {
    return periodBudgetCount.value >= maxBudgetsPerPeriod
      ? `此期間已達預算上限（${maxBudgetsPerPeriod}筆）`
      : ''
  }
}

// 獲取提交按鈕文字
const getSubmitButtonText = () => {
  if (isSubmitting.value) {
    return form.value.isTemplate ? '建立模板中...' : '建立預算中...'
  }

  if (form.value.isTemplate) {
    return templateCount.value >= maxTemplatesPerFrequency
      ? '已達模板上限'
      : '建立重複模板'
  }
  else {
    return periodBudgetCount.value >= maxBudgetsPerPeriod
      ? '已達期間上限'
      : '建立預算'
  }
}

// 是否顯示上限警告
const shouldShowLimitWarning = () => {
  if (form.value.isTemplate) {
    return templateCount.value >= maxTemplatesPerFrequency && form.value.templateFrequency
  }
  else {
    return periodBudgetCount.value >= maxBudgetsPerPeriod && form.value.startDate
  }
}

// 獲取上限警告文字
const getLimitWarningText = () => {
  if (form.value.isTemplate) {
    return `${formatPeriodType(form.value.templateFrequency)}重複模板已達數量上限（${maxTemplatesPerFrequency}筆）`
  }
  else {
    return `此${formatPeriodType(form.value.periodType)}期間已達預算數量上限（${maxBudgetsPerPeriod}筆）`
  }
}

// 頁面載入時設定預設值
onMounted(() => {
  // 設定預設開始日期為今天
  const today = new Date()
  form.value.startDate = today.toISOString().split('T')[0]
  handleStartDateChange()

  // 載入分類資料
  loadCategories()

  // 初始檢查模板數量
  checkTemplateCount()
})
</script>
