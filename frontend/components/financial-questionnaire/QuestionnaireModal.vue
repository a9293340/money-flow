<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      />
      
      <!-- Modal 內容 -->
      <div class="inline-block align-middle bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:w-full sm:max-w-6xl">
    <div class="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <!-- 頂部導航 -->
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">
            AI 財務規劃評估問卷
          </h1>
          <button
            class="text-gray-400 hover:text-gray-600 p-2"
            type="button"
            @click="$emit('close')"
          >
            <svg
              class="w-6 h-6"
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
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 進度指示器 -->
          <div class="lg:col-span-1">
            <ProgressIndicator
              :current-step="currentStep"
              :total-steps="totalSteps"
              :completion-percentage="completionPercentage"
              :validation-errors="validationErrors"
            />
          </div>

          <!-- 問卷內容 -->
          <div class="lg:col-span-2">
            <QuestionStep
              :current-step="currentStep"
              :total-steps="totalSteps"
              :step-title="currentStepConfig.title"
              :step-description="currentStepConfig.description"
              :can-proceed="canProceedToNextStep"
              :is-last-step="isLastStep"
              @next-step="nextStep"
              @previous-step="previousStep"
              @complete="completeQuestionnaire"
            >
              <!-- Step 1: 基本資料 -->
              <div
                v-if="currentStep === 1"
                class="space-y-4"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      年齡
                    </label>
                    <input
                      v-model.number="financialProfile.basicInfo.age"
                      type="number"
                      min="18"
                      max="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="請輸入年齡"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      職業
                    </label>
                    <input
                      v-model="financialProfile.basicInfo.occupation"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：軟體工程師"
                    >
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      月收入 (NT$)
                    </label>
                    <input
                      v-model.number="financialProfile.basicInfo.monthlyIncome"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      月支出 (NT$)
                    </label>
                    <input
                      v-model.number="financialProfile.basicInfo.monthlyExpenses"
                      type="number"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="35000"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    目前儲蓄 (NT$)
                  </label>
                  <input
                    v-model.number="financialProfile.basicInfo.currentSavings"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    負債狀況
                  </label>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.basicInfo.hasDebt"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">我有負債</span>
                    </label>

                    <div v-if="financialProfile.basicInfo.hasDebt">
                      <input
                        v-model.number="financialProfile.basicInfo.debtAmount"
                        type="number"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="負債總額"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: 風險評估 -->
              <div
                v-else-if="currentStep === 2"
                class="space-y-6"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    風險承受度
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.riskAssessment.riskTolerance"
                        value="conservative"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">保守型 - 優先保本，可接受較低報酬</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.riskAssessment.riskTolerance"
                        value="moderate"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">穩健型 - 平衡風險與報酬</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.riskAssessment.riskTolerance"
                        value="aggressive"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">積極型 - 追求高報酬，可承受較高風險</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    投資經驗
                  </label>
                  <select
                    v-model="financialProfile.riskAssessment.investmentExperience"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      請選擇投資經驗
                    </option>
                    <option value="none">
                      完全沒有經驗
                    </option>
                    <option value="beginner">
                      初學者（1-2年）
                    </option>
                    <option value="intermediate">
                      有一定經驗（3-5年）
                    </option>
                    <option value="advanced">
                      經驗豐富（5年以上）
                    </option>
                  </select>
                </div>
              </div>

              <!-- Step 3: 財務目標 -->
              <div
                v-else-if="currentStep === 3"
                class="space-y-4"
              >
                <p class="text-sm text-gray-600">
                  請設定您的主要財務目標（可設定多個）
                </p>

                <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p class="text-sm text-blue-800">
                    💡 在 Phase 1 中，這部分僅作為展示。完整的目標設定功能將在後續版本實作。
                  </p>
                </div>

                <div class="space-y-3">
                  <label class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    >
                    <span class="ml-3 text-sm text-gray-900">建立緊急基金</span>
                  </label>
                  <label class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    >
                    <span class="ml-3 text-sm text-gray-900">購房頭期款</span>
                  </label>
                  <label class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    >
                    <span class="ml-3 text-sm text-gray-900">退休規劃</span>
                  </label>
                </div>
              </div>

              <!-- Step 4: 偏好設定 -->
              <div
                v-else-if="currentStep === 4"
                class="space-y-6"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    預算管理風格
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.lifestyle.budgetingStyle"
                        value="strict"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">嚴格控制 - 精確規劃每筆支出</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.lifestyle.budgetingStyle"
                        value="flexible"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">彈性管理 - 大概控制，允許調整</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.lifestyle.budgetingStyle"
                        value="casual"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">輕鬆記錄 - 主要用於追蹤消費</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    儲蓄偏好
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.lifestyle.savingPreference"
                        value="automatic"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">自動儲蓄 - 薪水入帳後自動轉存</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="financialProfile.lifestyle.savingPreference"
                        value="manual"
                        type="radio"
                        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      >
                      <span class="ml-2 text-sm text-gray-900">手動儲蓄 - 根據當月狀況決定存款</span>
                    </label>
                  </div>
                </div>
              </div>
            </QuestionStep>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IFinancialProfile, QuestionnaireStep } from '~/lib/models/financial-profile'

// =========================
// Props & Emits
// =========================

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  complete: [profile: IFinancialProfile]
}>()

// =========================
// State
// =========================

const currentStep = ref(1)
const totalSteps = ref(4)

// 預設問卷資料
const financialProfile = ref<IFinancialProfile>({
  basicInfo: {
    age: 0,
    occupation: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    currentSavings: 0,
    hasDebt: false,
    debtAmount: 0,
    dependents: 0,
  },
  riskAssessment: {
    riskTolerance: 'moderate',
    investmentExperience: 'none',
    timeHorizon: 'medium',
    volatilityComfort: 3,
  },
  goals: [],
  lifestyle: {
    budgetingStyle: 'flexible',
    savingPreference: 'automatic',
    spendingPriorities: [],
    financialConcerns: [],
  },
})

// 步驟設定
const stepConfigs: QuestionnaireStep[] = [
  {
    id: 1,
    title: '基本財務資料',
    description: '告訴我們您的基本財務狀況',
    section: 'basic',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 2,
    title: '風險偏好評估',
    description: '了解您的投資風險承受能力',
    section: 'risk',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 3,
    title: '財務目標設定',
    description: '設定您的短中長期財務目標',
    section: 'goals',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 4,
    title: '生活偏好設定',
    description: '了解您的消費和儲蓄習慣',
    section: 'lifestyle',
    isCompleted: false,
    isValid: false,
  },
]

// =========================
// Computed
// =========================

const currentStepConfig = computed(() => {
  return stepConfigs[currentStep.value - 1]
})

const completionPercentage = computed(() => {
  return (currentStep.value / totalSteps.value) * 100
})

const isLastStep = computed(() => {
  return currentStep.value === totalSteps.value
})

const canProceedToNextStep = computed(() => {
  const basic = financialProfile.value.basicInfo
  const risk = financialProfile.value.riskAssessment
  const lifestyle = financialProfile.value.lifestyle

  switch (currentStep.value) {
    case 1:
      return basic.age > 0
        && basic.occupation.trim() !== ''
        && basic.monthlyIncome > 0
        && basic.monthlyExpenses > 0
    case 2:
      return !!(risk.riskTolerance && risk.investmentExperience)
    case 3:
      return true // Phase 1 簡化，直接允許通過
    case 4:
      return !!(lifestyle.budgetingStyle && lifestyle.savingPreference)
    default:
      return false
  }
})

const validationErrors = computed(() => {
  const errors: string[] = []
  const basic = financialProfile.value.basicInfo
  const risk = financialProfile.value.riskAssessment
  const lifestyle = financialProfile.value.lifestyle

  switch (currentStep.value) {
    case 1:
      if (!basic.age || basic.age < 18) errors.push('請輸入有效年齡')
      if (!basic.occupation.trim()) errors.push('請輸入職業')
      if (!basic.monthlyIncome || basic.monthlyIncome <= 0) errors.push('請輸入月收入')
      if (!basic.monthlyExpenses || basic.monthlyExpenses <= 0) errors.push('請輸入月支出')
      break
    case 2:
      if (!risk.riskTolerance) errors.push('請選擇風險承受度')
      if (!risk.investmentExperience) errors.push('請選擇投資經驗')
      break
    case 4:
      if (!lifestyle.budgetingStyle) errors.push('請選擇預算管理風格')
      if (!lifestyle.savingPreference) errors.push('請選擇儲蓄偏好')
      break
  }

  return errors
})

// =========================
// Methods
// =========================

const nextStep = () => {
  if (canProceedToNextStep.value && currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeQuestionnaire = () => {
  if (canProceedToNextStep.value) {
    // 添加完成時間
    financialProfile.value.completionDate = new Date()
    financialProfile.value.lastUpdated = new Date()

    emit('complete', financialProfile.value)
  }
}
</script>
